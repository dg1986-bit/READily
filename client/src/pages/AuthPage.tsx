import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type FormData = {
  username: string;
  password: string;
};

export default function AuthPage() {
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData, isLogin: boolean) => {
    setIsLoading(true);
    try {
      const result = await (isLogin ? login(data) : register(data));
      if (!result.ok) {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Library Nest</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))}>
                <div className="space-y-4">
                  <Input
                    placeholder="Username"
                    {...form.register("username")}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    {...form.register("password")}
                  />
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Login"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))}>
                <div className="space-y-4">
                  <Input
                    placeholder="Username"
                    {...form.register("username")}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    {...form.register("password")}
                  />
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Register"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
