import { describe, it, expect } from "vitest";
import { xdr } from "@stellar/stellar-sdk";
import { decodeLedgerKey } from "../../src/core/decoder";

describe("Ledger Entry Key Decoder", () => {
    it("decodes instance key successfully", () => {
        // Build a mock instance key XDR
        const contractId = Buffer.alloc(32, 1);
        const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
            contract: xdr.ScAddress.scAddressTypeContract(contractId),
            key: xdr.ScVal.scvLedgerKeyContractInstance(),
            durability: xdr.ContractDataDurability.persistent(),
        })).toXDR("base64");

        const decoded = decodeLedgerKey(key);
        
        expect(decoded).toBeDefined();
        expect(decoded?.type).toBe("ContractInstance");
        expect(decoded?.durability).toBe("Persistent");
        expect(decoded?.contractId).toBeDefined();
    });

    it("decodes data storage key symbol successfully", () => {
        // Build a mock data storage key XDR with a Symbol key
        const contractId = Buffer.alloc(32, 2);
        const key = xdr.LedgerKey.contractData(new xdr.LedgerKeyContractData({
            contract: xdr.ScAddress.scAddressTypeContract(contractId),
            key: xdr.ScVal.scvSymbol("Admin"),
            durability: xdr.ContractDataDurability.temporary(),
        })).toXDR("base64");

        const decoded = decodeLedgerKey(key);
        
        expect(decoded).toBeDefined();
        expect(decoded?.type).toBe("ContractData");
        expect(decoded?.durability).toBe("Temporary");
        expect(decoded?.key).toBe("Admin");
        expect(decoded?.contractId).toBeDefined();
    });

    it("returns null for unsupported ledger key types", () => {
        const accountId = xdr.PublicKey.publicKeyTypeEd25519(Buffer.alloc(32, 3));
        const key = xdr.LedgerKey.account(new xdr.LedgerKeyAccount({
            accountId,
        })).toXDR("base64");

        const decoded = decodeLedgerKey(key);
        expect(decoded).toBeNull();
    });
});
