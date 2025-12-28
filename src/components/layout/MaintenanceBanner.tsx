"use client";

import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface MaintenanceBannerProps {
    active: boolean;
    onDismiss: () => void;
}

export function MaintenanceBanner({ active, onDismiss }: MaintenanceBannerProps) {
    if (!active) return null;

    return (
        <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-2.5 px-4 shadow-lg flex items-center justify-center relative z-[100] animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2.5 max-w-screen-xl mx-auto">
                <div className="bg-white/20 p-1 rounded-full">
                    <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-sm font-medium tracking-wide">
                    <span className="font-bold uppercase opacity-80 mr-2">System Notice:</span>
                    Maintenance updates in progress. Performance may be impacted.
                </span>
            </div>
            <button
                onClick={onDismiss}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
            >
                <X className="h-4 w-4 opacity-80" />
            </button>
        </div>
    );
}
