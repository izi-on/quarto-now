import { BASE_URL, GAME_SERVICE_PORT } from "@/lib/env";
import { validateWithZod } from "@/lib/utils";
import {
  responseGenerateHtmlCodeSchema,
  requestCreateRoom,
  responseCreateRoomSchema,
  responseGenerateHtmlCode,
  responseCreateRoom,
  requestGetHtmlCode,
  responseGetHtmlCode,
  responseGetHtmlCodeSchema,
} from "@/types/apiSchemas";
import { promptInput } from "@/types/gameInputSchema";
import axios from "axios";

export async function generateHtmlCode(
  data: promptInput,
): Promise<responseGenerateHtmlCode> {
  const response = await axios.post(
    `${BASE_URL}:${GAME_SERVICE_PORT}/create`,
    data,
  );

  return validateWithZod(responseGenerateHtmlCodeSchema)(response.data);
}

export async function createHtmlCode(
  data: requestCreateRoom,
): Promise<responseCreateRoom> {
  const response = await axios.post(
    `${BASE_URL}:${GAME_SERVICE_PORT}/create`,
    data,
  );

  return validateWithZod(responseCreateRoomSchema)(response.data);
}

export async function getHtmlCode(
  data: requestGetHtmlCode,
): Promise<responseGetHtmlCode> {
  return fetch("/test.html")
    .then((val) => {
      return val.text();
    })
    .then((val) => ({ htmlCode: val }));
}

// export async function getHtmlCode(
//   data: requestGetHtmlCode,
// ): Promise<responseGetHtmlCode> {
//   const response = await axios({
//     method: "get",
//     url: `${BASE_URL}:${GAME_SERVICE_PORT}/get-game-html`,
//     responseType: "stream",
//     params: data,
//   });
//
//   const textResponse: string[] = [];
//
//   const handleStream = new Promise<responseGetHtmlCode>((resolve, reject) => {
//     response.data.on("data", (chunk: Buffer) => {
//       textResponse.push(chunk.toString("utf8"));
//     });
//
//     response.data.on("end", () => {
//       const finalStr = textResponse.join("");
//       try {
//         const validatedResponse = validateWithZod(responseGetHtmlCodeSchema)({
//           htmlCode: finalStr,
//         });
//         resolve(validatedResponse);
//       } catch (error) {
//         reject(error);
//       }
//     });
//
//     response.data.on("error", (error: Error) => {
//       reject(error);
//     });
//   });
//
//   return await handleStream;
// }
