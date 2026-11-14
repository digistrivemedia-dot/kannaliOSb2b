import { can, type Permission } from "@/features/auth/permissions";
import { useSession } from "@/features/auth/store";

/** Whether the signed-in user may do this; screens use it to hide what they can't. */
export function useCan(permission: Permission): boolean {
  return can(useSession().roles, permission);
}
