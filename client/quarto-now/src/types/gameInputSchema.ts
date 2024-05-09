import { z } from "zod";

export const allowedInputTypeSchema = z.union([
  z.literal("string"),
  z.literal("integer"),
  z.literal("boolean"),
  z.undefined(),
]);

export type allowedInputTypeSchema = z.infer<typeof allowedInputTypeSchema>;

export const inputSettingsSchema = z.record(
  z.union([z.boolean(), z.string(), z.number()]),
);

export type inputSettings = z.infer<typeof inputSettingsSchema>;

export const gameUserInputSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  requestedInputs: z.array(
    z.object({
      label: z.string(),
      input: allowedInputTypeSchema,
    }),
  ),
});

export type gameUserInput = z.infer<typeof gameUserInputSchema>;
