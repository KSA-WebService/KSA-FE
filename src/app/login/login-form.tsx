"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";

const INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호를 확인해주세요.";
const SERVICE_UNAVAILABLE_MESSAGE = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

interface FieldErrors {
  email?: string;
  password?: string;
}

// docs/user/user-ui.md "Page 2 — Login". Supabase `signInWithPassword`
// only -- no NestJS login endpoint, no Supabase Data API. The shared
// UserSessionProvider (its onAuthStateChange listener) picks up the new
// session automatically; this component only needs to navigate away.
export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.session) {
        setFormError(
          error?.code === "invalid_credentials" ? INVALID_CREDENTIALS_MESSAGE : SERVICE_UNAVAILABLE_MESSAGE,
        );
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFormError(SERVICE_UNAVAILABLE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <AuthCard title="로그인" description="KSA 회원 계정으로 로그인해주세요.">
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="text-meta font-medium text-text-secondary">
              이메일
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
            {fieldErrors.email && <p className="mt-1 text-meta text-destructive">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="text-meta font-medium text-text-secondary">
              비밀번호
            </label>
            <PasswordInput
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.password && <p className="mt-1 text-meta text-destructive">{fieldErrors.password}</p>}
          </div>

          {formError && <p className="text-body text-destructive">{formError}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
