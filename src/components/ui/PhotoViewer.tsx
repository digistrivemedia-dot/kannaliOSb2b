import { Image } from "expo-image";
import { X } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Modal, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IconButton } from "@/components/ui/IconButton";
import { Text } from "@/components/ui/Text";

type PhotoViewerProps = {
  photos: string[];
  /** The photo to open on; the viewer is closed while this is null. */
  startIndex: number | null;
  onClose: () => void;
  /** What the photos are, read out with each: "Check-in photo". */
  label: string;
};

/** Photos full screen on black; swipe between them, back or X closes. */
export function PhotoViewer({ photos, startIndex, onClose, label }: PhotoViewerProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(startIndex ?? 0);
  return (
    <Modal
      visible={startIndex !== null}
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setIndex(startIndex ?? 0)}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View className="flex-1 bg-black">
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          initialScrollIndex={startIndex ?? 0}
          getItemLayout={(_, item) => ({ length: width, offset: width * item, index: item })}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(uri, item) => `${item}-${uri}`}
          onMomentumScrollEnd={(event) =>
            setIndex(Math.round(event.nativeEvent.contentOffset.x / width))
          }
          renderItem={({ item, index: position }) => (
            <Image
              source={{ uri: item }}
              contentFit="contain"
              accessibilityLabel={`${label} ${position + 1} of ${photos.length}`}
              style={{ width, height }}
            />
          )}
        />
        <View
          className="absolute inset-x-0 flex-row items-center justify-between px-2"
          style={{ top: insets.top + 4 }}
        >
          <Text tone="inverse" weight="medium" className="pl-2">
            {photos.length > 1 ? `${index + 1} of ${photos.length}` : ""}
          </Text>
          <IconButton icon={X} label="Close photo" tone="inverse" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
