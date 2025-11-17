import "@/styles/globals.css";
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"

import "react-toastify/dist/ReactToastify.css"; 

import { Rubik } from 'next/font/google'


// const inter= Inter({
//   subsets:["latin"],
//   weight:['300', '400' ,'500', '700'],
//   variable: '--font-inter',

// })
// import { MainLayout } from '@/components'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-rubik',
})
import { EnterChatContextComponent } from '@/context'
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient();
const queryCache = new QueryCache();

export default function App({ Component, pageProps }) {
  return(<div className={rubik.variable} >
    <QueryClientProvider client={queryClient} queryCache={queryCache}>
    <EnterChatContextComponent>
      {/* <MainLayout> */}
      <ToastContainer/>
        <Component {...pageProps} />  
      {/* </MainLayout> */}
    </EnterChatContextComponent>
    </QueryClientProvider>
  </div>)
}