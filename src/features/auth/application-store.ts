import * as SecureStore from "expo-secure-store";

/**
 * The application this phone sent: its reference and access key. Like the session token, the key
 * opens personal details, so it is kept in secure storage, not AsyncStorage.
 */
const KEY = "kannali-garage-os.application";

export type SavedApplication = { ref: string; key: string };

export async function getSavedApplication(): Promise<SavedApplication | null> {
  const saved = await SecureStore.getItemAsync(KEY);
  if (!saved) return null;
  try {
    const value = JSON.parse(saved) as Partial<SavedApplication>;
    return value.ref && value.key ? { ref: value.ref, key: value.key } : null;
  } catch {
    return null;
  }
}

export function saveApplication(application: SavedApplication): Promise<void> {
  return SecureStore.setItemAsync(KEY, JSON.stringify(application));
}
