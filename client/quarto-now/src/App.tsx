import "./App.css";
import { GAMES } from "./assets/game-input-definition";
import GameGridBlock from "./components/game-grid-block/game-grid-block";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Switch } from "./components/ui/switch";
import { inputSettings, inputSettingsSchema } from "./types/gameInputSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./components/ui/form";
import { Toaster } from "./components/ui/toaster";

function App() {
  const form = useForm<inputSettings>({
    resolver: zodResolver(inputSettingsSchema),
    defaultValues: {},
  });
  const onFormSubmit = (data: inputSettings) => {
    console.log(data);
  };
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
            {GAMES.map((game, gameIdx) => (
              <Dialog key={"app-GAMES-" + gameIdx}>
                <DialogTrigger>
                  <GameGridBlock name={game.displayName} />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      Game Config for {game.displayName}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onFormSubmit)}
                      className="space-y-8"
                    >
                      {game.requestedInputs.map((reqInp, idx) => (
                        <FormField
                          key={"app-GAMES-game-FormField-" + idx}
                          control={form.control}
                          name={reqInp.label}
                          render={({ field }) => {
                            const inpField = () => {
                              switch (reqInp.input) {
                                case "boolean":
                                  return (
                                    <Switch
                                      checked={field.value as boolean}
                                      onCheckedChange={field.onChange}
                                      aria-readonly
                                    />
                                  );
                                case "string":
                                  return <Input {...field} type="text" />;
                                case "integer":
                                  return <Input {...field} type="number" />;
                              }
                            };
                            return (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <FormLabel className="text-base">
                                  {reqInp.label}
                                </FormLabel>
                                <FormControl>{inpField()}</FormControl>
                                <FormMessage />
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <DialogFooter></DialogFooter>
                      <Button type="submit">Go!</Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
