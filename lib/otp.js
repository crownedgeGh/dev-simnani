import crypto from "crypto";
import axios from "axios";
import dbConnect from "@/lib/mongodb";
import Otp from "@/models/Otp";

// Flip to true to actually call apitxt.com and verify real codes. While
// false, sendOtp skips the gateway call (no SMS cost) and verifyOtp accepts
// any value typed into the OTP field.
export const OTP_LIVE = false;

// apitxt.com's own auto-generated OTP defaults to 4 digits (min 4, max 8) —
// since we generate and hand it our own code, this just needs to match
// whatever the frontend renders.
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH || "4", 10);
const OTP_TTL_MINUTES = 5;
const OTP_TTL_MS = OTP_TTL_MINUTES * 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function generateOtp() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

/**
 * sendOtp — generates a fresh OTP, stores its hash against the mobile
 * number, and dispatches it via the apitxt.com SMS gateway. Replaces any
 * still-pending OTP for the same mobile + purpose.
 */
export async function sendOtp(mobile, purpose) {
  if (!OTP_LIVE) {
    console.log(`OTP_LIVE is false — skipping real SMS to ${mobile} (${purpose}).`);
    return;
  }

  await dbConnect();

  const otp = generateOtp();
  await Otp.deleteMany({ mobile, purpose });
  await Otp.create({
    mobile,
    purpose,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  // Per https://apitxt.com/apiDoc/otp — only authkey + mobile are actually
  // required; pe_id/template_id (DLT) and sender are optional there, so we
  // only include them when configured. Sending an unset placeholder string
  // as a real param value is worse than omitting it — apitxt would try to
  // match it against a real DLT template and reject the request outright.
  const params = {
    authkey: process.env.OTP_GATEWAY_AUTHKEY,
    // mobile must include the country code (e.g. 919999999990).
    mobile: `91${mobile}`,
    otp,
    otp_expire: OTP_TTL_MINUTES,
    message: `Your Simnani Estate login OTP is {otp}. Valid for ${OTP_TTL_MINUTES} minutes.`,
  };
  if (process.env.OTP_GATEWAY_SENDER) params.sender = process.env.OTP_GATEWAY_SENDER;
  if (process.env.OTP_GATEWAY_PE_ID) params.pe_id = process.env.OTP_GATEWAY_PE_ID;
  if (process.env.OTP_GATEWAY_TEMPLATE_ID) params.template_id = process.env.OTP_GATEWAY_TEMPLATE_ID;

  const res = await axios.get("https://apitxt.com/api/sendOTP", { params, timeout: 10000 });

  // apitxt.com replies HTTP 200 even on failure, putting the real result
  // in the body — log it so delivery issues stay debuggable. The "status"
  // field isn't consistently a numeric 200 across their endpoints, so treat
  // a "success" message as success too rather than only trusting the code.
  console.log("apitxt.com sendOTP response:", res.data);
  const message = String(res.data?.message || "").toLowerCase();
  const success = Number(res.data?.status) === 200 || message.includes("success");
  if (!success) {
    throw new Error(res.data?.message || "SMS gateway rejected the request");
  }
}

/**
 * verifyOtp — checks the submitted code against the stored hash. Consumes
 * the record on success; increments attempts and rejects after too many
 * wrong tries so a code can't be brute-forced within its 5-minute window.
 */
export async function verifyOtp(mobile, purpose, otp) {
  if (!OTP_LIVE) return { valid: true };

  await dbConnect();

  const record = await Otp.findOne({ mobile, purpose }).sort({ createdAt: -1 });
  if (!record) {
    return { valid: false, error: "OTP expired or not requested. Please resend." };
  }
  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await Otp.deleteOne({ _id: record._id });
    return { valid: false, error: "Too many incorrect attempts. Please resend the OTP." };
  }
  if (record.otpHash !== hashOtp(otp)) {
    record.attempts += 1;
    await record.save();
    return { valid: false, error: "Incorrect OTP. Please try again." };
  }

  await Otp.deleteOne({ _id: record._id });
  return { valid: true };
}
