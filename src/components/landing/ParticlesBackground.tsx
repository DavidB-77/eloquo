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
                            opacity: 0.2,
                            color: "#09B7B4",
                        },
                    },
                },
            },
            particles: {
                color: {
                    value: ["#09B7B4", "#E57844", "#BC9891"],
                },
                links: {
                    color: "#09B7B4",
                    distance: 150,
                    enable: true,
                    opacity: 0.1,
                    width: 1,
                },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                        default: "out",
                    },
                    random: true,
                    speed: 0.8,
                    straight: false,
                },
                number: {
                    density: {
                        enable: true,
                    },
                    value: 60,
                },
                opacity: {
                    value: { min: 0.1, max: 0.4 },
                    animation: {
                        enable: true,
                        speed: 0.5,
                        startValue: "random",
                    },
                },
                shape: {
                    type: "circle",
                },
                size: {
                    value: { min: 1, max: 3 },
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
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-electric-cyan/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-sunset-orange/5 rounded-full blur-[100px]" />
            </div>
        );
    }

    return <div className="fixed inset-0 -z-10 bg-midnight" />;
}
