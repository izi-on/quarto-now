import { z } from "zod";

export const wsMessageSchema = z.object({
  // TODO: get this from protobuf perhaps?
  clientId: z.string(),
  type: z.union([z.literal("turnInfo"), z.literal("gameStart")]),
  jsonStr: z.string(),
});

export type wsMessage = z.infer<typeof wsMessageSchema>;
