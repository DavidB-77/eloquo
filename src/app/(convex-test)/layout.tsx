import { ConvexClientProvider } from "@/providers/ConvexProvider";

export default function ConvexTestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ConvexClientProvider>{children}</ConvexClientProvider>;
}
