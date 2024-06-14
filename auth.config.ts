import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages:{
    signIn:"/login"
  },
  callbacks:{
    authorized({auth,request:{nextUrl}}){
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if(isOnDashboard){
        if(isLoggedIn) return true;
        return false; //没有鉴权跳转登录
      }else if(isLoggedIn){
        return Response.redirect(new URL("/dashboard",nextUrl));
      }
      return true;
    }
  },
  providers:[] //配置不同的登录途径
} satisfies NextAuthConfig;