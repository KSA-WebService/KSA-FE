"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getAdminMe } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginBackdrop } from "./login-backdrop";

// Reasons that mean "sign the stale/rejected session out and say why".
// Anything else (missing reason, or an unrecognized value) does nothing --
// sign-out stays restricted to genuine authentication/authorization
// rejections and is never triggered for transient service errors.
const AUTH_REJECTION_MESSAGES: Record<string, string> = {
  not_admin: "관리자 권한이 없는 계정입니다.",
  session_expired: "로그인이 만료되었습니다. 다시 로그인해주세요.",
};

const SERVICE_UNAVAILABLE_MESSAGE = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
const INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호를 확인해주세요.";

interface LoginFormProps {
  reason: string | null;
  serviceError?: boolean;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

// docs/admin/admin-ui.md §1.
export function LoginForm({ reason, serviceError }: LoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(
    serviceError ? SERVICE_UNAVAILABLE_MESSAGE : null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // `reason`, set by the server-rendered page (src/app/admin/login/page.tsx)
  // either from its own existing-session check or via a redirect from the
  // protected layout (src/app/admin/(protected)/layout.tsx) after a failed
  // GET /admin/me. Sign-out happens here, client-side, because a Server
  // Component render can't mutate cookies.
  useEffect(() => {
    if (!reason || !(reason in AUTH_REJECTION_MESSAGES)) return;

    const supabase = createClient();
    supabase.auth.signOut().finally(() => setFormError(AUTH_REJECTION_MESSAGES[reason]));
  }, [reason]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const nextFieldErrors: FieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "이메일을 입력해주세요.";
    if (!password) nextFieldErrors.password = "비밀번호를 입력해주세요.";
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setFormError(null);
    setIsSubmitting(true);

    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setFormError(error?.code === "invalid_credentials" ? INVALID_CREDENTIALS_MESSAGE : SERVICE_UNAVAILABLE_MESSAGE);
        return;
      }

      try {
        await getAdminMe(data.session.access_token);
      } catch (adminMeError) {
        if (adminMeError instanceof ApiError && adminMeError.status === 403) {
          // Confirmed non-admin account -- sign out the session we just created.
          await supabase.auth.signOut();
          setFormError(AUTH_REJECTION_MESSAGES.not_admin);
        } else {
          // A freshly issued token failing with 401, a network error, 5xx,
          // or a malformed response is not a confirmed rejection -- keep
          // the session and let the administrator retry.
          setFormError(SERVICE_UNAVAILABLE_MESSAGE);
        }
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setFormError(SERVICE_UNAVAILABLE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <LoginBackdrop />

      <div className="relative w-full max-w-[400px] rounded-surface border border-border bg-surface/95 p-8 shadow-lg backdrop-blur-sm">
        <div className="flex justify-center">
          <Image
            src="/brand/ksa-logo.png"
            alt="KSA"
            width={993}
            height={943}
            priority
            className="h-10 w-auto"
          />
        </div>
        <h1 className="mt-4 text-center text-section-heading font-semibold text-text-primary">
          Admin Login
        </h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-meta font-medium text-text-secondary">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-meta text-destructive">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="text-meta font-medium text-text-secondary">
              Password
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-meta text-destructive">{fieldErrors.password}</p>
            )}
          </div>

          {formError && <p className="text-body text-destructive">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Log In"}
          </Button>
        </form>
      </div>
    </main>
  );
}
