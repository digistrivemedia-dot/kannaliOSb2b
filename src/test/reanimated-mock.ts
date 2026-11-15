// The few Reanimated pieces the app uses, without animation, for tests. Reanimated 4's own mock
// needs its native module under jest-expo, so tests use this one instead.
import { View } from "react-native";

type Builder = { duration: () => Builder; delay: () => Builder; springify: () => Builder };
const builder: Builder = {
  duration: () => builder,
  delay: () => builder,
  springify: () => builder,
};

const Animated = {
  View,
  createAnimatedComponent: <T>(component: T) => component,
};

export default Animated;
export const FadeInUp = builder;
export const FadeOutUp = builder;
export const Easing = {
  linear: (t: number) => t,
  out: () => (t: number) => t,
  cubic: (t: number) => t,
};
export const useSharedValue = <T>(value: T) => ({ value });
export const useAnimatedStyle = (style: () => object) => style();
export const useAnimatedProps = (props: () => object) => props();
export const withTiming = <T>(value: T) => value;
export const withRepeat = <T>(value: T) => value;
