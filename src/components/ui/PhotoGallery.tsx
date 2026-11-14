import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";

import { PhotoViewer } from "@/components/ui/PhotoViewer";
import { colors, radius } from "@/lib/theme";

type PhotoGalleryProps = {
  photos: string[];
  /** What the photos are, e.g. "Check-in photo". */
  label: string;
};

/** A row of photos to look at; tap one to open it full screen. */
export function PhotoGallery({ photos, label }: PhotoGalleryProps) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  if (photos.length === 0) return null;
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2"
      >
        {photos.map((uri, index) => (
          <Pressable
            key={`${index}-${uri}`}
            onPress={() => setOpenAt(index)}
            accessibilityRole="imagebutton"
            accessibilityLabel={`${label} ${index + 1} of ${photos.length}`}
            accessibilityHint="Opens the photo full screen"
          >
            <Image source={{ uri }} contentFit="cover" transition={150} style={thumb} />
          </Pressable>
        ))}
      </ScrollView>
      <PhotoViewer
        photos={photos}
        startIndex={openAt}
        onClose={() => setOpenAt(null)}
        label={label}
      />
    </>
  );
}

const thumb = {
  width: 88,
  height: 88,
  borderRadius: radius.input,
  backgroundColor: colors.gray[100],
};
