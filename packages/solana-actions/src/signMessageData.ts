import type { SignMessageData } from "@solana/actions-spec";

export interface SignMessageVerificationOptions {
  expectedAddress?: string;
  expectedDomains?: string[];
  expectedChainIds?: string[];
  issuedAtThreshold?: number;
}

export enum SignMessageVerificationErrorType {
  ADDRESS_MISMATCH = "ADDRESS_MISMATCH",
  DOMAIN_MISMATCH = "DOMAIN_MISMATCH",
  CHAIN_ID_MISMATCH = "CHAIN_ID_MISMATCH",
  ISSUED_TOO_FAR_IN_THE_PAST = "ISSUED_TOO_FAR_IN_THE_PAST",
  ISSUED_TOO_FAR_IN_THE_FUTURE = "ISSUED_TOO_FAR_IN_THE_FUTURE",
  INVALID_DATA = "INVALID_DATA",
}

const DOMAIN =
  "(?<domain>[^\\n]+?) wants you to sign a message with your account:\\n";
const ADDRESS = "(?<address>[^\\n]+)(?:\\n|$)";
const STATEMENT = "(?:\\n(?<statement>[\\S\\s]*?)(?:\\n|$))";
const CHAIN_ID = "(?:\\nChain ID: (?<chainId>[^\\n]+))?";
const NONCE = "\\nNonce: (?<nonce>[^\\n]+)";
const ISSUED_AT = "\\nIssued At: (?<issuedAt>[^\\n]+)";
const FIELDS = `${CHAIN_ID}${NONCE}${ISSUED_AT}`;
const MESSAGE = new RegExp(`^${DOMAIN}${ADDRESS}${STATEMENT}${FIELDS}\\n*$`);

/**
 * Create a human-readable message text for the user to sign.
 *
 * @param input The data to be signed.
 * @returns The message text.
 */
export function createSignMessageText(input: SignMessageData): string {
  let message = `${input.domain} wants you to sign a message with your account:\n`;
  message += `${input.address}`;
  message += `\n\n${input.statement}`;
  const fields: string[] = [];

  if (input.chainId) {
    fields.push(`Chain ID: ${input.chainId}`);
  }
  fields.push(`Nonce: ${input.nonce}`);
  fields.push(`Issued At: ${input.issuedAt}`);
  message += `\n\n${fields.join("\n")}`;

  return message;
}

/**
 * Parse the sign message text to extract the data to be signed.
 * @param text The message text to be parsed.
 */
export function parseSignMessageText(text: string): SignMessageData | null {
  const match = MESSAGE.exec(text);
  if (!match) return null;
  const groups = match.groups;
  if (!groups) return null;

  return {
    domain: groups.domain,
    address: groups.address,
    statement: groups.statement,
    nonce: groups.nonce,
    chainId: groups.chainId,
    issuedAt: groups.issuedAt,
  };
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
  if (
    !data.address ||
    !data.domain ||
    !data.issuedAt ||
    !data.nonce ||
    !data.statement
  ) {
    return [SignMessageVerificationErrorType.INVALID_DATA];
  }

  try {
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

    if (expectedDomains) {
      const expectedDomainsNormalized = expectedDomains.map(normalizeDomain);
      const normalizedDomain = normalizeDomain(data.domain);

      if (!expectedDomainsNormalized.includes(normalizedDomain)) {
        errors.push(SignMessageVerificationErrorType.DOMAIN_MISMATCH);
      }
    }

    if (
      expectedChainIds &&
      data.chainId &&
      !expectedChainIds.includes(data.chainId)
    ) {
      errors.push(SignMessageVerificationErrorType.CHAIN_ID_MISMATCH);
    }

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
  } catch (e) {
    return [SignMessageVerificationErrorType.INVALID_DATA];
  }
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, "");
}
