import { MutableRefObject, createContext, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export const ClientContext = createContext<{
  clientId: MutableRefObject<string> | undefined;
}>({
  clientId: undefined,
});

export const ClientContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const clientId = useRef(uuidv4());
  return (
    <ClientContext.Provider
      value={{
        clientId: clientId,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
