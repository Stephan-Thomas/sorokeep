import { xdr, scValToNative, Address } from "@stellar/stellar-sdk";

export interface DecodedLedgerKey {
    type: "ContractInstance" | "ContractData" | "ContractCode";
    contractId?: string;
    durability?: "Persistent" | "Temporary" | "None";
    key?: string | any;
}

export function decodeLedgerKey(base64Xdr: string): DecodedLedgerKey | null {
    try {
        const key = xdr.LedgerKey.fromXDR(base64Xdr, "base64");
        
        switch (key.switch()) {
            case xdr.LedgerEntryType.contractData(): {
                const data = key.contractData();
                const contractScAddress = data.contract();
                const contractIdStr = Address.fromScAddress(contractScAddress).toString();
                
                let durabilityStr: "Persistent" | "Temporary" | "None" = "None";
                switch (data.durability()) {
                    case xdr.ContractDataDurability.persistent():
                        durabilityStr = "Persistent";
                        break;
                    case xdr.ContractDataDurability.temporary():
                        durabilityStr = "Temporary";
                        break;
                }

                const keyScVal = data.key();
                
                if (keyScVal.switch() === xdr.ScValType.scvLedgerKeyContractInstance()) {
                    return {
                        type: "ContractInstance",
                        contractId: contractIdStr,
                        durability: durabilityStr,
                    };
                }

                return {
                    type: "ContractData",
                    contractId: contractIdStr,
                    durability: durabilityStr,
                    key: scValToNative(keyScVal),
                };
            }
            // Add other ledger entry types if needed
            default:
                return null;
        }
    } catch (e) {
        console.error("decode error:", e);
        return null;
    }
}
