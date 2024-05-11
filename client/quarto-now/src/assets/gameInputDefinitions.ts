import { GameUserInput as GameDefitions } from "@/types/gameInputSchema";

export const GAMES: GameDefitions[] = [
  {
    id: "quarto",
    displayName: "Quarto",
    requestedInputs: [
      {
        name: "start-first",
        label: "Start First?",
        input: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "chess",
    displayName: "Chess",
    requestedInputs: [
      {
        name: "start-first",
        label: "Start First?",
        input: "boolean",
        defaultValue: false,
      },
    ],
  },
  {
    id: "connect-4",
    displayName: "Connect 4",
    requestedInputs: [
      {
        name: "start-first",
        label: "Start First?",
        input: "boolean",
        defaultValue: false,
      },
    ],
  },
];
