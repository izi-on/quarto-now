import { Button } from "../ui/button";

function GameGridBlock({ name }: { name: string }) {
  return (
    <Button className="text-lg w-32 h-32 justify-center outline outline-black items-center rounded-lg hover:scale-95 transition-transform">
      {name}
    </Button>
  );
}

export default GameGridBlock;
