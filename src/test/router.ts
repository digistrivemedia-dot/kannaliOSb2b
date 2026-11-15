import * as expoRouter from "expo-router";

/** Sets the route parameters the screen under test reads (see the Expo Router stub in jest.setup.ts). */
export function setParams(params: Record<string, string>) {
  (expoRouter as unknown as { __setParams: (next: Record<string, string>) => void }).__setParams(
    params,
  );
}
