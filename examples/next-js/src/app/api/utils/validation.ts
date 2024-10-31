import { z } from "zod";
import { PublicKey } from "@solana/web3.js";

/**
 * Zod Schema Validation Utilities
 *
 * Zod is a TypeScript-first schema validation library that allows us to:
 * 1. Define the shape and requirements of our data
 * 2. Parse and transform input data
 * 3. Generate TypeScript types from our schemas
 * 4. Provide detailed error messages
 */

/**
 * Schema for validating Solana public keys
 *
 * This schema:
 * 1. Accepts a string input
 * 2. Attempts to create a Solana PublicKey from the string
 * 3. Returns the PublicKey object if valid
 * 4. Provides a clear error message if invalid
 *
 * Usage:
 * const result = publicKeySchema.safeParse("ABC123...")
 * if (result.success) {
 *   const pubkey: PublicKey = result.data
 * }
 */
export const publicKeySchema = z.string().transform((val, ctx) => {
  try {
    return new PublicKey(val);
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid public key",
    });
    return z.NEVER;
  }
});

/**
 * Creates a schema for parsing and validating numeric values from strings
 *
 * Features:
 * 1. Converts string input to number
 * 2. Validates the number is not NaN
 * 3. Optionally checks minimum and maximum bounds
 * 4. Provides contextual error messages
 *
 * @param options Configuration object for validation
 * @param options.min Minimum allowed value (inclusive)
 * @param options.max Maximum allowed value (inclusive)
 * @param options.description Human-readable description of the field for error messages
 *
 * Usage:
 * const amountSchema = numberFromStringSchema({
 *   min: 0,
 *   max: 100,
 *   description: "token amount"
 * })
 */
export const numberFromStringSchema = (options?: {
  min?: number;
  max?: number;
  description?: string;
}) => {
  // First transform string to number and validate it's a valid number
  let schema = z.string().transform((val, ctx) => {
    const parsed = Number(val);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid number format${
          options?.description ? ` for ${options.description}` : ""
        }`,
      });
      return z.NEVER;
    }
    return parsed;
  });

  // Then apply any min/max constraints to the resulting number
  let baseNumberSchema = z.number();
  if (options?.min !== undefined) {
    baseNumberSchema = baseNumberSchema.min(
      options.min,
      `Value must be greater than ${options.min}`,
    );
  }
  if (options?.max !== undefined) {
    baseNumberSchema = baseNumberSchema.max(
      options.max,
      `Value must be less than ${options.max}`,
    );
  }

  // Chain the string->number transform with the number validation
  return schema.pipe(baseNumberSchema);
};

/**
 * Type helper for getting the type of a validated public key
 * This will resolve to the Solana PublicKey type
 */
export type ZodPublicKey = z.infer<typeof publicKeySchema>;

/**
 * Creates a function to parse URL search parameters using a Zod schema
 *
 * Features:
 * 1. Type-safe parsing of URL parameters
 * 2. Automatic error handling
 * 3. Schema-driven validation
 * 4. Consistent error messages
 *
 * @param schema The Zod schema to validate against
 * @returns A function that parses URL search params using the schema
 *
 * Usage:
 * const parseParams = createQueryParser(MyQuerySchema);
 * const params = parseParams(new URL(request.url));
 */
export function createQueryParser<
  TOutput,
  TTypeDef extends z.ZodTypeDef,
  IInput,
>(schema: z.ZodSchema<TOutput, TTypeDef, IInput>) {
  return function parseQueryParams(requestUrl: URL): TOutput {
    const result = schema.safeParse(
      Object.fromEntries(requestUrl.searchParams),
    );

    if (!result.success) {
      throw result.error;
    }

    return result.data;
  };
}
