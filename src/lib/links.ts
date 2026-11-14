import * as Linking from "expo-linking";
import { Platform } from "react-native";

import { showToast } from "@/components/ui/Toast";

async function open(url: string, failure: string) {
  try {
    await Linking.openURL(url);
  } catch {
    showToast({ message: failure, tone: "danger" });
  }
}

/** Opens the dialler with this number ("+919845012345"). */
export function callPhone(e164: string) {
  return open(`tel:${e164.replace(/[^\d+]/g, "")}`, "Couldn't open the phone app on this phone.");
}

/** Opens an address in the phone's maps app. */
export function openInMaps(address: string) {
  const query = encodeURIComponent(address);
  const url =
    Platform.OS === "ios" ? `https://maps.apple.com/?q=${query}` : `geo:0,0?q=${query}`;
  return open(url, "Couldn't open maps on this phone.");
}
