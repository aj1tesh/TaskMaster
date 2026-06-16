import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      googleLinked?: boolean;
      hasPassword?: boolean;
      themeLevel?: number;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    picture?: string | null;
    googleLinked?: boolean;
    hasPassword?: boolean;
    themeLevel?: number;
    theme?: "dark" | "light";
  }
}
