"use client";

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export function ParticlesBackground() {
    const [init, setInit] = useState(false);

    // this should be run only once per application lifetime
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const options: ISourceOptions = useMemo(
        () => ({
            background: {
                color: {
                    value: "transparent",
                },
            },
            fpsLimit: 120,
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "grab",
                    },
                },
                modes: {
                    grab: {
                        distance: 200,
                        links: {
                            opacity: 0.3,
                            color: "#00FFFF",
                        },
                    },
                },
            },
            particles: {
                color: {
                    value: ["#00FFFF", "#FF6600", "#FF00FF", "#00FF66"],
                },
                links: {
                    color: "#00FFFF",
                    distance: 150,
                    enable: true,
                    opacity: 0.15,
                    width: 1,
                },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                        default: "out",
                    },
                    random: true,
                    speed: 1.2,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 80,
                },
                opacity: {
                    value: { min: 0.2, max: 0.5 },
                    animation: {
                        enable: true,
                        speed: 0.8,
                        startValue: "random",
                    },
                },
                shape: {
                    type: "circle",
                },
                size: {
                    value: { min: 1, max: 4 },
                },
            },
            detectRetina: true,
        }),
        [],
    );

    if (init) {
        return (
            <div className="fixed inset-0 -z-10 bg-midnight pointer-events-none">
                <Particles
                    id="tsparticles"
                    options={options}
                    className="h-full w-full"
                />
                {/* Global Ambient Glows */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-electric-cyan/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-magenta/10 rounded-full blur-[150px]" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-neon-orange/5 rounded-full blur-[120px]" />
            </div>
        );
    }

    return <div className="fixed inset-0 -z-10 bg-midnight" />;
}
