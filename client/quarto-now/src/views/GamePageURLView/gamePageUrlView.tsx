import { getHtmlCode } from "@/api/lobby";
import { Input } from "@/components/ui/input";
import { ClientContext } from "@/context/clientContextProvider";
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
  const { lobbyId } = useParams();
  if (lobbyId === undefined) {
    throw Error("lobby id is not defined!");
  }
  const [htmlString, setHtmlString] = useState("");
  const [secondPlayerConnected, setSecondPlayerConnected] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { clientId } = useContext(ClientContext);

  const createEventHandler = useCallback((websocket: WebSocket) => {
    return (msg: MessageEvent) => {
      if (
        iframeRef.current === null ||
        msg.source !== iframeRef.current.contentWindow
      ) {
        return;
      }
      if (websocket === undefined) {
        console.error("websocket is undefined cannot send msg");
        return;
      }
      console.log("websocket is defined!");
      if (clientId === undefined) {
        throw Error("client id is undefined");
      }
      const msgWS: wsMessage = {
        clientId: clientId.current,
        type: "turnInfo",
        jsonStr: msg.data,
      };
      forwardToWebsocket(websocket)(JSON.stringify(msgWS));
    };
  }, []);

  const handlerWebsocketMsg = useCallback((data: string) => {
    validateWithZod(wsMessageSchema)(JSON.parse(data))
      .then(({ clientId, type, jsonStr, doesStart }) => {
        switch (type) {
          case "turnInfo":
            console.log({
              clientId,
              type,
              jsonStr,
              doesStart,
            });
            sendMessageToIframe(iframeRef)({
              clientId,
              type,
              jsonStr,
              doesStart,
            });
            break;
          case "gameStart":
            setSecondPlayerConnected(true);
            if (doesStart) {
              // console.log({
              //   clientId,
              //   type,
              //   jsonStr: '{"type":"turn","move":"{}"}',
              //   doesStart,
              // });
              //
              setTimeout(() => {
                sendMessageToIframe(iframeRef)({
                  clientId,
                  type,
                  jsonStr: '{"type":"turn","move":"{}"}',
                  doesStart,
                });
              }, 200);
            }
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
  }, [lobbyId]);

  //websocket connection hook
  useEffect(() => {
    if (htmlString === "") {
      console.log(
        "Waiting until htmlCode is fetched before establishing websocket",
      );
      return;
    }
    if (clientId === undefined) {
      throw Error("client id ref not defined!");
    }
    console.log("ESTABLISHING WEBSOCKET CONNECTION");
    const conn = new WebSocket(
      `ws://${BASE_URL}:${LOBBY_SERVICE_PORT}/lobby-service?clientId=${clientId.current}&roomId=${lobbyId}`,
    );

    const handleOpen = () => {
      console.log("websocket connected");
    };
    conn.onopen = handleOpen;

    const handleMsg = (event: MessageEvent) => {
      const data = event.data;
      console.log(data);
      handlerWebsocketMsg(data);
    };
    conn.onmessage = handleMsg;

    const handleErr = (event: Event) => {
      console.error("WebSocket error:", event);
    };
    conn.onerror = handleErr;

    const handleClose = () => {
      console.log("websocket disconnected");
    };
    conn.onclose = handleClose;

    const handleEventMsg = createEventHandler(conn);
    window.addEventListener("message", handleEventMsg);

    return () => {
      console.log("closing websocket");
      conn.close();
      window.removeEventListener("message", handleEventMsg);
    };
  }, [lobbyId, handlerWebsocketMsg, createEventHandler, htmlString]);

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
            <Input
              // TODO: include protocol?
              value={`${BASE_URL}:5173/game-page-url/${lobbyId}`} // TODO: make env var for webapp port
            />
          </div>
        </div>
      )}
      {secondPlayerConnected && htmlString !== "" && (
        <div className="w-full h-full">
          <iframe
            ref={iframeRef}
            src={"http://localhost:5173"}
            sandbox="allow-scripts allow-same-origin allow-modals"
            srcDoc={`${htmlString}`}
            className="bg-green-500"
            style={{ width: "100%", height: "500px", border: "1px solid #ccc" }}
          />
        </div>
      )}
    </div>
  );
};
