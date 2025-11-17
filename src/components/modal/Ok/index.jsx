import ModalLayout from "../modalLayout"

export default function Ok({onClose, text}) {
    return (
        <ModalLayout onClose={onClose}>
            <div 
                onClick={(e)=> e.stopPropagation()} 
                className="bg-white rounded-md px-10 py-10 text-center w-fit">
                <div>
                    {text}
                </div>
                <div className="flex mt-10 align-center justify-center mt-10">
                    <button
                        onClick={()=>{
                            onClose()
                        }} 
                        className="bg-blue-500 text-black pl-3 pr-3 rounded-md w-full py-2">OK</button>
                </div>
            </div>
        </ModalLayout>

    );
  }
  