import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { showToast } from "@/components/ui/Toast";

/** Makes a PDF from the page and opens the phone's share sheet ("Share PDF" replaces downloads). */
export async function sharePdf(html: string, title: string): Promise<void> {
  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (!(await Sharing.isAvailableAsync())) {
      showToast({ message: "Sharing isn't available on this phone.", tone: "danger" });
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: title,
    });
  } catch {
    showToast({ message: "Couldn't make the PDF. Please try again.", tone: "danger" });
  }
}

/** Text safe to put inside the PDF's HTML. */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
}

/** Saves a PDF the API links to (a GST invoice, a credit note) and opens the share sheet. */
export async function shareRemotePdf(url: string, fileName: string): Promise<void> {
  try {
    const target = new File(Paths.cache, `${fileName.replace(/[^\w.-]+/g, "-")}.pdf`);
    if (target.exists) target.delete();
    const file = await File.downloadFileAsync(url, target);
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: fileName,
    });
  } catch {
    showToast({
      message: "Couldn't get the PDF. Check your connection and try again.",
      tone: "danger",
    });
  }
}
