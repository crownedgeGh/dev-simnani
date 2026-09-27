"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGateModal from "@/components/auth/AuthGateModal";
import BackButton from "@/components/layout/BackButton";
import PostPropertyForm from "@/components/property/PostPropertyForm";

/**
 * Wraps PostPropertyForm together with its page header's BackButton so the
 * back action can be intercepted: if the form has unsaved changes, the form
 * shows a confirmation modal instead of navigating away immediately.
 *
 * Also gates the whole page behind AuthGateModal for visitors who land here
 * directly (e.g. a shared link) without being logged in — the navbar already
 * intercepts the "Post a Property" click, but a direct URL visit bypasses
 * that check.
 */
export default function PostPropertyGuardedForm({ editId, backButtonClassName = "", children }) {
  const router = useRouter();
  const formRef = useRef(null);
  const { isAuthenticated, isLoading } = useAuth();

  function handleBack() {
    if (formRef.current) {
      formRef.current.guardClose(() => router.back());
    } else {
      router.back();
    }
  }

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <AuthGateModal isOpen onClose={() => router.push("/")} />;
  }

  return (
    <>
      <div className="flex items-center gap-3 sm:gap-4">
        <BackButton className={backButtonClassName} onClick={handleBack} />
        {children}
      </div>

      <div className="mt-8 sm:mt-10">
        <PostPropertyForm ref={formRef} editId={editId} />
      </div>
    </>
  );
}
