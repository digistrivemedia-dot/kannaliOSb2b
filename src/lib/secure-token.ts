import * as SecureStore from "expo-secure-store";

// The session token lives only here: never in AsyncStorage, Zustand or logs (CLAUDE.md §10).
const TOKEN_KEY = "kannali-garage-os.session-token";

export function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export function saveToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

export function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}
