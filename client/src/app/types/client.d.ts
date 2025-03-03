import { Address } from "./address";
import { PhoneNumber } from "./phone-number";

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  projects?: {
    id: string;
    name: string;
  }[];
  phoneNumber: PhoneNumber;
  addressPrimary: Address;
  addressBilling: Address;
};
