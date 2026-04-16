import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1728px] px-4 sm:px-6 lg:px-[148px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export { PageShell };
