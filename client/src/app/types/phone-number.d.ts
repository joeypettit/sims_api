export type PhoneNumber = {
  countryCode: string; // e.g., "+1"
  areaCode: string; // e.g., "218"
  number: string; // e.g., "5551234"
  extension?: string; // Optional, e.g., "123"
  type: string; // work, cell, home ect
};
