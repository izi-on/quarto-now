import { createContext, useState } from "react";
import { Socket } from "socket.io-client";

export const WebsocketContext = createContext<{
  websocket: Socket | undefined;
  setWebsocket: React.Dispatch<React.SetStateAction<Socket | undefined>>;
}>({
  websocket: undefined,
  setWebsocket: () => {},
});

export const WebSocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [websocket, setWebsocket] = useState<Socket | undefined>();

  return (
    <WebsocketContext.Provider
      value={{
        websocket: websocket,
        setWebsocket: setWebsocket,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};
