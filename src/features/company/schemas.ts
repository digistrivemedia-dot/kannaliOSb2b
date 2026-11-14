import { z } from "zod";

import { ROLES } from "@/features/auth/roles";
import { emailField, mobileField, pinCodeField, requiredText } from "@/lib/validation";

export const contactSchema = z.object({ email: emailField, mobile: mobileField });
export type ContactValues = z.infer<typeof contactSchema>;

/** A branch: a delivery address, and for a garage a workshop. */
export const branchSchema = z.object({
  name: requiredText("Give the branch a short name, like Whitefield."),
  line1: requiredText("Enter the building and street."),
  line2: z.string().trim(),
  pin: pinCodeField,
  city: requiredText("Enter the city."),
  state: requiredText("Enter the state."),
  contactName: requiredText("Enter who receives deliveries here."),
  contactMobile: mobileField,
});
export type BranchValues = z.infer<typeof branchSchema>;

export const personSchema = z.object({
  name: requiredText("Enter the person's name."),
  email: emailField,
  mobile: mobileField,
  roles: z.array(z.enum(ROLES)).min(1, "Choose at least one role."),
  branchId: requiredText("Choose the branch this person works at."),
});
export type PersonValues = z.infer<typeof personSchema>;
