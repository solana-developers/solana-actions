import {
  BLOCKCHAIN_IDS,
  createSignMessageText,
  parseSignMessageText,
  SignMessageVerificationErrorType,
  verifySignMessageData,
} from "../src";
import type { SignMessageData } from "@solana/actions-spec";

describe("Sign Message Functions", () => {
  const address = "A3NBDUBmaYhTr9Nvz9XePVvtLnXau3rMHJNRPodCDyET";
  const chainId = BLOCKCHAIN_IDS.mainnet;

  const validSignMessageData: SignMessageData = {
    domain: "example.com",
    address,
    statement: "Please sign this message",
    nonce: "abc1234567",
    issuedAt: new Date().toISOString(),
    chainId,
  };

  describe("createSignMessageText", () => {
    it("should create a properly formatted sign message text", () => {
      const expectedMessage = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Chain ID: ${validSignMessageData.chainId}
Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
      `.trim();
      const text = createSignMessageText(validSignMessageData);
      expect(text).toBe(expectedMessage);
    });

    it("should omit optional fields if not provided", () => {
      const data = {
        ...validSignMessageData,
        chainId: undefined,
      };
      const expectedMessage = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
      `.trim();
      const text = createSignMessageText(data);
      expect(text).toBe(expectedMessage);
    });

    it("should handle missing optional fields with minimal input", () => {
      const minimalData: SignMessageData = {
        domain: "test.com",
        address,
        statement: "Sign in to continue",
        nonce: "xyz9876543",
        issuedAt: new Date().toISOString(),
      };

      const expectedMessage = `
test.com wants you to sign a message with your account:
${minimalData.address}

${minimalData.statement}

Nonce: ${minimalData.nonce}
Issued At: ${minimalData.issuedAt}
      `.trim();
      const text = createSignMessageText(minimalData);
      expect(text).toBe(expectedMessage);
    });
  });

  describe("parseSignMessageText", () => {
    it("should parse a valid sign message text", () => {
      const text = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Chain ID: ${validSignMessageData.chainId}
Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
        `.trim();

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toStrictEqual(validSignMessageData);
    });

    it("should parse a sign message without optional chainId", () => {
      const text = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
        `.trim();

      const expectedData = {
        ...validSignMessageData,
        chainId: undefined,
      };

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toStrictEqual(expectedData);
    });

    it("should return null for missing nonce", () => {
      const text = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Issued At: ${validSignMessageData.issuedAt}
        `.trim();

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toBeNull();
    });

    it("should return null for missing issuedAt", () => {
      const text = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}

${validSignMessageData.statement}

Nonce: ${validSignMessageData.nonce}
        `.trim();

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toBeNull();
    });

    it("should return null for missing statement", () => {
      const text = `
example.com wants you to sign a message with your account:
${validSignMessageData.address}
Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
        `.trim();

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toBeNull();
    });

    it("should return null for missing domain", () => {
      const text = `
${validSignMessageData.address}

${validSignMessageData.statement}

Nonce: ${validSignMessageData.nonce}
Issued At: ${validSignMessageData.issuedAt}
        `.trim();

      const parsedData = parseSignMessageText(text);
      expect(parsedData).toBeNull();
    });
  });

  describe("E2E Test: Generation and Parsing", () => {
    it("should generate and parse a valid sign message (with chainId)", () => {
      // Step 1: Generate sign message text
      const generatedMessage = createSignMessageText(validSignMessageData);

      // Step 2: Parse the generated message
      const parsedData = parseSignMessageText(generatedMessage);

      // Step 3: Verify that the parsed data matches the original input data
      expect(parsedData).toStrictEqual(validSignMessageData);
    });

    it("should generate and parse a valid sign message (without chainId)", () => {
      const dataWithoutChainId = {
        ...validSignMessageData,
        chainId: undefined,
      };

      // Step 1: Generate sign message text
      const generatedMessage = createSignMessageText(dataWithoutChainId);

      // Step 2: Parse the generated message
      const parsedData = parseSignMessageText(generatedMessage);

      // Step 3: Verify that the parsed data matches the original input data
      expect(parsedData).toStrictEqual(dataWithoutChainId);
    });
  });

  describe("verifySignMessageData", () => {
    const verificationOptions = {
      expectedAddress: address,
      expectedChainIds: [BLOCKCHAIN_IDS.mainnet],
      issuedAtThreshold: 10000, // 10 seconds
      expectedDomains: ["example.com"],
    };

    it("should pass verification with valid data", () => {
      const errors = verifySignMessageData(
        validSignMessageData,
        verificationOptions,
      );
      expect(errors).toStrictEqual([]);
    });

    it("should pass verification with www domain data", () => {
      const opts = {
        expectedDomains: ["www.example.com"],
      };

      const errors = verifySignMessageData(validSignMessageData, opts);
      expect(errors).toStrictEqual([]);
    });

    it("should return ADDRESS_MISMATCH error if the address does not match", () => {
      const opts = {
        ...verificationOptions,
        expectedAddress: "wrong_address",
      };

      const errors = verifySignMessageData(validSignMessageData, opts);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.ADDRESS_MISMATCH,
      ]);
    });

    it("should return DOMAIN_MISMATCH error if the domain does not match", () => {
      const opts = {
        ...verificationOptions,
        expectedDomains: ["wrong.com"],
      };

      const errors = verifySignMessageData(validSignMessageData, opts);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.DOMAIN_MISMATCH,
      ]);
    });

    it("should return CHAIN_ID_MISMATCH error if the chainId does not match", () => {
      const opts = {
        ...verificationOptions,
        expectedChainIds: [BLOCKCHAIN_IDS.testnet],
      };

      const errors = verifySignMessageData(validSignMessageData, opts);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.CHAIN_ID_MISMATCH,
      ]);
    });

    it("should return ISSUED_TOO_FAR_IN_THE_PAST if issuedAt is too old", () => {
      const data = {
        ...validSignMessageData,
        issuedAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago
      };

      const errors = verifySignMessageData(data, verificationOptions);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.ISSUED_TOO_FAR_IN_THE_PAST,
      ]);
    });

    it("should return ISSUED_TOO_FAR_IN_THE_FUTURE if issuedAt is too far in the future", () => {
      const data = {
        ...validSignMessageData,
        issuedAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour ahead
      };

      const errors = verifySignMessageData(data, verificationOptions);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.ISSUED_TOO_FAR_IN_THE_FUTURE,
      ]);
    });

    it("should return INVALID_DATA for missing required fields", () => {
      const invalidData = {
        domain: "example.com",
        address,
        statement: undefined,
        nonce: undefined,
        issuedAt: undefined,
      } as any;

      const errors = verifySignMessageData(invalidData, verificationOptions);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.INVALID_DATA,
      ]);
    });

    it("should return multiple errors if there are multiple issues with the data", () => {
      const invalidData: SignMessageData = {
        domain: "wrong.com",
        address: "wrong_address",
        statement: "Invalid test",
        nonce: "invalid_nonce",
        issuedAt: new Date(Date.now() - 3600 * 1000).toISOString(), // Issued 1 hour ago
        chainId: BLOCKCHAIN_IDS.testnet,
      };

      const opts = {
        expectedAddress: address,
        expectedChainIds: [BLOCKCHAIN_IDS.mainnet],
        issuedAtThreshold: 10000, // 10 seconds
        expectedDomains: ["example.com"],
      };

      const errors = verifySignMessageData(invalidData, opts);
      expect(errors).toStrictEqual([
        SignMessageVerificationErrorType.ADDRESS_MISMATCH,
        SignMessageVerificationErrorType.DOMAIN_MISMATCH,
        SignMessageVerificationErrorType.CHAIN_ID_MISMATCH,
        SignMessageVerificationErrorType.ISSUED_TOO_FAR_IN_THE_PAST,
      ]);
    });
  });
});
