import { API_ENDPOINTS, baseURL, consolelog } from "@/configs";
import axios from "axios";
import cookie from "cookie"
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

let userType = "";



export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
          params: {
            prompt: "consent",
            access_type: "offline",
            response_type: "code",
            userType: "user" || "admin",
            mode:'sign-in'
          },
        },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(
            API_ENDPOINTS.NORMAL_SIGNIN,
            {
              email: credentials?.email,
              password: credentials?.password,
              medium: "normal",
            }
          );

          const user = res.data.data.access_token;

          if (!user) return null;

          return {
            accessToken: user,
          };
        } catch (err) {
          throw new Error("Invalid email or password");
        }
      },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/sign-in', 
  },
  callbacks: {
      async signIn({ account, profile }) {
        console.log({account, profile})
    if (account?.state) {
      const state = JSON.parse(account.state);

      const userType = state.userType; // admin | user
      const intent = state.intent;     // sign-in | sign-up

      console.log({ userType, intent });
    }

    return true;
  }

    // async signIn({req, profile:user, account, provider, credentials }) {
    //     // const intent= req
    //     // consolelog({intent})
    //     // consolelog({intent})
    //     // consolelog({credentials})
    //     console.log({credentials,account, user, provider});
    //     return true
    //     if(1){
    //       // return `/auth/${account?.state?.action==='sign-up'?'sign-up':'sign-in'}?error=${errorMsg}`; 

    //       throw new Error('Google session has expired. Try again later.')
    //     }
    //     try {
            
    //         if (intent === "sign-up") {
    //         const res = await axios.post(
    //             `${baseURL}/${API_ENDPOINTS.AUTH_ENDPOINTS.OAUTH_SIGNUP}`,
    //             {
    //             email: user.email,
    //             firstName: user.given_name || "",
    //             lastName: user.family_name || "",
    //             picture: user.picture || "",
    //             google_id:user.id, medium:'google'
    //             }
    //         );
    //           account.access_token = res.data.data.access_token;
    //         } else {

    //         const res = await axios.post(
    //             `${baseURL}/${API_ENDPOINTS.AUTH_ENDPOINTS.OAUTH_SIGNIN}`,
    //             { email: user.email, medium:'google' }
    //         );
    //           account.access_token = res.data.data.access_token;
    //         }

    //         return true;
    //     } catch (err) {
    //         // consolelog("Auth error:", err.response?.data || err.message);
    //         const errorMsg = encodeURIComponent(err.response?.data?.error?.message || err.message);
    //         return `/auth/${intent==='sign-up'?'sign-up':'sign-in'}?error=${errorMsg}`; 
    //         return false; 
    //     }
    // },
,
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.access_token = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.access_token = token.access_token;
      return session;
    },
  }
});
