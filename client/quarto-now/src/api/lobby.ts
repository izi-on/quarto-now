import { BASE_URL, GAME_SERVICE_PORT } from "@/lib/env";
import { validateWithZod } from "@/lib/utils";
import {
  responseGetHtmlCodeSchema,
  requestCreateRoom,
  responseCreateRoomSchema,
  responseGetHtmlCode,
  responseCreateRoom,
} from "@/types/apiSchemas";
import { promptInput } from "@/types/gameInputSchema";
import axios from "axios";

export async function getHtmlCode(
  data: promptInput,
): Promise<responseGetHtmlCode> {
  const response = await axios.post(
    `${BASE_URL}:${GAME_SERVICE_PORT}/create`,
    data,
  );

  return validateWithZod(responseGetHtmlCodeSchema)(response.data);
}

export async function createRoom(
  data: requestCreateRoom,
): Promise<responseCreateRoom> {
  const response = await axios.post(
    `${BASE_URL}:${GAME_SERVICE_PORT}/create`,
    data,
  );

  return validateWithZod(responseCreateRoomSchema)(response.data);
}
