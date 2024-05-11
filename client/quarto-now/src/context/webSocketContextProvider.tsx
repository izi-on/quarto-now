import { createContext, useEffect, useState } from "react";

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

  useEffect(() => {
    return () => {
      if (websocket !== undefined && [0, 1].includes(websocket.readyState)) {
        websocket.close();
      }
    };
  });

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
