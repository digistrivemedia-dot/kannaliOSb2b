import { Bell, Camera, MoreHorizontal, Phone, ShoppingCart } from "lucide-react-native";
import { View } from "react-native";

import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
import { showToast } from "@/components/ui/Toast";

const noop = () => {};

export function KitActions() {
  return (
    <Section title="Buttons">
      <Card className="gap-3">
        <Button size="main" label="Start check-in" onPress={noop} />
        <Button size="main" label="Saving" onPress={noop} loading />
        <Button size="main" label="Disabled" onPress={noop} disabled />
        <Button label="Secondary" variant="secondary" icon={Camera} onPress={noop} />
        <Button label="Outline" variant="outline" onPress={noop} />
        <Button label="Ghost" variant="ghost" onPress={noop} />
        <Button label="Decline booking" variant="destructive" onPress={noop} />
        <Button
          label="Show a toast"
          variant="outline"
          onPress={() => showToast({ message: "Technician assigned" })}
        />
        <Button
          label="Show an error toast"
          variant="outline"
          onPress={() => showToast({ message: "Couldn't save. Try again.", tone: "danger" })}
        />
      </Card>
      <View className="flex-row flex-wrap items-center gap-2 rounded-card bg-navy-900 p-2">
        <IconButton icon={Bell} label="Notifications" tone="inverse" badge={3} onPress={noop} />
        <IconButton icon={ShoppingCart} label="Cart" tone="inverse" badge={12} onPress={noop} />
        <IconButton icon={MoreHorizontal} label="More actions" tone="inverse" onPress={noop} />
      </View>
      <View className="flex-row gap-2">
        <IconButton icon={Phone} label="Call customer" tone="navy" onPress={noop} />
        <IconButton icon={MoreHorizontal} label="More actions" onPress={noop} />
        <IconButton icon={Bell} label="Notifications" onPress={noop} disabled />
      </View>
    </Section>
  );
}
