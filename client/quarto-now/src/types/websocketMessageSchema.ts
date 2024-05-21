import { z } from "zod";

export const wsMessageSchema = z.object({
  // TODO: get this from protobuf perhaps?
  type: z.literal("message"),
  payload: z.string(),
});

export type wsMessage = z.infer<typeof wsMessageSchema>;
