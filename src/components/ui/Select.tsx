import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: boolean;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    className={cn(
                        "flex h-9 w-full appearance-none rounded-md border border-input bg-transparent px-3 py-1 pr-8 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus-visible:ring-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                >
                    {children}
                </select>
                <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 pointer-events-none opacity-50" />
            </div>
        );
    }
);
Select.displayName = "Select";

export { Select };
