import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Only block specific explicit CLI tools
    const blockedAgents = [
        'curl', 'wget', 'python-requests', 'python-urllib', 
        'postmanruntime', 'insomnia', 'httpie', 'libwww-perl', 
        'go-http-client'
    ];

    const isBlocked = userAgent && blockedAgents.some(agent => 
        userAgent.toLowerCase().includes(agent)
    );

    if (isBlocked) {
        return new NextResponse('Access Denied: Terminal/CLI downloads are not allowed.', {
            status: 403,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
