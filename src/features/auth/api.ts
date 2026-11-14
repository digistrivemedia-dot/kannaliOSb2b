import type {
  ApplicationStatus,
  RegistrationApplication,
  RegistrationReceipt,
  Session,
  SignInRequest,
  SignInResult,
} from "@/features/auth/types";
import { apiClient, orNull } from "@/lib/api-client";

/** The header that proves an applicant may see their application (with its reference number). */
const APPLICATION_KEY = "X-Application-Key";

export function signIn(request: SignInRequest): Promise<SignInResult> {
  return apiClient.post<SignInResult>("/auth/sign-in", request);
}

export function verifyTwoFactor(challengeId: string, code: string): Promise<{ sessionToken: string }> {
  return apiClient.post<{ sessionToken: string }>("/auth/two-factor/verify", { challengeId, code });
}

export function resendTwoFactorCode(challengeId: string): Promise<void> {
  return apiClient.post<void>("/auth/two-factor/resend", { challengeId });
}

/** The signed-in user, business, roles and branch. */
export function getSession(): Promise<Session> {
  return apiClient.get<Session>("/auth/session");
}

/** Ends the session on the server, so a copied token stops working. */
export function signOut(): Promise<void> {
  return apiClient.post<void>("/auth/sign-out");
}

/** Always answers the same way, so it can't be used to find out which emails have logins. */
export function requestPasswordReset(email: string): Promise<void> {
  return apiClient.post<void>("/auth/password-reset", { email });
}

/** Sets a password from an invite or reset link; it signs the user out everywhere. */
export function setPassword(password: string, resetToken: string): Promise<void> {
  return apiClient.post<void>("/auth/password", { password, resetToken });
}

export function registerBusiness(application: RegistrationApplication): Promise<RegistrationReceipt> {
  return apiClient.post<RegistrationReceipt>("/registrations", application);
}

/** An application by its reference and access key, or null when either is wrong. */
export function getApplication(ref: string, key: string): Promise<ApplicationStatus | null> {
  return orNull(
    apiClient.get<ApplicationStatus>(`/registrations/${encodeURIComponent(ref)}`, undefined, {
      [APPLICATION_KEY]: key,
    }),
  );
}

/** Sends a sent-back application in again with the corrections. */
export function resubmitApplication(
  ref: string,
  key: string,
  application: RegistrationApplication,
): Promise<Omit<RegistrationReceipt, "accessKey">> {
  return apiClient.put(`/registrations/${encodeURIComponent(ref)}`, application, {
    [APPLICATION_KEY]: key,
  });
}
