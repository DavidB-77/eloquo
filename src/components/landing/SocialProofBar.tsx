export function SocialProofBar() {
    return (
        <div className="py-12 border-y bg-muted/20">
            <div className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                Trusted by teams at
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale">
                {/* Placeholder Logos */}
                <div className="text-2xl font-bold font-display">ACME CORP</div>
                <div className="text-2xl font-bold font-display">GLOBAL TECH</div>
                <div className="text-2xl font-bold font-display">VOYAGER</div>
                <div className="text-2xl font-bold font-display">NEXUS</div>
                <div className="text-2xl font-bold font-display">SENTINEL</div>
            </div>
        </div>
    );
}
