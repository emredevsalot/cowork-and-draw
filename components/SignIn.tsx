"use client";

import Link from "next/link";

export default function SignIn() {
  return (
    <div>
      <Link
        className="underline"
        href={`/api/auth/signin`}
        // TODO: I get the "ReferenceError: window is not defined" error
        // href={`/api/auth/signin?callbackUrl=${window.location.href}`}
      >
        Sign in
      </Link>
    </div>
  );
}
