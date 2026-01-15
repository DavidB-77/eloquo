import { NextResponse } from 'next/server'
// import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/dashboard'

    // Use environment variable for the base URL, not request origin
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eloquo.io'

    if (code) {
        // const supabase = await createClient()
        // const { error } = await supabase.auth.exchangeCodeForSession(code)
        // if (!error) {
        return NextResponse.redirect(`${baseUrl}${next}`)
        // }
    }

    return NextResponse.redirect(`${baseUrl}/login?error=Could not verify account`)
}
