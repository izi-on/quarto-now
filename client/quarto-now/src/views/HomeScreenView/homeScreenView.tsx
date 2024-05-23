import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { promptInput, promptInputSchema } from "@/types/gameInputSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { createRoom, generateHtmlCode } from "@/api/lobby";

export const HomeScreenView = () => {
  const form = useForm<promptInput>({
    resolver: zodResolver(promptInputSchema),
    defaultValues: {
      firstTurn: false,
    },
  });
  // const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [progVal, setProgVal] = useState(0);
  const onFormSubmit = useCallback((data: promptInput) => {
    console.log(data);
    setLoading(true);
    setProgVal(30);
    generateHtmlCode(data)
      .then(({ name, htmlCode }) => {
        setProgVal(90);
        return createRoom({
          gameId: uuidv4(),
          name: name,
          htmlCode: htmlCode,
        });
      })
      .then(({ roomId }) => {
        setProgVal(100);
        navigate(`/game-page-url/${roomId}`);
      });
  }, []);

  return (
    <div className="flex w-full h-[100vh] justify-center items-center">
      <div className="container mx-auto">
        {!loading && (
          <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
            <div className="flex gap-4 flex-col">
              <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
                Just Play!
              </h1>
              <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                Enter the instructions for your turn-based game!
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onFormSubmit)}
                className="w-1/2 space-y-8"
              >
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          className="overflow-auto"
                          placeholder="Example: Generate a Tic Tac Toe game!"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstTurn"
                  render={({ field }) => (
                    <FormItem className="space-x-3 items-center justify-center">
                      <FormControl>
                        <div className="flex flex-row space-x-3 items-center justify-center">
                          <Label>First Turn</Label>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">Play!</Button>
              </form>
            </Form>
          </div>
        )}
        {loading && (
          <div className="flex flex-col items-center">
            <h1 className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Loading...
            </h1>
            <Progress className="w-[50vh]" value={progVal} />
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
};
