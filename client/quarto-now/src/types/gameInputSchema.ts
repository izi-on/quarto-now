import { z } from "zod";

export const AllowedLiteralTypeInputSchema = z.union([
  z.literal("string"),
  z.literal("integer"),
  z.literal("boolean"),
  z.undefined(),
]);

export type AllowedLiteralTypeInput = z.infer<
  typeof AllowedLiteralTypeInputSchema
>;

export const AllowedTypeInputSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
]);

export type AllowedTypeInput = z.infer<typeof AllowedTypeInputSchema>;

export const InputSettingsSchema = z.record(
  z.union([z.boolean(), z.string(), z.number()]),
);

export type InputSettings = z.infer<typeof InputSettingsSchema>;

export const GameUserInputSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  requestedInputs: z.array(
    z.object({
      name: z.string(),
      label: z.string(),
      input: AllowedLiteralTypeInputSchema, //this needs to be the same tpye as defaultValue
      defaultValue: AllowedTypeInputSchema, //this needs to be the same type as input
    }),
  ),
});

export type GameUserInput = z.infer<typeof GameUserInputSchema>;
