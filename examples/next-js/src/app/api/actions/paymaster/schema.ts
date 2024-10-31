import { z } from "zod";
import { publicKeySchema, numberFromStringSchema } from "../../utils/validation";

export const GenericTransactionExtensionSchema = z.object({
  blink: z.string(),
});

export type GenericTransactionExtension = z.infer<typeof GenericTransactionExtensionSchema>;