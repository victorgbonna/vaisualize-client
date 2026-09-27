export default function TableLayout({theadBg, tbodyBg, th, td,className="",tbodyClass="", onlyClass=false}){
    return (
      <table className={'border-separate  w-full'}>
      
          <thead className=' bg-slate-200/20 w-[100vw]'>
              <tr>
                  {th}
              </tr>
          </thead>
          <tbody className=""
            style={{background:'#FFFFFF'}}>
              {td}
          </tbody>
      </table>
    );
  };