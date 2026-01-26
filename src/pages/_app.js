import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import "react-toastify/dist/ReactToastify.css"; 
import { SessionProvider } from "next-auth/react"


import { Rubik } from 'next/font/google'

import { EnterChatContextComponent } from '@/context'
import { ToastContainer } from "react-toastify";
import {MainLayout} from "@/components";

const queryClient = new QueryClient();
const queryCache = new QueryCache();

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return(<div >
    <SessionProvider session={session}>
    <QueryClientProvider client={queryClient} queryCache={queryCache}>
    <EnterChatContextComponent>
      <MainLayout>
        <ToastContainer/>
        <Component {...pageProps} />  
      </MainLayout>
    </EnterChatContextComponent>
    </QueryClientProvider>
    </SessionProvider>
  </div>)
}