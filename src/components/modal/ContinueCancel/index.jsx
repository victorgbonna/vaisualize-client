import { LoadButton } from "@/components";
import ModalLayout from "../modalLayout"

export default function ContinueCancel({btnLoadingState=false,onClose,isLoading=null, onNext,text,html, continueClass, cancelLabel="Cancel", continueLabel="Continue", extraClass="", cancelClass=""}) {
    return (
        <ModalLayout onClose={onClose}>
            <div
                style={isLoading?{
                    opacity:'0.5'
                }:{

                }} 
                onClick={(e)=> e.stopPropagation()} 
                className={"w-[400px] tablet:w-full monte bg-white relative rounded-md px-10 py-12 text-center text-sm"+extraClass}>
                <img src={'/svg/close.svg'} className="w-4 h-4 cursor-pointer absolute right-3 top-4" onClick={onClose}/>
                <div>
                    {html?html: <p className="text-semibold">{text}</p>}
                </div>
                <div className="flex mt-10 align-center gap-x-10 justify-between mt-7">
                    <button 
                        className={"bg-red-700 text-primary2 border pl-3 pr-3 pt-2 pb-2 rounded-md w-full  text-white "+cancelClass} 
                        onClick={onClose}>{cancelLabel}</button>
                    {!btnLoadingState?<button
                        disabled={isLoading}
                        onClick={()=>{
                            onNext()
                        }} 
                        className={" text-white pl-3 pr-3 w-full rounded-md "+continueClass}>{continueLabel}</button>
                    :<LoadButton
                        isLoading={isLoading}
                    //  disabled={isLoading}
                        onClick={()=>{
                            onNext()
                        }} 
                        className={" text-white pl-3 pr-3 w-full rounded-md "+continueClass}
                    >
                        {continueLabel}
                    </LoadButton>}
                </div>

            </div>
        </ModalLayout>

    );
  }
  