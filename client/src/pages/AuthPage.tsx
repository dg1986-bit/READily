import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type FormData = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

export default function AuthPage() {
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginForm = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: FormData, isLogin: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await (isLogin ? login(data) : register(data));
      if (!result.ok) {
        setError(result.message);
        if (isLogin) {
          if (result.message.includes("Incorrect email")) {
            setError("The email address you entered isn't connected to an account.");
          } else if (result.message.includes("Incorrect password")) {
            setError("The password you entered is incorrect. Please try again.");
          } else {
            setError(result.message);
          }
        }
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">READily</CardTitle>
          <CardDescription className="text-center">
            A world of children's stories, delivered to your door
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit((data) => onSubmit(data, true))}>
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Email"
                    {...loginForm.register("email")}
                    disabled={isLoading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    {...loginForm.register("password")}
                    disabled={isLoading}
                  />
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit((data) => onSubmit(data, false))}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      {...registerForm.register("firstName")}
                      disabled={isLoading}
                    />
                    <Input
                      placeholder="Last Name"
                      {...registerForm.register("lastName")}
                      disabled={isLoading}
                    />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email"
                    {...registerForm.register("email")}
                    disabled={isLoading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    {...registerForm.register("password")}
                    disabled={isLoading}
                  />
                  <Button className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
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