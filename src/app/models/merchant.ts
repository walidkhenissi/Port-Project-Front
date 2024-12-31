import { Address } from "./address";

export class Merchant {
    firstName: string;
    lastName: string;
    civility: string;
    socialReason: string;
    taxRegistrationNumber: string;
    phoneNumber: number;
    enabled: boolean;
    merchantAddress: Address;
}
