import { Eye, EyeOff } from "lucide-react-native";
import { useState } from "react";

import { IconButton } from "@/components/ui/IconButton";
import { Input, type InputProps } from "@/components/ui/Input";

type PasswordInputProps = Omit<InputProps, "secureTextEntry" | "suffix">;

export function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <Input
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="password"
      textContentType="password"
      {...props}
      secureTextEntry={!isVisible}
      suffix={
        <IconButton
          icon={isVisible ? EyeOff : Eye}
          label={isVisible ? "Hide password" : "Show password"}
          onPress={() => setIsVisible((visible) => !visible)}
          className="-mr-3"
        />
      }
    />
  );
}
