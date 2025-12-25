import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const SIZES = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
} as const;

export function Spinner({ className, size = "md" }: { className?: string; size?: keyof typeof SIZES }) {
    return <Loader2 className={cn("animate-spin text-primary", SIZES[size], className)} />;
}

export function LoadingPage() {
    return (
        <div className="flex h-[50vh] w-full items-center justify-center">
            <Spinner className="h-8 w-8" />
        </div>
    );
}
