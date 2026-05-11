"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type OauthMode = "signin" | "signup";

type Props = {
  showGoogle: boolean;
  showApple: boolean;
  callbackUrl: string;
  mode?: OauthMode;
  disabled?: boolean;
  className?: string;
};

const appleButtonClass = "bg-black text-white hover:bg-black/90 border-black";

export function OauthSignInButtons({
  showGoogle,
  showApple,
  callbackUrl,
  mode = "signin",
  disabled,
  className,
}: Props) {
  const [pending, setPending] = useState<"google" | "apple" | null>(null);
  if (!showGoogle && !showApple) return null;

  const label =
    mode === "signup" ? "Or sign up with" : "Or sign in with";

  const go = (provider: "google" | "apple") => {
    setPending(provider);
    void signIn(provider, { callbackUrl });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">{label}</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {showGoogle && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disabled || pending !== null}
            onClick={() => go("google")}
          >
            {pending === "google" ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <FcGoogle className="mr-2 h-5 w-5 shrink-0" aria-hidden />
            )}
            Google
          </Button>
        )}
        {showApple && (
          <Button
            type="button"
            className={cn("w-full", appleButtonClass)}
            disabled={disabled || pending !== null}
            onClick={() => go("apple")}
          >
            {pending === "apple" ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <FaApple className="mr-2 h-5 w-5 shrink-0" aria-hidden />
            )}
            Apple
          </Button>
        )}
      </div>
    </div>
  );
}
