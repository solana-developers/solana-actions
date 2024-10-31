import { z } from "zod";
import { publicKeySchema, numberFromStringSchema } from "../../utils/validation";

export const TransferSplQuerySchema = z.object({
  to: publicKeySchema,
  mint: publicKeySchema,
  amount: numberFromStringSchema({ 
    min: 1, 
    description: "SPL token amount" 
  })
});

export type TransferSolQuery = z.infer<typeof TransferSplQuerySchema>;