import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/today/:path*",
    "/upcoming/:path*",
    "/projects/:path*",
    "/settings/:path*",
    "/reports/:path*",
    "/lists/:path*",
    "/help/:path*",
  ],
};
