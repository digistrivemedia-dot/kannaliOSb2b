import { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { FormAlert } from "@/components/ui/FormAlert";
import { Input } from "@/components/ui/Input";
import { PhotoCapture } from "@/components/ui/PhotoCapture";
import { showToast } from "@/components/ui/Toast";
import { useAddProgressNote } from "@/features/jobs/queries";
import { MAX_JOB_PHOTO_BYTES } from "@/features/jobs/utils";
import { errorMessage } from "@/lib/api-client";
import { clearDraft, useDraftStore } from "@/lib/drafts";
import { toDataUrls } from "@/lib/photos";

type Draft = { text: string; photos: string[] };

type ProgressNoteFormProps = {
  jobId: string;
  /** Extra work found: the desk gets it to price and send to the customer. */
  isExtraWork?: boolean;
  onSent?: () => void;
};

/** A progress update with photos (or extra work found), kept as a draft until it's sent. */
export function ProgressNoteForm({ jobId, isExtraWork = false, onSent }: ProgressNoteFormProps) {
  const draftKey = `progress:${isExtraWork ? "extra" : "note"}:${jobId}`;
  const draft = useDraftStore((state) => state.drafts[draftKey] as Draft | undefined) ?? {
    text: "",
    photos: [],
  };
  const save = (next: Draft) => useDraftStore.getState().save(draftKey, next);
  const add = useAddProgressNote(jobId);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async () => {
    if (draft.text.trim().length < 2)
      return setError(isExtraWork ? "Say what you found." : "Write a short note.");
    setError(null);
    setIsPreparing(true);
    try {
      await add.mutateAsync({
        text: draft.text.trim(),
        photos: await toDataUrls(draft.photos, MAX_JOB_PHOTO_BYTES),
        isExtraWork,
      });
      clearDraft(draftKey);
      showToast({
        message: isExtraWork ? "Sent to the desk to price for the customer" : "Update added",
      });
      onSent?.();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <View className="gap-3">
      {error ? <FormAlert message={error} /> : null}
      <Input
        label={isExtraWork ? "What did you find?" : "Update"}
        placeholder={
          isExtraWork ? "Rear tyre worn out, needs replacing" : "Old oil drained, filter changed"
        }
        value={draft.text}
        onChangeText={(text) => save({ ...draft, text })}
        multiline
      />
      <PhotoCapture
        label="Photos"
        photos={draft.photos}
        onChange={(photos) => save({ ...draft, photos })}
        max={4}
      />
      <Button
        variant={isExtraWork ? "secondary" : "outline"}
        label={isExtraWork ? "Send to the desk" : "Add update"}
        onPress={() => void send()}
        loading={isPreparing || add.isPending}
        fullWidth
      />
    </View>
  );
}
