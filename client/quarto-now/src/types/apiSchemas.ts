import { z } from "zod";

// GET HTML CODE
export const responseGenerateHtmlCodeSchema = z.object({
  htmlCode: z.string(),
  name: z.string(),
});

export type responseGenerateHtmlCode = z.infer<
  typeof responseGenerateHtmlCodeSchema
>;

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

// GET HTML CODE
export const requestGetHtmlCodeSchema = z.object({
  roomId: z.string(),
});

export type requestGetHtmlCode = z.infer<typeof requestGetHtmlCodeSchema>;

export const responseGetHtmlCodeSchema = z.object({
  htmlCode: z.string(),
});

export type responseGetHtmlCode = z.infer<typeof responseGetHtmlCodeSchema>;
