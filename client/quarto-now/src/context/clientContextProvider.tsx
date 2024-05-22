import { createContext } from "react";
import { v4 as uuidv4 } from "uuid";

export const ClientContext = createContext<{ clientId: string }>({
  clientId: "",
});

export const ClientContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ClientContext.Provider
      value={{
        clientId: uuidv4(),
      }}
    >
      {children}
    </ClientContext.Provider>
  );
};
