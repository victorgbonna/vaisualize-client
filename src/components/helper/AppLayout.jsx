import { AppHeader, SideBar } from "..";

export default function AppLayout({active, children, excludeSideBar}){
    return(
        <>
        <div className="tablet:hidden flex items-start w-full tablet:flex-col bg-white overflow-y-hidden h-screen">
            {excludeSideBar?null:<SideBar active={active} />}
            <main className="w-full flex-1">
                <AppHeader active={active}/>
                {children}
            </main>
        </div>   
        <div className='hidden pc:hidden largepc:hidden tablet:flex items-center justify-center w-full h-screen bg-gray-100'>
            <p>Please view this screen on a larger screen.</p>
        </div>
        </>
    )
}
//  className=" flex items-center w-full tablet:flex-col"