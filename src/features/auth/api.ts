import type { Session, SignInRequest, SignInResult } from "@/features/auth/types";
import { apiClient } from "@/lib/api-client";

export function signIn(request: SignInRequest): Promise<SignInResult> {
  return apiClient.post<SignInResult>("/auth/sign-in", request);
}

export function verifyTwoFactor(challengeId: string, code: string): Promise<{ sessionToken: string }> {
  return apiClient.post<{ sessionToken: string }>("/auth/two-factor/verify", { challengeId, code });
}

/** The signed-in user, business, roles and branch. */
export function getSession(): Promise<Session> {
  return apiClient.get<Session>("/auth/session");
}

/** Ends the session on the server, so a copied token stops working. */
export function signOut(): Promise<void> {
  return apiClient.post<void>("/auth/sign-out");
}
