/** The backend's address. Public: anyone with the app can read it, so never put secrets in EXPO_PUBLIC_*. */
export const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? "";
