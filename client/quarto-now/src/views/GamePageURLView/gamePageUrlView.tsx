import { Input } from "@/components/ui/input";
import { useWebsocket } from "@/hooks/useWebsocket";
import { LOBBY_WEBSOCKET_BASE } from "@/lib/env";
import {
  forwardToWebsocket,
  sendMessageToIframe,
  validateWithZod,
} from "@/lib/utils";
import { wsMessage, wsMessageSchema } from "@/types/websocketMessageSchema";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export const GamePageUrlView = () => {
  const [loadingLink, setLoadingLink] = useState(true);
  const { lobbyId } = useParams();
  const { websocket, setWebsocket } = useWebsocket();
  const [htmlString, setHtmlString] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  //handler for iframe msgs
  const handleEventMsg = useCallback(
    (msg: MessageEvent<wsMessage>) => {
      if (msg.data.payload === undefined) return;
      if (websocket === undefined) {
        console.error("websocket is undefined cannot send msg");
        return;
      }
      validateWithZod(wsMessageSchema)(JSON.parse(msg.data.payload))
        .then(JSON.stringify)
        .then(forwardToWebsocket(websocket))
        .catch((err) => {
          console.error(err);
        });
    },
    [websocket],
  );

  const handlerWebsocketMsg = useCallback((data: string) => {
    validateWithZod(wsMessageSchema)(JSON.parse(data))
      .then(sendMessageToIframe(iframeRef))
      .catch((err) => {
        console.error(err);
      });
  }, []);

  //capture new inputs from the iframe
  useEffect(() => {
    window.addEventListener("message", handleEventMsg);
    return () => window.removeEventListener("message", handleEventMsg);
  }, []);

  useEffect(() => {
    fetch("/test.html")
      .then((val) => {
        val.text().then(setHtmlString);
      })
      .catch((err) => {
        console.log("Couldn't fetch the code for the game", err);
      });
  }, []);

  useEffect(() => {
    console.log(LOBBY_WEBSOCKET_BASE);
    console.log("ESTABLISHING WEBSOCKET CONNECTION");
    const conn = new WebSocket(`${LOBBY_WEBSOCKET_BASE}/${lobbyId}`);
    setWebsocket(conn);

    conn.onopen = () => {
      console.log("websocket connected");
      conn.send("client is connected");
    };

    conn.onmessage = (event) => {
      console.log("Via WS:" + event.data);
      handlerWebsocketMsg(event.data);
    };

    conn.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    conn.onclose = () => {
      console.log("websocket disconnected");
      setWebsocket(undefined);
    };

    return () => {
      console.log("closing websocket");
      conn.close();
    };
  }, []);

  return (
    <div className="flex h-screen justify-center items-center mx-auto">
      {htmlString === "" && (
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
            {loadingLink && <Input value={"https:localhost//ideklmaoooo"} />}
          </div>
        </div>
      )}
      {htmlString !== "" && (
        <div>
          <iframe
            ref={iframeRef}
            src={"http://localhost:5173"}
            sandbox="allow-scripts allow-same-origin"
            srcDoc={`${htmlString}`}
            style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
};
