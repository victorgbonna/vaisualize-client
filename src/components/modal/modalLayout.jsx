export default function ModalLayout({children, onClose}) {
    return (
      <div 
        onClick={onClose} className="tablet:px-6 modal-layout"
        style={{position: 'fixed', width:"100%",
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'grid', placeItems: 'center', height: '100vh', width:'100vw', 
          top:'0', left: '0', zIndex:'99'}}>
        <div onClick={(e)=> e.stopPropagation()} className="w-full items-center flex flex-col"
        >
          {children}
        </div>
      </div>
    );
  }
  