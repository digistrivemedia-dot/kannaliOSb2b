// Native modules the app touches at import time, replaced for tests running in Node.
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:4000";

jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => require("./src/test/reanimated-mock"));

// Screens only use `router` and `useLocalSearchParams` from Expo Router; tests set the params.
jest.mock("expo-router", () => {
  const params: Record<string, string> = {};
  return {
    router: {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      dismissTo: jest.fn(),
      canGoBack: jest.fn(() => true),
    },
    useLocalSearchParams: () => params,
    __setParams: (next: Record<string, string>) => {
      for (const key of Object.keys(params)) delete params[key];
      Object.assign(params, next);
    },
  };
});

// Online, as far as tests know.
jest.mock("expo-network", () => ({
  useNetworkState: () => ({ isConnected: true, isInternetReachable: true }),
  addNetworkStateListener: () => ({ remove: () => undefined }),
}));

// FlashList lays its rows out after render, outside any act(); only those two warnings are dropped.
const reportError = console.error;
jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
  const text = args.map(String).join(" ");
  if (/not wrapped in act/.test(text) && /FlashList|ViewHolderCollection/.test(text)) return;
  reportError(...args);
});
