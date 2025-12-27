export function SocialProofBar() {
    return (
        <div className="py-12 border-y border-white/5 bg-transparent relative overflow-hidden">
            <div className="text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 mb-10">
                Validated by Elite Operators at
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-30 grayscale brightness-200">
                {/* Placeholder Logos */}
                <div className="text-xl font-display uppercase tracking-widest text-white">Acme_Corp</div>
                <div className="text-xl font-display uppercase tracking-widest text-white">Global_Tech</div>
                <div className="text-xl font-display uppercase tracking-widest text-white">Voyager_AI</div>
                <div className="text-xl font-display uppercase tracking-widest text-white">Nexus_Labs</div>
                <div className="text-xl font-display uppercase tracking-widest text-white">Sentinel_Sec</div>
            </div>
        </div>
    );
}
