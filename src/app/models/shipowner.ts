import { Address } from "./address";

export class Shipowner {
    firstName: string;
    lastName: string;
    civility: string;
    socialReason: string;
    taxRegistrationNumber: string;
    phoneNumber: number;
    enabled: boolean;
    shipownerAddress: Address;
}
