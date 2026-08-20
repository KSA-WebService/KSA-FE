"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useVerifyInvitationQuery } from "@/hooks/use-verify-invitation-query";
import { completeOnboarding } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthCard } from "@/components/auth/auth-card";
import { PasswordInput } from "@/components/auth/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PASSWORD_MAX_LENGTH = 72;
const PASSWORD_HELP_TEXT = "8자 이상 · 영문 대/소문자, 숫자, 특수문자 각 1개 이상 · 공백 불가";
const PASSWORD_RESET_NOTICE =
  "현재 비밀번호 재설정 기능은 제공되지 않습니다. 설정한 비밀번호를 꼭 기억해주세요.";
const PASSWORD_MISMATCH_MESSAGE = "비밀번호가 일치하지 않습니다.";
const PRIVACY_CONSENT_LABEL = "개인정보 수집 및 이용에 동의합니다.";

const MISSING_TOKEN_MESSAGE = "초대 링크가 올바르지 않습니다. 초대 이메일의 링크를 다시 확인해주세요.";

// Confirmed invitation-state error codes (existing backend implementation).
// Reused by both invitation verification and onboarding completion below --
// onboarding can return these same codes if the invitation's state changes
// or is revalidated mid-flow.
const INVITATION_ERROR_MESSAGES: Record<string, string> = {
  I400_INVALID_INVITATION_TOKEN: "유효하지 않은 초대 링크입니다. 초대 이메일의 링크를 다시 확인해주세요.",
  I409_INVITATION_ALREADY_ACCEPTED: "이미 가입이 완료된 초대 링크입니다. 로그인해주세요.",
  I410_INVITATION_REVOKED: "더 이상 사용할 수 없는 초대 링크입니다. 관리자에게 새로운 초대 링크를 요청해주세요.",
  I410_INVITATION_UNAVAILABLE: "현재 사용할 수 없는 초대 링크입니다. 관리자에게 문의해주세요.",
  I410_INVITATION_EXPIRED: "초대 링크가 만료되었습니다. 관리자에게 새로운 초대 링크를 요청해주세요.",
};
const GENERIC_INVITATION_ERROR_MESSAGE = "유효하지 않거나 만료된 초대 링크입니다. 관리자에게 문의해주세요.";
// ApiTransportError / ApiResponseFormatError during verification -- a
// connectivity/service problem, not a rejected invitation. Recoverable via
// manual retry (see InvitationInvalidState's onRetry).
const INVITATION_SERVICE_ERROR_MESSAGE = "초대 정보를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.";

// Confirmed onboarding-specific error codes.
const ONBOARDING_ERROR_MESSAGES: Record<string, string> = {
  A400_PRIVACY_CONSENT_REQUIRED: "개인정보 수집 및 이용 동의가 필요합니다.",
  A400_WEAK_PASSWORD: "비밀번호 조건을 다시 확인해주세요.",
  A409_ACCOUNT_ALREADY_EXISTS: "이미 계정이 생성된 사용자입니다. 로그인해주세요.",
  A500_ACCOUNT_ACTIVATION_FAILED: "가입 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
  A503_AUTH_PROVIDER_UNAVAILABLE: "인증 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.",
};
const ONBOARDING_GENERIC_ERROR_MESSAGE = "가입을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.";
// ApiTransportError / ApiResponseFormatError / anything unexpected during
// onboarding submission -- same service-style fallback used on Login.
const SERVICE_UNAVAILABLE_MESSAGE = "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";

// A well-formed backend rejection maps by errorCode (falling back to the
// generic invitation-state message for an unrecognized future code).
// Anything else -- ApiTransportError, ApiResponseFormatError, or any other
// unexpected failure -- is a service problem, not an invitation rejection,
// and is safe to retry.
function getInvitationErrorMessage(error: unknown): { message: string; canRetry: boolean } {
  if (error instanceof ApiError) {
    return { message: INVITATION_ERROR_MESSAGES[error.errorCode] ?? GENERIC_INVITATION_ERROR_MESSAGE, canRetry: false };
  }
  return { message: INVITATION_SERVICE_ERROR_MESSAGE, canRetry: true };
}

// Checks onboarding-specific codes first, then falls back to the shared
// invitation-state codes (the invitation may have been revoked/expired/used
// between verification and submission), then a generic message. A
// non-ApiError failure (transport/format/unexpected) never gets a
// code-specific message.
function getOnboardingErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return (
      ONBOARDING_ERROR_MESSAGES[error.errorCode] ??
      INVITATION_ERROR_MESSAGES[error.errorCode] ??
      ONBOARDING_GENERIC_ERROR_MESSAGE
    );
  }
  return SERVICE_UNAVAILABLE_MESSAGE;
}

// docs/user/api-contract.md password contract -- frontend prevents clearly
// invalid submissions, but the backend remains the final source of truth.
// The 72-character maximum is enforced here defensively (normal typing is
// already capped by the password fields' maxLength) even though the
// visible helper text intentionally doesn't mention it.
function getPasswordError(password: string): string | undefined {
  if (password.length < 8) return "비밀번호는 8자 이상이어야 합니다.";
  if (password.length > PASSWORD_MAX_LENGTH) return `비밀번호는 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`;
  if (/\s/.test(password)) return "비밀번호에 공백을 포함할 수 없습니다.";
  if (!/[a-z]/.test(password)) return "영문 소문자를 하나 이상 포함해주세요.";
  if (!/[A-Z]/.test(password)) return "영문 대문자를 하나 이상 포함해주세요.";
  if (!/\d/.test(password)) return "숫자를 하나 이상 포함해주세요.";
  if (!/[^A-Za-z0-9\s]/.test(password)) return "특수문자를 하나 이상 포함해주세요.";
  return undefined;
}

