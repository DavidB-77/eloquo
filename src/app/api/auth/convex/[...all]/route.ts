import { handler } from '@/lib/auth-server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const getSafeRequest = (request: Request): Request => {
    const headers = new Headers();
    const allowedHeaders = [
        'accept', 'accept-encoding', 'accept-language',
        'authorization', 'content-type', 'cookie',
        'origin', 'referer', 'user-agent',
        'x-requested-with'
    ];
    request.headers.forEach((value, key) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, value);
        }
    });
    headers.delete('connection');
    headers.delete('keep-alive');
    headers.delete('proxy-connection');
    headers.delete('transfer-encoding');
    headers.delete('te');
    headers.delete('host');
    return new Request(request.url, {
        method: request.method,
        headers: headers,
        body: request.method === 'POST' ? request.body : undefined,
        // @ts-ignore
        duplex: 'half',
    });
};

export async function GET(request: Request) {
    try {
        const safeReq = getSafeRequest(request);
        return await handler.GET(safeReq);
    } catch (err) {
        console.error('[Auth Proxy GET Error]:', err);
        return NextResponse.json({ error: 'Auth Proxy Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const safeReq = getSafeRequest(request);
        return await handler.POST(safeReq);
    } catch (err) {
        console.error('[Auth Proxy POST Error]:', err);
        return NextResponse.json({ error: 'Auth Proxy Error' }, { status: 500 });
    }
}
