import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for progress (resets on server restart)
const progressStore = new Map<string, {
    sessionId: string;
    stage: number;
    stageName: string;
    timestamp: number;
    stages: Array<{ stage: number; stageName: string; timestamp: number }>;
}>();

// Clean up old sessions (older than 5 minutes)
function cleanupOldSessions() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    for (const [sessionId, data] of progressStore.entries()) {
        if (data.timestamp < fiveMinutesAgo) {
            progressStore.delete(sessionId);
        }
    }
}

// POST - Receive progress update from n8n
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { sessionId, stage, stageName, timestamp } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const existing = progressStore.get(sessionId) || {
            sessionId,
            stage: 0,
            stageName: 'Starting...',
            timestamp: Date.now(),
            stages: [] as Array<{ stage: number; stageName: string; timestamp: number }>
        };

        existing.stage = stage;
        existing.stageName = stageName;
        existing.timestamp = timestamp || Date.now();
        existing.stages.push({ stage, stageName, timestamp: existing.timestamp });

        progressStore.set(sessionId, existing);

        // Periodic cleanup (10% chance per request)
        if (Math.random() < 0.1) cleanupOldSessions();

        return NextResponse.json({ success: true, stage, stageName });
    } catch (error) {
        console.error('Progress POST error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// GET - Frontend polls for current progress
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
        }

        const progress = progressStore.get(sessionId);

        if (!progress) {
            return NextResponse.json({
                sessionId,
                stage: 0,
                stageName: 'Waiting to start...',
                timestamp: Date.now(),
                stages: []
            });
        }

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Progress GET error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// DELETE - Clean up a session when done
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');
        if (sessionId) progressStore.delete(sessionId);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
