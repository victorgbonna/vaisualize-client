import { AppHeader, SideBar } from "..";

export default function AppLayout({active, children}){
    return(
        <div className="flex items-start w-full tablet:flex-col bg-white overflow-y-hidden h-screen">
            <SideBar active={active} />
            <main className="">
                <AppHeader active={active}/>
                {children}
            </main>
        </div>   
    )
}
//  className=" flex items-center w-full tablet:flex-col"