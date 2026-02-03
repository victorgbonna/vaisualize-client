export default function TableLayout({theadBg, tbodyBg, th, td,className="",tbodyClass="", onlyClass=false}){
    return (
      <table className={'border-seperate w-full bg-whie'}>
      
          <thead>
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