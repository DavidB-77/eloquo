import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.2em] font-display transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-electric-cyan text-white shadow-[0_0_10px_rgba(9,183,180,0.2)] hover:bg-electric-cyan/80",
                secondary:
                    "border-white/10 bg-deep-teal/40 text-dusty-rose hover:bg-deep-teal/60 hover:text-white",
                destructive:
                    "border-transparent bg-terracotta text-white shadow hover:bg-terracotta/80",
                outline: "border-electric-cyan/20 text-electric-cyan bg-transparent",
                success: "border-transparent bg-electric-cyan/20 text-electric-cyan shadow-[0_0_10px_rgba(9,183,180,0.1)]",
                warning: "border-transparent bg-sunset-orange/20 text-sunset-orange",
                info: "border-transparent bg-electric-cyan/20 text-electric-cyan",
                pro: "btn-gradient text-white border-none shadow-[0_0_15px_rgba(9,183,180,0.3)]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
