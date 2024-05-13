import { createContext, useState } from "react";

export const WebsocketContext = createContext<{
  websocket: WebSocket | undefined;
  setWebsocket: React.Dispatch<React.SetStateAction<WebSocket | undefined>>;
}>({
  websocket: undefined,
  setWebsocket: () => {},
});

export const WebSocketContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [websocket, setWebsocket] = useState<WebSocket | undefined>();

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
