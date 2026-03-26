import { AppHeader, SideBar } from "..";

export default function AppLayout({active, children, excludeSideBar}){
    return(
        <div className="flex items-start w-full tablet:flex-col bg-white overflow-y-hidden h-screen">
            {excludeSideBar?null:<SideBar active={active} />}
            <main className="w-full flex-1">
                <AppHeader active={active}/>
                {children}
            </main>
        </div>   
    )
}
//  className=" flex items-center w-full tablet:flex-col"