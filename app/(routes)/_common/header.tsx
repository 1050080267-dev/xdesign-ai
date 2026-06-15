"use client"
import Logo from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user } = useKindeBrowserClient();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user?.id) {
      fetch("/api/auth/sync", { method: "POST" })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        })
        .catch((err) => console.log("Sync failed:", err));
    }
  }, [user?.id]);

  return (
    <div className="sticky top-0 left-0 z-30">
      <header className="h-16 border-b bg-background py-4">
        <div className="w-full max-w-6xl max-auto flex items-center iustify-between">
          <Logo />

          <div className="hidden flex-1 items-center iustify-center gap-8 md:flex">
            
          </div>

          <div className="flex flex-1 items-center justify-end gap-3">
            <Button
              variant="outline"
              size="icon"
              className="relative rounded-full h-8 w-8"
              onClick={() => setTheme(isDark ? "Light" : "dark")}
            >
              <SunIcon className={cn("absolute h-5 w-5 transition", isDark ? "scale-100" : "scale-0")} />
              <MoonIcon className={cn("absolute h-5 w-5 transition", isDark ? "scale-0" : "scale-100")} />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-8 w-8 shrink-0 rounded-full">
                    <AvatarImage src={user?.picture || ""} alt={user?.given_name || ""} />
                    <AvatarFallback className="rounded-lg">
                      {user?.given_name?.charAt(0)}
                      {user?.family_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <span>{user?.given_name} {user?.family_name}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogoutLink className="w-full flex items-center gap-2">
                      <LogOutIcon className="size-4" />
                      Logout
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <LoginLink>
                <Button>Đăng nhập</Button>
              </LoginLink>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;