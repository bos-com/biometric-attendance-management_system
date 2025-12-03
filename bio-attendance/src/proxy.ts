import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from "./lib/sessions"
import { cookies } from 'next/headers'

const isProtected = [
        '/attendance',
        '/profile',
        "/students",
        "/classes",
        "/sessions",
        "/reports",
        "/settings",
]
const publicRoutes = ['/signin', '/signup','/passwordChange', '/password-reset'];
const RoleProtected = [
        // '/admin(.*)',
         '/sudo(.*)', ];
const proxy = async (req: NextRequest) => {
        const path = req.nextUrl.pathname
        // console.log("Middleware path:",path)
        const isProtectedPath = isProtected.some(route => path.startsWith(route));
        const isPublicRoute = publicRoutes.includes(path)
        const isRoleProtected = RoleProtected.some((pattern) => new RegExp(pattern).test(path));

        const cookie = (await cookies()).get("lecturerSession")?.value
        // console.log("session",cookie)
        const session = cookie ?await decrypt(cookie,):null
        

        if(isProtectedPath && !session){
                return NextResponse.redirect(new URL('/signin', req.url))
        }
        if(
                isRoleProtected && (session?.role !== "lecturer" && session?.role !== "admin")){
                        return NextResponse.redirect(new URL('/unauthorized', req.url));
                }

        if (isPublicRoute && session?.userId && req.nextUrl.pathname != '/') {
                return NextResponse.redirect(new URL('/', req.nextUrl))
  }

 
  return NextResponse.next()
}

export default proxy;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};