interface FieldErrors {
  password?: string;
  confirmPassword?: string;
}

interface AccountActivationFormProps {
  token: string | null;
  // SHA-256 fingerprint of `token`, computed server-side in page.tsx --
  // used only as the query identity, never the raw token.
  tokenFingerprint: string | null;
}

// docs/user/user-ui.md "Page 3 — Account Activation".
export function AccountActivationForm({ token, tokenFingerprint }: AccountActivationFormProps) {
  const router = useRouter();
  const invitationQuery = useVerifyInvitationQuery(token, tokenFingerprint);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // No token in the URL at all: don't call the backend, just show the same
  // invalid-invitation presentation immediately.
  if (!token) {
    return <InvitationInvalidState message={MISSING_TOKEN_MESSAGE} />;
  }

  if (invitationQuery.isPending) {
    return (
      <AuthShell>
        <AuthCard title="계정 활성화">
          <p className="text-body text-text-secondary">초대 정보를 확인하고 있습니다...</p>
        </AuthCard>
      </AuthShell>
    );
  }

  if (invitationQuery.isError) {
    const { message, canRetry } = getInvitationErrorMessage(invitationQuery.error);
    return (
      <InvitationInvalidState
        message={message}
        onRetry={canRetry ? () => invitationQuery.refetch() : undefined}
      />
    );
  }

  const invitation = invitationQuery.data;
  if (!invitation) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || !agreedPrivacy) return;

    const nextFieldErrors: FieldErrors = {};
    const passwordError = getPasswordError(password);
    if (passwordError) nextFieldErrors.password = passwordError;
    else if (password !== confirmPassword) nextFieldErrors.confirmPassword = PASSWORD_MISMATCH_MESSAGE;
    setFieldErrors(nextFieldErrors);
    if (Object.keys(nextFieldErrors).length > 0) return;

    setFormError(null);
    setIsSubmitting(true);

    try {
      await completeOnboarding({ token: token!, password, agreedPrivacy: true });

      // Step 3 -- automatic sign-in with the verified invitation email and
      // the password just submitted, per docs/user/api-contract.md. The
      // shared UserSessionProvider picks up the resulting session on its
      // own via onAuthStateChange.
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: invitation.email,
        password,
      });

      if (signInError) {
        // Onboarding itself succeeded -- only auto sign-in failed. Per
        // docs/user/product.md, only this case sends the user to Login
        // instead of Home.
        toast.success("가입이 완료되었습니다. 로그인해주세요.");
        router.push("/login");
        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      setFormError(getOnboardingErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit = agreedPrivacy && !isSubmitting;

  return (
    <AuthShell>
      <AuthCard title="계정 활성화" description="초대받은 정보를 확인하고 비밀번호를 설정해주세요.">
        <div className="space-y-3">
          <ReadOnlyField label="이름" value={invitation.name} />
          <ReadOnlyField label="이메일" value={invitation.email} />
          <ReadOnlyField label="학번" value={invitation.studentNumber} />
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="password" className="text-meta font-medium text-text-secondary">
              새 비밀번호
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            <p className="mt-1 text-meta text-text-muted">{PASSWORD_HELP_TEXT}</p>
            {fieldErrors.password && <p className="mt-1 text-meta text-destructive">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-meta font-medium text-text-secondary">
              새 비밀번호 확인
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              maxLength={PASSWORD_MAX_LENGTH}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              disabled={isSubmitting}
              className="mt-1"
            />
            {fieldErrors.confirmPassword && (
              <p className="mt-1 text-meta text-destructive">{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className="rounded-control border border-warning/30 bg-warning/10 px-3 py-2 text-meta text-warning">
            {PASSWORD_RESET_NOTICE}
          </div>

          <label className="flex items-start gap-2 text-body text-text-primary">
            <Checkbox
              checked={agreedPrivacy}
              onChange={(event) => setAgreedPrivacy(event.target.checked)}
              disabled={isSubmitting}
              className="mt-0.5 shrink-0"
            />
            {PRIVACY_CONSENT_LABEL}
          </label>

          {formError && <p className="text-body text-destructive">{formError}</p>}

          <Button type="submit" disabled={!canSubmit} className="w-full">
            {isSubmitting ? "가입 처리 중..." : "가입 완료하기"}
          </Button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-control bg-surface-muted px-3 py-2">
      <p className="text-meta text-text-muted">{label}</p>
      <p className="text-body font-medium text-text-primary">{value}</p>
    </div>
  );
}

function InvitationInvalidState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <AuthShell>
      <AuthCard title="계정 활성화">
        <p className="text-body text-text-secondary">{message}</p>
        {onRetry ? (
          <Button type="button" variant="secondary" onClick={onRetry} className="mt-6 w-full">
            다시 시도
          </Button>
        ) : (
          <Link href="/login" className={cn(buttonVariants("secondary"), "mt-6 w-full")}>
            로그인 페이지로 이동
          </Link>
        )}
      </AuthCard>
    </AuthShell>
  );
}
