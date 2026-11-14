import { Header } from "@/components/layout/Header";
import { Screen } from "@/components/layout/Screen";
import { KitActions } from "@/features/dev-kit/components/KitActions";
import { KitChoices } from "@/features/dev-kit/components/KitChoices";
import { KitInputs } from "@/features/dev-kit/components/KitInputs";
import { KitSignature } from "@/features/dev-kit/components/KitSignature";
import { KitStates } from "@/features/dev-kit/components/KitStates";
import { KitType } from "@/features/dev-kit/components/KitType";

/** Developer-only: every kit component in every state, to check the look on a phone. */
export function KitScreen() {
  return (
    <Screen header={<Header title="Design kit" subtitle="Developers only" />}>
      <KitType />
      <KitActions />
      <KitInputs />
      <KitChoices />
      <KitSignature />
      <KitStates />
    </Screen>
  );
}
