
import {createContext, useContext, useEffect, useState} from 'react'
// import { useHttpServices,useLocalStorage } from '@/hooks';
// import { consolelog } from '@/configs';

export const EnterChatContext = createContext()

export default function EnterChatContextComponent(
    {children}){ 
    const [showModal, setShowModal]=useState('')
    

    return(
        <EnterChatContext.Provider value={{
            showModal, setShowModal
        }}>
            {children}
        </EnterChatContext.Provider>
    )
}