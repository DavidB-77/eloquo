'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGSAPAnimations() {
    useEffect(() => {
        // Hero animation
        const heroTl = gsap.timeline();
        heroTl.from('.hero-badge', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out'
        })
            .from('.hero-title span', {
                opacity: 0,
                y: 50,
                duration: 1,
                stagger: 0.1,
                ease: 'power3.out'
            }, "-=0.4")
            .from('.hero-description', {
                opacity: 0,
                y: 20,
                duration: 0.8,
                ease: 'power3.out'
            }, "-=0.6")
            .from('.hero-actions', {
                opacity: 0,
                scale: 0.9,
                duration: 0.8,
                ease: 'back.out(1.7)'
            }, "-=0.4");

        // Feature cards stagger
        gsap.from('.feature-card', {
            scrollTrigger: {
                trigger: '#features',
                start: 'top 80%',
            },
            y: 100,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Pricing cards stagger
        gsap.from('.pricing-card', {
            scrollTrigger: {
                trigger: '#pricing',
                start: 'top 80%',
            },
            y: 60,
            opacity: 0,
            stagger: 0.2,
            duration: 1,
            ease: 'expo.out'
        });

        // Cleanup
        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);
}
