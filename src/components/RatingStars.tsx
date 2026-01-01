'use client';

import * as React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
    requestId: string;
    onRated?: (rating: number) => void;
}

export default function RatingStars({ requestId, onRated }: RatingStarsProps) {
    const [rating, setRating] = React.useState<number | null>(null);
    const [hoveredStar, setHoveredStar] = React.useState<number | null>(null);
    const [submitted, setSubmitted] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleRate = React.useCallback(async (selectedRating: number) => {
        if (submitted || isSubmitting) return;

        setIsSubmitting(true);
        setRating(selectedRating);

        try {
            const response = await fetch('https://agent.eloquo.io/rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    request_id: requestId,
                    rating: selectedRating,
                    feedback: null
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setSubmitted(true);
                onRated?.(selectedRating);
            }
        } catch (error) {
            console.error('Failed to submit rating:', error);
            setRating(null);
        } finally {
            setIsSubmitting(false);
        }
    }, [requestId, submitted, isSubmitting, onRated]);

    const displayRating = hoveredStar !== null ? hoveredStar : (rating || 0);

    return (
        <div className="flex flex-col items-center gap-2 py-4">
            <p className="text-sm text-white/50">
                {submitted ? 'Thanks for your feedback!' : 'How was this result?'}
            </p>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => handleRate(star)}
                        onMouseEnter={() => !submitted && setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        disabled={submitted || isSubmitting}
                        className={`transition-all duration-150 ${submitted ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                            } ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                        <Star
                            className={`h-6 w-6 ${star <= displayRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-white/30'
                                }`}
                        />
                    </button>
                ))}
            </div>
            {submitted && rating && (
                <p className="text-xs text-electric-cyan">{rating}/5 - Your rating helps improve Eloquo!</p>
            )}
        </div>
    );
}
