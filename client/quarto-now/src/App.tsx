import "./App.css";
import { GAMES } from "./assets/game-input-definition";
import GameGridBlock from "./components/game-grid-block/game-grid-block";

function App() {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              Just Play!
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Select a game to play and pass the link :)
            </p>
          </div>
          <div className="grid justify-center align-middle grid-cols-3 gap-4">
            {GAMES.map((game) => (
              <GameGridBlock
                name={game.displayName}
                onClick={() => handleGameClick(game)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
