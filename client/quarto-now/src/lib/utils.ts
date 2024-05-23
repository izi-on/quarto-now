import { wsMessage } from "@/types/websocketMessageSchema";
import { type ClassValue, clsx } from "clsx";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import { ZodSchema } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const forwardToWebsocket = (ws: WebSocket) => {
  return (data: string) => {
    ws.send(data);
  };
};

export const sendMessageToIframe = (
  iFrameRef: React.RefObject<HTMLIFrameElement>,
) => {
  return (msg: wsMessage) => {
    iFrameRef.current?.contentWindow?.postMessage(msg.jsonStr, "*");
  };
};

export const validateWithZod = <T>(schema: ZodSchema<T>) => {
  return async (dataObj: object): Promise<T> => {
    const parsed = schema.safeParse(dataObj);
    if (parsed.success) {
      return parsed.data;
    } else {
      throw Error(`Unable to validate with Zod Schema: ${parsed.error.errors}`);
    }
  };
};

type CamelToSnakeMap = {
  [key: string]: string;
};

export function mapKeysToSnakeCase(obj: any, map: CamelToSnakeMap): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => mapKeysToSnakeCase(item, map));
  } else if (typeof obj === "object" && obj !== null) {
    const newObj: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const snakeKey = map[key] || key;
      newObj[snakeKey] = mapKeysToSnakeCase(obj[key], map);
    });
    return newObj;
  }
  return obj;
}
