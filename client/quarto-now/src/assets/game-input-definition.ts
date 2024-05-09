import { gameUserInput } from "@/types/gameInputSchema";

export const GAMES: gameUserInput[] = [
  {
    id: "quarto",
    displayName: "Quarto",
    requestedInputs: [{ label: "Start First?", input: "boolean" }],
  },
  {
    id: "chess",
    displayName: "Chess",
    requestedInputs: [{ label: "Start First?", input: "boolean" }],
  },
  {
    id: "connect-4",
    displayName: "Connect-4",
    requestedInputs: [{ label: "Start First?", input: "boolean" }],
  },
];
