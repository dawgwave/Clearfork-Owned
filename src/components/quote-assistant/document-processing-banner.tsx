import { Loader2, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

export function DocumentProcessingBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border-2 border-primary bg-gradient-to-r from-primary/20 via-primary/12 to-primary/18",
        "shadow-lg shadow-primary/25 ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        "p-5",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/25 shadow-inner ring-4 ring-primary/40"
          aria-hidden
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={2.5} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
            <div>
              <p className="text-sm font-semibold text-foreground">Processing document...</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Extracting information and filling the form
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
