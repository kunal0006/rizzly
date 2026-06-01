import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from 'jose'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_COOKIE_NAME = 'admin_token'

async function verifyAdminTokenInMiddleware(token: string): Promise<boolean> {
  try {
    const secret = process.env.ADMIN_JWT_SECRET
    if (!secret) return false
    const key = new TextEncoder().encode(secret)
    await jwtVerify(token, key)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── Admin Route Protection ───────────────────────────
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page without auth
    if (pathname === '/admin/login') {
      // If already authenticated, redirect to dashboard
      const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value
      if (adminToken && await verifyAdminTokenInMiddleware(adminToken)) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
      return NextResponse.next()
    }

    // Allow admin API routes to handle their own auth
    if (pathname.startsWith('/admin') && pathname.includes('/api/')) {
      return NextResponse.next()
    }

    // Protect all other /admin/* routes
    const adminToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!adminToken || !(await verifyAdminTokenInMiddleware(adminToken))) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  }

  // ─── Existing Supabase User Auth ──────────────────────
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/analyzer', '/pricing']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access login/signup, redirect to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
