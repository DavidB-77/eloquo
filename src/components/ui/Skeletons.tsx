import { Skeleton } from "./Skeleton";

export function CardSkeleton() {
    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="w-full space-y-4">
            <Skeleton className="h-10 w-full" />
            {Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
            ))}
        </div>
    );
}
