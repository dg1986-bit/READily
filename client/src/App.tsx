import { Switch, Route } from "wouter";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import BookDiscovery from "./pages/BookDiscovery";
import Community from "./pages/Community";
import NavigationBar from "./components/NavigationBar";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={BookDiscovery} />
          <Route path="/community" component={Community} />
        </Switch>
      </main>
    </div>
  );
}

export default App;
