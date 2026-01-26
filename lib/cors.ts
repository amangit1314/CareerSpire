// lib/cors.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// CORS headers configuration
export const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
        ? process.env.NEXTAUTH_URL || 'https://mocky-nine.vercel.app'
        : 'http://localhost:3000',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, Accept, Origin',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
} as const;

// Helper to add CORS headers to a response
export function addCorsHeaders(response: NextResponse): NextResponse {
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

// Helper for preflight requests
export function handleCorsPreflight(request: NextRequest) {
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        return addCorsHeaders(response);
    }
    return null;
}

// Helper for CORS-enabled JSON responses
export function corsJsonResponse(data: any, status: number = 200) {
    const response = NextResponse.json(data, { status });
    return addCorsHeaders(response);
}

// Helper for CORS-enabled redirects
export function corsRedirect(url: string | URL, request: NextRequest) {
    const response = NextResponse.redirect(new URL(url, request.url));
    return addCorsHeaders(response);
}