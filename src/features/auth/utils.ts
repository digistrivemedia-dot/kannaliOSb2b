import type { RegisterValues } from "@/features/auth/schemas";
import type { RegistrationApplication } from "@/features/auth/types";

/** Turns the wizard's flat values into the application the API expects (website `auth/utils.ts`). */
export function toRegistrationApplication(
  values: RegisterValues,
  photos: string[],
  documents: string[],
): RegistrationApplication {
  return {
    business: {
      name: values.businessName,
      type: values.businessType,
      gstin: values.gstin || undefined,
      pan: values.pan || undefined,
      licenceNumber: values.licenceNumber || undefined,
      otherRegistration: values.otherRegistration || undefined,
    },
    contact: {
      name: values.contactName || undefined,
      email: values.email,
      phone: `+91${values.mobile}`,
    },
    address: {
      line1: values.addressLine1,
      line2: values.addressLine2 || undefined,
      city: values.city,
      state: values.state,
      pin: values.pin,
    },
    photos,
    documents,
  };
}

/** The wizard's values for an application being corrected or made again. */
export function toRegisterValues(application: RegistrationApplication): RegisterValues {
  const { business, contact, address } = application;
  return {
    businessName: business.name,
    businessType: business.type,
    gstin: business.gstin ?? "",
    pan: business.pan ?? "",
    licenceNumber: business.licenceNumber ?? "",
    otherRegistration: business.otherRegistration ?? "",
    documents: application.documents,
    contactName: contact.name ?? "",
    email: contact.email,
    mobile: contact.phone.replace(/^\+91/, ""),
    addressLine1: address.line1,
    addressLine2: address.line2 ?? "",
    pin: address.pin,
    city: address.city,
    state: address.state,
    photos: application.photos,
    acceptTerms: false,
  };
}

/** The token from a pasted invite or reset link ("…/set-password?token=abc"), or the token itself. */
export function tokenFromLink(text: string): string {
  const match = /[?&]token=([^&\s#]+)/.exec(text);
  return (match?.[1] ?? text).trim();
}
