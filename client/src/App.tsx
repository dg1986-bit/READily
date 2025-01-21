import { Switch, Route } from "wouter";
import { useUser } from "./hooks/use-user";
import { Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";
import BookDiscovery from "./pages/BookDiscovery";
import BookDetails from "./pages/BookDetails";
import Community from "./pages/Community";
import MyShelf from "./pages/MyShelf";
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

  // Auth page is now a standalone route instead of a redirect
  if (location.pathname === '/auth') {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationBar />
      <main className="container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/discover" component={BookDiscovery} />
          <Route path="/books/:id" component={BookDetails} />
          {/* Protected routes - require login */}
          <Route path="/shelf">
            {user ? <MyShelf /> : <AuthPage />}
          </Route>
          <Route path="/community">
            {user ? <Community /> : <AuthPage />}
          </Route>
          <Route path="/auth" component={AuthPage} />
        </Switch>
      </main>
    </div>
  );
}

export default App;