import { WebsocketContext } from "@/context/webSocketContextProvider";
import { useContext } from "react";

export const useWebsocket = () => {
  return useContext(WebsocketContext);
};
