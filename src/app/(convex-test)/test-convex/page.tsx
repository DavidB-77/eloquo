// Test component to compare Supabase vs Convex
"use client";

import * as React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/Button";

export default function ConvexTestPage() {
    const [testResult, setTestResult] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState(false);

    // Test: Query optimization history from Convex
    const convexHistory = useQuery(api.optimizations.getOptimizationHistory, { limit: 10 });

    // Test: Create optimization mutation
    const createOptimization = useMutation(api.optimizations.createOptimization);

    const handleTestConvexQuery = async () => {
        setIsLoading(true);
        try {
            const result = convexHistory || [];
            setTestResult(`✅ Convex Query Success: Found ${result.length} optimizations`);
        } catch (error: any) {
            setTestResult(`❌ Convex Query Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConvexMutation = async () => {
        setIsLoading(true);
        try {
            const result = await createOptimization({
                originalPrompt: "Test prompt for Convex POC",
                optimizedPrompt: "Optimized test prompt",
                targetModel: "gpt-4",
                optimizationType: "standard",
                strength: "medium",
                context: "Testing Convex migration",
            });
            setTestResult(`✅ Convex Mutation Success: Created optimization ${result.optimizationId}`);
        } catch (error: any) {
            setTestResult(`❌ Convex Mutation Failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h1 className="text-2xl font-bold text-white mb-4">
                    🧪 Convex POC Test Page
                </h1>
                <p className="text-gray-400 mb-6">
                    Test Convex functions alongside Supabase to compare performance and DX
                </p>

                <div className="space-y-4">
                    {/* Test Query */}
                    <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Test 1: Query History</h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Fetch optimization history using Convex reactive query
                        </p>
                        <Button
                            onClick={handleTestConvexQuery}
                            disabled={isLoading}
                            className="bg-[#09B7B4] hover:bg-[#08a5a3]"
                        >
                            {isLoading ? "Testing..." : "Test Convex Query"}
                        </Button>
                    </div>

                    {/* Test Mutation */}
                    <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">Test 2: Create Optimization</h3>
                        <p className="text-gray-400 text-sm mb-3">
                            Create a new optimization record using Convex mutation
                        </p>
                        <Button
                            onClick={handleTestConvexMutation}
                            disabled={isLoading}
                            className="bg-[#09B7B4] hover:bg-[#08a5a3]"
                        >
                            {isLoading ? "Testing..." : "Test Convex Mutation"}
                        </Button>
                    </div>

                    {/* Results */}
                    {testResult && (
                        <div className="bg-zinc-800 p-4 rounded-lg border-l-4 border-[#09B7B4]">
                            <h3 className="text-white font-semibold mb-2">Test Result:</h3>
                            <pre className="text-sm text-white whitespace-pre-wrap">
                                {testResult}
                            </pre>
                        </div>
                    )}

                    {/* Live Data Display */}
                    <div className="bg-zinc-800 p-4 rounded-lg">
                        <h3 className="text-white font-semibold mb-2">
                            Live Convex Data (Auto-Updates)
                        </h3>
                        <p className="text-gray-400 text-sm mb-3">
                            This data automatically updates when the database changes (reactive query)
                        </p>
                        {convexHistory === undefined ? (
                            <p className="text-gray-500">Loading...</p>
                        ) : convexHistory.length === 0 ? (
                            <p className="text-gray-500">No optimizations found</p>
                        ) : (
                            <div className="space-y-2">
                                {convexHistory.map((opt) => (
                                    <div
                                        key={opt._id}
                                        className="bg-zinc-900 p-3 rounded text-sm"
                                    >
                                        <p className="text-white font-mono">{opt.original_prompt}</p>
                                        <p className="text-gray-500 text-xs mt-1">
                                            Model: {opt.target_model} | Type: {opt.optimization_type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
