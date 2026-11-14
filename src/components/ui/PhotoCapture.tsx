import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImagePlus, X } from "lucide-react-native";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/Toast";
import { formatCount } from "@/lib/format";
import { shrinkPhoto } from "@/lib/photos";
import { colors, radius } from "@/lib/theme";

type PhotoCaptureProps = {
  label: string;
  photos: string[];
  onChange: (photos: string[]) => void;
  max?: number;
  hint?: string;
  error?: string;
};

/** Camera first, gallery second. Every photo is shrunk before it is kept. */
export function PhotoCapture({ label, photos, onChange, max = 6, hint, error }: PhotoCaptureProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [openAt, setOpenAt] = useState<number | null>(null);
  const room = max - photos.length;

  const add = async (pick: () => Promise<ImagePicker.ImagePickerResult>) => {
    setIsBusy(true);
    try {
      const result = await pick();
      if (result.canceled) return;
      const shrunk = await Promise.all(result.assets.slice(0, room).map(shrinkPhoto));
      onChange([...photos, ...shrunk]);
    } catch {
      showToast({ message: "Couldn't add that photo. Please try again.", tone: "danger" });
    } finally {
      setIsBusy(false);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showToast({
        message: "Allow camera access in your phone's settings to take photos.",
        tone: "danger",
      });
      return;
    }
    await add(() => ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 1 }));
  };

  const pickFromGallery = () =>
    add(() =>
      ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: room > 1,
        selectionLimit: room,
        quality: 1,
      }),
    );

  return (
    <View className="gap-3">
      <View className="flex-row items-baseline justify-between">
        <Text variant="label" tone={error ? "danger" : "default"}>
          {label}
        </Text>
        <Text variant="label" tone="muted">
          {photos.length} of {max}
        </Text>
      </View>
      {photos.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {photos.map((uri, index) => (
            <View key={`${index}-${uri}`}>
              <Pressable
                onPress={() => setOpenAt(index)}
                accessibilityRole="imagebutton"
                accessibilityLabel={`${label} ${index + 1}`}
                accessibilityHint="Opens the photo full screen"
              >
                <Image source={{ uri }} contentFit="cover" style={thumb} />
              </Pressable>
              <Pressable
                onPress={() => onChange(photos.filter((_, position) => position !== index))}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${label.toLowerCase()} ${index + 1}`}
                hitSlop={12}
                className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-gray-900"
              >
                <X size={16} strokeWidth={3} color={colors.white} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
      {room > 0 && (
        <View className="flex-row gap-2">
          <Button
            label="Take photo"
            icon={Camera}
            variant="secondary"
            onPress={takePhoto}
            loading={isBusy}
            className="flex-1"
            fullWidth
          />
          <Button
            label="Gallery"
            icon={ImagePlus}
            variant="outline"
            onPress={pickFromGallery}
            disabled={isBusy}
          />
        </View>
      )}
      {error || hint ? (
        <Text variant="small" tone={error ? "danger" : "muted"}>
          {error ?? hint}
        </Text>
      ) : room === 0 ? (
        <Text variant="small" tone="muted">
          {formatCount(max, "photo")} is the most you can add.
        </Text>
      ) : null}
      <PhotoViewer
        photos={photos}
        startIndex={openAt}
        onClose={() => setOpenAt(null)}
        label={label}
      />
    </View>
  );
}

const thumb = {
  width: 96,
  height: 96,
  borderRadius: radius.input,
  backgroundColor: colors.gray[100],
};
