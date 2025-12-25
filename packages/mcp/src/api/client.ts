const API_BASE_URL = process.env.ELOQUO_API_URL || "https://eloquo.io";

export async function callEloquoAPI(
    endpoint: string,
    body?: Record<string, unknown>
): Promise<any> {
    const apiKey = process.env.ELOQUO_API_KEY;

    if (!apiKey) {
        throw new Error(
            "ELOQUO_API_KEY not set. Get your key from https://eloquo.io/dashboard/settings?tab=api-keys"
        );
    }

    const response = await fetch(`${API_BASE_URL}/api/mcp${endpoint}`, {
        method: body ? "POST" : "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    return response.json();
}
