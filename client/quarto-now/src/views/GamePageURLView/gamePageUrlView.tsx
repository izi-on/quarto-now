import { io } from "socket.io-client";
import { getHtmlCode } from "@/api/lobby";
import { Input } from "@/components/ui/input";
import { ClientContext } from "@/context/clientContextProvider";
import { useWebsocket } from "@/hooks/useWebsocket";
import { BASE_URL, LOBBY_SERVICE_PORT } from "@/lib/env";
import {
  forwardToWebsocket,
  sendMessageToIframe,
  validateWithZod,
} from "@/lib/utils";
import { wsMessage, wsMessageSchema } from "@/types/websocketMessageSchema";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

export const GamePageUrlView = () => {
  const [gameLink, setGameLink] = useState(true);
  const { lobbyId } = useParams();
  if (lobbyId === undefined) {
    throw Error("lobby id is not defined!");
  }
  const { websocket, setWebsocket } = useWebsocket();
  const [htmlString, setHtmlString] = useState("");
  const [secondPlayerConnected, setSecondPlayerConnected] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clientId } = useContext(ClientContext);

  //handler for iframe msgs
  const handleEventMsg = useCallback(
    (msg: MessageEvent<wsMessage>) => {
      if (msg.data.jsonStr === undefined) return;
      if (websocket === undefined) {
        console.error("websocket is undefined cannot send msg");
        return;
      }
      validateWithZod(wsMessageSchema)(JSON.parse(msg.data.jsonStr))
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
      .then(({ type, jsonStr: payload }) => {
        switch (type) {
          case "turnInfo":
            sendMessageToIframe(iframeRef)({ type, jsonStr: payload });
            break;
          case "gameStart":
            setSecondPlayerConnected(true);
            break;
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  //fetch the html code for the game
  useEffect(() => {
    getHtmlCode({ roomId: lobbyId }).then(({ htmlCode }) => {
      setHtmlString(htmlCode);
    });
  });

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

  //websocket connection hook
  useEffect(() => {
    console.log(BASE_URL);
    console.log("ESTABLISHING WEBSOCKET CONNECTION");
    const conn = io(`${BASE_URL}/${lobbyId}`, {
      extraHeaders: {
        clientId: clientId,
        roomId: lobbyId,
      },
    });
    setWebsocket(conn);

    const handleOpen = () => {
      console.log("websocket connected");
    };
    conn.on("connect", handleOpen);

    const handleMsg = (data: string) => {
      console.log("Via WS:" + data);
      handlerWebsocketMsg(data);
    };
    conn.on("message", handleMsg);

    const handleErr = (error: string) => {
      console.error("WebSocket error: ", error);
    };
    conn.on("error", handleErr);

    const handleClose = () => {
      console.log("websocket disconnected");
      setWebsocket(undefined);
    };
    conn.on("close", handleClose);

    return () => {
      console.log("closing websocket");
      conn.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen justify-center items-center mx-auto">
      {htmlString === "" && <div>Getting code for the game...</div>}
      {!secondPlayerConnected && htmlString !== "" && (
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
            <Input value={`${BASE_URL}:${LOBBY_SERVICE_PORT}/${lobbyId}`} />
          </div>
        </div>
      )}
      {secondPlayerConnected && htmlString !== "" && (
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
