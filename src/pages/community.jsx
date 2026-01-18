import { ContactTemplate } from "@/components";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Community(){
    const webbiCommunities = [
    {
        platform: "WhatsApp",
        svgPath: "whatsapp.svg",
        description:
        "Get quick help, share feedback, and connect with other WebBi users solving real business and reporting problems.",
        btnLabel: "Join Community",
        link: "https://wa.me/xxxxxxxxxx"
    },
    {
        platform: "Telegram",
        svgPath: "telegram.svg",
        description:
        "Stay updated with product improvements, data tips, feature releases, and early access announcements.",
        btnLabel: "Join Channel",
        link: "https://t.me/webbi"
    },
    {
        platform: "Discord",
        svgPath: "discord.svg",
        description:
        "A focused space for deeper discussions on data modeling, AI-driven visuals, integrations, and WebBi architecture.",
        btnLabel: "Enter Server",
        link: "https://discord.gg/webbi"
    },
    {
        platform: "LinkedIn",
        svgPath: "linkedin.svg",
        color:'#0a66c2',
        description:
        "Follow WebBi’s journey, product updates, use cases, and insights on how teams use data to drive decisions.",
        btnLabel: "Follow Updates",
        link: "https://linkedin.com/company/webbi"
    },
    {
        platform: "X (Twitter)",
        svgPath: "twitter-x.svg",
        description:
        "Get quick updates, feature highlights, data insights, and join conversations around modern analytics.",
        btnLabel: "Follow @WebBi",
        link: "https://x.com/webbi",
        color:'#ffffff'
    }
    ];
    return(
        <main className="w-full  py-20 flex-col items-center">
            <div className="text-center flex flex-col items-center mb-10  px-[300px] tablet:px-5">
                <p className="py-1 px-4 rounded-full bg-blue-100 w-fit text-primary text-xs font-bold tracking-widest uppercase mb-6 text-center">JOIN OUR ECOSYSTEM</p>
                <h2 className="text-5xl tablet:text-3xl font-bold mb-4">The Heart of <span className="text-primary">WebBi</span> Community</h2>
                <p className="text-slate-600 ">
                    {`Connect with business owners, freelancers and analysts using WebBi to make better
                    decisions with data. Share ideas, learn best practices, and grow together.`}
                </p>
            </div>
            <div className="grid grid-cols-3 gap-4 justify-center tablet:grid-cols-1 px-[150px] mb-[100px] tablet:mb-20 items-center tablet:px-5">
                {webbiCommunities.map(({platform,svgPath, btnLabel, link, description, color},ind)=>
                    <div key={ind} className="py-8 px-7 rounded-2xl border bg-gray-50  shadow-lg">
                        <div style={color?{background:color}:{}} className="mb-4 rounded-full border p-2 w-fit">
                            <img className='w-6 h-6' src={'/svg/socials/'+svgPath} alt={platform} />
                        </div>
                        <p className="text-xl font-semibold mb-2">{platform}</p>
                        <p className="text-gray-700 h-32 tablet:min-h-32">{description}</p>
                        <Link href={link} className="hover:scale-[1.1] duration-200 flex py-3 bg-gray-800 text-white items-center justify-center border gap-x-2 w-full rounded-full">
                            <p>{btnLabel}</p>
                            <img src="/svg/arrow-back-white.svg" alt="btn" className="w-5 h-5" style={{transform:'rotate(180deg)'}}/>
                        </Link>
                    </div>
                )}
            </div>
            <ContactTemplate
                header={'Need Personalized help?'}
                subheader={'Our engineering team is just one message away if you need technical architecture advice.'}
            />
            
        </main>
    )
}
