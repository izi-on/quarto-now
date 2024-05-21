import { z } from "zod";

// GET HTML CODE
export const responseGetHtmlCodeSchema = z.object({
  htmlCode: z.string(),
  name: z.string(),
});

export type responseGetHtmlCode = z.infer<typeof responseGetHtmlCodeSchema>;

// CREATE ROOM
export const requestCreateRoomSchema = z.object({
  gameId: z.string(),
  name: z.string(),
  htmlCode: z.string(),
});

export type requestCreateRoom = z.infer<typeof requestCreateRoomSchema>;

export const responseCreateRoomSchema = z.object({
  roomId: z.string(),
});

export type responseCreateRoom = z.infer<typeof responseCreateRoomSchema>;
