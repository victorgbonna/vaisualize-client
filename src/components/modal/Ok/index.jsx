import { LoadButton } from "@/components";
import ModalLayout from "../modalLayout"

export default function Ok(
    {   
        onClose, text, onNext, 
        children, isBtnLoader, onClick,
        isLoading, btnDisabled
    }) {
    return (
        <ModalLayout onClose={onClose}>
            <div 
                onClick={(e)=> e.stopPropagation()} 
                className="w-[450px] tablet:w-full bg-white rounded-md px-10 tablet:px-6 tablet:py-10 py-14 text-center relative">
                <img src={'/svg/close.svg'} className="w-5 h-5 cursor-pointer absolute right-6 top-6" onClick={onClose}/>
                
                <div className="w-full">
                    {children || text}
                </div>
                <div className="flex mt-10 align-center justify-center mt-10">
                    {
                    isBtnLoader?
                    <LoadButton 
                        className="p1 text-white text-black pl-3 pr-3 rounded-md w-full py-2"
                        isLoading={isLoading}
                        btnDisabled={btnDisabled}
                        onClick={onClick}
                    >
                        Continue
                    </LoadButton>:
                    <button
                        onClick={()=>{
                            onNext()
                        }} 
                        className="bg-blue-500 text-black pl-3 pr-3 rounded-md w-full py-2">OK
                    </button>}
                </div>
            </div>
        </ModalLayout>

    );
  }
  