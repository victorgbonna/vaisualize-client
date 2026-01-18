import Link from "next/link";

export default function ContactTemplate({header, subheader}){
    return(
        <section className=" mx-4 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-8 tablet:px-5 text-center relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/5 blur-[80px] rounded-full"></div>
                <div className="relative z-10">
                    <div className=" text-center rounded-[20px] p-14 tablet:p-0">
                        <p className="text-3xl mb-3">{header}</p>
                        <p className="text-gray-600">{subheader}</p>
                        <div className="mt-8 flex items-center gap-x-4 justify-center tablet:flex-col tablet:gap-y-7">
                            <Link href={'/'} 
                                className="flex gap-x-4 justify-center items-center rounded-full bg-primary text-white text-[15px] font-semibold px-8 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                                <img src="/svg/contact.svg" alt="contact" className="w-4 h-4"/>
                                <p>Contact Support</p>
                            </Link>
                            <button disabled={true} 
                                className="flex gap-x-4 justify-center items-center font-semibold border bg-white px-8 py-2.5 text-[15px] rounded-full">
                                <img src="/svg/doc.svg" alt="doc" className="w-4 h-4"/>
                               <p>Visit Documentation</p>
                                
                            </button>
                        </div>
                    </div>
                </div>
        </section>
    )
}