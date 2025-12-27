import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] font-display transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
    {
        variants: {
            variant: {
                default: "bg-electric-cyan text-white shadow-[0_0_15px_rgba(9,183,180,0.3)] hover:shadow-[0_0_25px_rgba(9,183,180,0.5)] hover:bg-electric-cyan/90",
                destructive: "bg-destructive text-white shadow-sm hover:bg-destructive/90",
                outline: "border border-electric-cyan/20 bg-transparent text-white hover:bg-white/5",
                secondary: "bg-deep-teal/40 text-dusty-rose border border-white/5 hover:bg-deep-teal/60 hover:text-white",
                ghost: "text-dusty-rose hover:bg-white/5 hover:text-white",
                link: "text-electric-cyan underline-offset-4 hover:underline",
                gradient: "btn-gradient text-white shadow-[0_0_20px_rgba(9,183,180,0.3)] hover:glow-md",
                "primary-glow": "bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 hover:bg-electric-cyan/20 shadow-[0_0_15px_rgba(9,183,180,0.1)]",
            },
            size: {
                default: "h-11 px-6",
                sm: "h-9 rounded-lg px-4",
                lg: "h-14 rounded-xl px-10 text-xs",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {asChild ? (
                    children
                ) : (
                    <>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {children}
                    </>
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
