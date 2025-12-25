"use client";

import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

interface SparklineChartProps {
    data: { value: number }[];
    color?: string;
}

export function SparklineChart({ data, color = "#4f46e5" }: SparklineChartProps) {
    return (
        <div className="h-[40px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
