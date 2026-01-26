import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { API_ENDPOINTS, baseURL, consolelog } from "@/configs";

export default NextAuth({
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          // console.log("NORMAL_SIGNIN URL:", API_ENDPOINTS.AUTH_ENDPOINTS.NORMAL_SIGNIN);
          try {

            const res = await axios.post(
              `${baseURL}/${API_ENDPOINTS.AUTH_ENDPOINTS.NORMAL_SIGNIN}`,
              {
                email: credentials?.email,
                password: credentials?.password,
                medium: "normal",
              }
            );

            const userData = res.data.data;
            // consolelog({tokensss:res.data.data})
  
            return {
              access_token: userData.access_token,
            };
            return true;
          } catch (err) {
            // console.log({err:err?.response?.data?.error})
            throw Error(err.response?.data?.error?.message || err.message);
          }
        },
      })
    ],

    callbacks: {
      async signIn({ profile:user, account }) {
        if (account?.provider === "google"){
          try {

            // consolelog({user})
            const res = await axios.post(
                `${baseURL}/${API_ENDPOINTS.AUTH_ENDPOINTS.OAUTH_SIGNUP}`,
                {
                email: user.email,
                firstName: user.given_name || "",
                lastName: user.family_name || "",
                imageUrl: user.picture || "",
                google_id:user.id, medium:'google'
                }
            );
            // consolelog({tokenVCCC:res.data.data})
            account.access_token = res.data.data.access_token;
            return {
              access_token: res.data.data.access_token,
            };
            // return true;
          } catch (err) {
            consolelog({resp:err.response || err})
            const redirect= err.response?.data?.error?.redirect || err?.redirect
            const errorMsg = encodeURIComponent(err.response?.data?.error?.message || err.message || 'Something went wrong. Try again later');
            return `/auth/${redirect || 'sign-up'}?error=${errorMsg}`; 
            return false; 
          }
        }
        
        return true
      },
      async jwt({ token, user, account }) {
        // consolelog({tokezxs:token,user})
        if (user?.access_token) {
          token.access_token = user.access_token
        }
        
        // For Google OAuth
        if (account?.access_token) {
          token.access_token = account.access_token;
        }
        return token;
      },
      async session({ session, token }) {
        // consolelog({token,session})
        session.access_token = token.access_token;
        return session;
      }
    },
  });

