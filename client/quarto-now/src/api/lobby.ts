import {
  BASE_URL,
  GAME_SERVICE_PORT,
  GENERATION_SERVICE_PORT,
  PROTOCOL,
} from "@/lib/env";
import { validateWithZod } from "@/lib/utils";
import {
  requestCreateRoom,
  responseCreateRoomSchema,
  responseGenerateHtmlCode,
  responseCreateRoom,
  requestGetHtmlCode,
  responseGetHtmlCode,
  responseGetHtmlCodeSchema,
  responseGenerateHtmlCodeSchema,
} from "@/types/apiSchemas";
import { promptInput } from "@/types/gameInputSchema";
import axios from "axios";
//
// export async function generateHtmlCode(
//   data: promptInput,
// ): Promise<responseGenerateHtmlCode> {
//   const response = await axios.post(
//     `${PROTOCOL}//${BASE_URL}:${GAME_SERVICE_PORT}/generate-game`,
//     data,
//   );
//
//   return validateWithZod(responseGenerateHtmlCodeSchema)(response.data);
// }
//

export async function generateHtmlCode(
  data: promptInput,
): Promise<responseGenerateHtmlCode> {
  try {
    const response = await axios.post(
      `${PROTOCOL}//${BASE_URL}:${GENERATION_SERVICE_PORT}/generate-game`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = response.data;
    return validateWithZod(responseGenerateHtmlCodeSchema)(responseData);
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function createRoom(
  data: requestCreateRoom,
): Promise<responseCreateRoom> {
  try {
    const response = await axios.post(
      `${PROTOCOL}//${BASE_URL}:${GAME_SERVICE_PORT}/create-room`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const responseData = response.data;
    return validateWithZod(responseCreateRoomSchema)(responseData);
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function getHtmlCode(
  data: requestGetHtmlCode,
): Promise<responseGetHtmlCode> {
  const url = new URL(
    `${PROTOCOL}//${BASE_URL}:${GAME_SERVICE_PORT}/get-game-html?roomId=${data.roomId}`,
  );

  const response = await fetch(url.toString(), {
    method: "GET",
  });

  if (response.body === null) {
    throw Error("Respose body is null");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let textResponse = "";

  const handleStream = new Promise<responseGetHtmlCode>((resolve, reject) => {
    const readStream = () => {
      reader
        .read()
        .then(({ done, value }) => {
          if (done) {
            try {
              const validatedResponse = validateWithZod(
                responseGetHtmlCodeSchema,
              )({
                htmlCode: textResponse,
              });
              resolve(validatedResponse);
            } catch (error) {
              reject(error);
            }
            return;
          }
          textResponse += decoder.decode(value, { stream: true });
          readStream();
        })
        .catch(reject);
    };
    readStream();
  });

  return await handleStream;
}
