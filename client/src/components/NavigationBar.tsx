import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

export default function NavigationBar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <a className="text-xl font-bold text-primary">Library Nest</a>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/discover">
              <a className="text-gray-600 hover:text-gray-900">Discover</a>
            </Link>
            <Link href="/community">
              <a className="text-gray-600 hover:text-gray-900">Community</a>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Hi, {user?.username}</span>
          <Button variant="ghost" onClick={() => logout()}>
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
