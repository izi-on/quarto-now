import { z } from "zod";

export const wsMessageSchema = z.object({
  // TODO: get this from protobuf perhaps?
  clientId: z.string(),
  type: z.union([z.literal("turnInfo"), z.literal("gameStart")]),
  jsonStr: z.string(),
  doesStart: z.boolean().optional(),
});

export type wsMessage = z.infer<typeof wsMessageSchema>;
