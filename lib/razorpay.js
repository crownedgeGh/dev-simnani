import Razorpay from "razorpay";

let instance = null;

export function getRazorpay() {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
}
