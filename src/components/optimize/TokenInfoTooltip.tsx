'use client';

import * as React from "react";
import { Info } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

interface TokenInfoTooltipProps {
    targetModel: string;
    accuracy: number;
}

export function TokenInfoTooltip({ targetModel, accuracy }: TokenInfoTooltipProps) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        className="ml-1 text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center"
                        aria-label="Token calculation info"
                        type="button"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs p-3">
                    <p className="text-sm font-medium mb-1">How we count tokens</p>
                    <p className="text-xs text-gray-600">
                        Token counts are estimates using GPT's tokenizer algorithm.
                        Different models tokenize slightly differently.
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Accuracy for {targetModel}: ~{accuracy}%
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
