import Loading from "./Loading";

export default function DataFetch({children,
    emptyComponent, 
    isError, errorMsg,
    loadingComponent=<Loading/>,
    isEmpty, isLoading}) {
    
    if(isLoading || isEmpty){
        return loadingComponent
    }
    if(isError){
        return (
            <div className="py-10 flex flex-col items-center justify-center font-semibold text-primary2 text-5 ">
                <p>{errorMsg ||'Something went wrong. Please check network'}</p>            
            </div>
        )
    }
    if(isEmpty){
        return emptyComponent
    }
    return (
        <>
        
            {children}
        </>
    );
}
