import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
    error?: string;
    description?: string;
    required?: boolean;
}

export function FormField({
    label,
    error,
    description,
    required,
    children,
    className,
    ...props
}: FormFieldProps) {
    return (
        <div className={cn("grid w-full items-center gap-1.5", className)} {...props}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}
            {children}
            {description && (
                <p className="text-[0.8rem] text-muted-foreground">{description}</p>
            )}
            {error && <p className="text-[0.8rem] text-destructive">{error}</p>}
        </div>
    );
}
