import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function NavigationBar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <span className="text-xl font-bold text-primary cursor-pointer">READily</span>
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/discover">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Discover</span>
            </Link>
            <Link href="/shelf">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">My Shelf</span>
            </Link>
            <Link href="/community">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Community</span>
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Hi, {user.firstName}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth">
              <Button variant="ghost">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}