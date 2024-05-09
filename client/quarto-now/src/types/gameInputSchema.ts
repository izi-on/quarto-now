import { z } from "zod";

const allowedInputTypes = z.union([
  z.literal("string"),
  z.literal("integer"),
  z.literal("boolean"),
]);

export const gameUserInputSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  requestedInputs: z.array(
    z.object({
      label: z.string(),
      input: allowedInputTypes,
    }),
  ),
});

export type gameUserInput = z.infer<typeof gameUserInputSchema>;
