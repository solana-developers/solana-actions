import { SignMessageData } from "@solana/actions-spec";

export interface SignMessageVerificationOptions {
  expectedAddress?: string;
  expectedDomains?: string[];
  expectedChainIds: string[];
  issuedAtThreshold?: number;
}

export enum SignMessageVerificationErrorType {
  ADDRESS_MISMATCH = "ADDRESS_MISMATCH",
  DOMAIN_MISMATCH = "DOMAIN_MISMATCH",
  CHAIN_ID_MISMATCH = "CHAIN_ID_MISMATCH",
  ISSUED_TOO_FAR_IN_THE_PAST = "ISSUED_TOO_FAR_IN_THE_PAST",
  ISSUED_TOO_FAR_IN_THE_FUTURE = "ISSUED_TOO_FAR_IN_THE_FUTURE",
}

/**
 * Create a human-readable message text for the user to sign. Interoperable with SIWS.
 *
 * @param input The data to be signed.
 * @returns The message text.
 */
export function createSignMessageText(input: SignMessageData): string {
  let message = `${input.domain} wants you to sign message with your account:\n`;
  message += `${input.address}`;

  if (input.statement) {
    message += `\n\n${input.statement}`;
  }

  const fields: string[] = [];

  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  if (input.nonce) {
    fields.push(`Nonce: ${input.nonce}`);
  }
  if (input.issuedAt) {
    fields.push(`Issued At: ${input.issuedAt}`);
  }
  if (fields.length) {
    message += `\n\n${fields.join("\n")}`;
  }

  return message;
}

/**
 * Verify the sign message data before signing.
 * @param data The data to be signed.
 * @param opts Options for verification, including the expected address, chainId, issuedAt, and domains.
 *
 * @returns An array of errors if the verification fails.
 */
export function verifySignMessageData(
  data: SignMessageData,
  opts: SignMessageVerificationOptions,
) {
  const {
    expectedAddress,
    expectedChainIds,
    issuedAtThreshold,
    expectedDomains,
  } = opts;
  const errors: SignMessageVerificationErrorType[] = [];
  const now = Date.now();

  // verify if parsed address is same as the expected address
  if (expectedAddress && data.address !== expectedAddress) {
    errors.push(SignMessageVerificationErrorType.ADDRESS_MISMATCH);
  }

  // verify if parsed domain is in the expected domains
  if (expectedDomains && !expectedDomains.includes(data.domain)) {
    errors.push(SignMessageVerificationErrorType.DOMAIN_MISMATCH);
  }

  // verify if parsed chainId is same as the expected chainId
  if (
    expectedChainIds &&
    data.chainId &&
    !expectedChainIds.includes(data.chainId)
  ) {
    errors.push(SignMessageVerificationErrorType.CHAIN_ID_MISMATCH);
  }

  // verify if parsed issuedAt is within +- issuedAtThreshold of the current timestamp
  if (issuedAtThreshold !== undefined) {
    const iat = Date.parse(data.issuedAt);
    if (Math.abs(iat - now) > issuedAtThreshold) {
      if (iat < now) {
        errors.push(
          SignMessageVerificationErrorType.ISSUED_TOO_FAR_IN_THE_PAST,
        );
      } else {
        errors.push(
          SignMessageVerificationErrorType.ISSUED_TOO_FAR_IN_THE_FUTURE,
        );
      }
    }
  }

  return errors;
}
