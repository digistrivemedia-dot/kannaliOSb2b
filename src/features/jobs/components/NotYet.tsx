import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";

/** A job card section the work hasn't reached yet. */
export function NotYet({ children }: { children: string }) {
  return (
    <Card className="border-dashed bg-gray-50">
      <Text tone="muted">{children}</Text>
    </Card>
  );
}
