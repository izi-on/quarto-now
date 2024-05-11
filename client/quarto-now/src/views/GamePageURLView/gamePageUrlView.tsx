import { Input } from "@/components/ui/input";
import { useWebsocket } from "@/hooks/useWebsocket";
import { LOBBY_WEBSOCKET_BASE } from "@/lib/env";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const GamePageUrlView = () => {
  const [loadingLink, setLoadingLink] = useState(true);
  const { lobbyId } = useParams();
  const { websocket, setWebsocket } = useWebsocket();
  console.log(lobbyId);

  useEffect(() => {
    console.log(LOBBY_WEBSOCKET_BASE);
    const conn = new WebSocket(`${LOBBY_WEBSOCKET_BASE}/${lobbyId}`);
    setWebsocket(conn);

    conn.onopen = () => {
      console.log("websocket connected");
      conn.send("client is connected");
    };

    conn.onmessage = (event) => {
      console.log("Via WS" + event.data);
    };

    conn.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    conn.onclose = () => {
      console.log("websocket disconnected");
      setWebsocket(undefined);
    };
  }, []);

  return (
    <div className="flex h-screen justify-center items-center mx-auto">
      <div className="flex flex-col text-center py-14 gap-4 items-center">
        <div className="flex flex-col gap-2 space-y-4">
          <h1 className="text-3xl font-bold">Waiting Room</h1>
          <h3 className="text-2xl font-regular">
            Send this link to your friends to start playing!
          </h3>
          <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl">
            When your friend clicks on the link, your game will start
          </p>
        </div>
        <div className="flex flex-row gap-4">
          {loadingLink && <h1>Loading...</h1>}
          {loadingLink && <Input value={"https:localhost//ideklmaoooo"} />}
        </div>
      </div>
    </div>
  );
};
