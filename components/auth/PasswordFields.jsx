"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import FormField from "./FormField";
import { inputClass } from "./inputStyles";

export default function PasswordFields({ password, confirmPassword, onPasswordChange, onConfirmPasswordChange }) {
  const [show, setShow] = useState(false);

  return (
    <>
      <FormField label="Create Password" htmlFor="password" required hint="Minimum 8 characters">
        <div className="relative">
          <input
            id="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-muted transition hover:text-gold-400"
          >
            {show ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
          </button>
        </div>
      </FormField>

      <FormField label="Confirm Password" htmlFor="confirmPassword" required>
        <input
          id="confirmPassword"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          className={inputClass}
        />
      </FormField>
    </>
  );
}
