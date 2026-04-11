import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/automations(.*)",
  "/leads(.*)",
  "/analytics(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  /* Redirect signed-out users hitting a protected route → home */
  if (isProtectedRoute(req) && !userId) {
    const home = new URL("/", req.url);
    home.searchParams.set("sign_in", "1");
    return NextResponse.redirect(home);
  }

  /* Redirect signed-in users away from root → dashboard */
  if (pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
      Match all paths except:
      - _next/static + _next/image  (Next.js internals)
      - favicon, manifest, icons, sw.js (PWA assets)
      - api/webhooks  (Meta + Razorpay — never need auth)
    */
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|icons/|sw\\.js|api/webhooks).*)",
  ],
};