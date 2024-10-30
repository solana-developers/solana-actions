import { z } from "zod";
import { DEFAULT_SOL_AMOUNT } from "./const";
import { publicKeySchema, numberFromStringSchema } from "../../utils/validation";

export const TransferSolQuerySchema = z.object({
  to: publicKeySchema,
  amount: numberFromStringSchema({ 
    min: 0, 
    description: "SOL amount" 
  })
    .optional()
    .default(DEFAULT_SOL_AMOUNT.toString()),
});

export type TransferSolQuery = z.infer<typeof TransferSolQuerySchema>;