import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import "react-toastify/dist/ReactToastify.css"; 

import { Rubik } from 'next/font/google'

import { EnterChatContextComponent } from '@/context'
import { ToastContainer } from "react-toastify";
import {MainLayout} from "@/components";

const queryClient = new QueryClient();
const queryCache = new QueryCache();

export default function App({ Component, pageProps }) {
  return(<div >
    <QueryClientProvider client={queryClient} queryCache={queryCache}>
    <EnterChatContextComponent>
      <MainLayout>
        <ToastContainer/>
        <Component {...pageProps} />  
      </MainLayout>
    </EnterChatContextComponent>
    </QueryClientProvider>
  </div>)
}