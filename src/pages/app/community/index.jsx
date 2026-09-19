import { AppLayout } from "@/components";
import { API_ENDPOINTS } from "@/configs";
import { useSession } from "next-auth/react";

const COMMUNITY_PLATFORMS = [
    // {
    //     name: 'Discord',
    //     description: 'Join live discussions, share ideas, and get quick help from the WebBI community.',
    //     action: 'Join Community',
    //     link: '#',
    //     icon: '/svg/socials/discord.svg',
    // },
    // {
    //     name: 'Telegram',
    //     description: 'Follow announcements and chat with other WebBI users on the go.',
    //     action: 'Join Community',
    //     link: '#',
    //     icon: '/svg/socials/telegram.svg',
    // },
    {
        name: 'WhatsApp',
        description: 'Message the WebBI team directly for quick questions and support.',
        action: 'Connect',
        link: API_ENDPOINTS.CONTACT_LINE,
        icon: '/svg/socials/whatsapp.svg',
    },
    {
        name: 'Facebook',
        description: 'Follow our page for updates and connect with other WebBI users.',
        action: 'Connect',
        link: '#',
        icon: null,
    },
    {
        name: 'Twitter / X',
        description: 'Follow along for product updates and quick conversations with the team.',
        action: 'Connect',
        link: '#',
        icon: '/svg/socials/twitter-x.svg',
    },
    {
        name: 'LinkedIn',
        description: 'Stay connected with WebBI and follow our journey professionally.',
        action: 'Connect',
        link: '#',
        icon: '/svg/socials/linkedin.svg',
    },
];

export default function Community() {
    return (
        <AppLayout active={'Community'}>
            <CommunityTemplate />
        </AppLayout>
    );
}

function CommunityTemplate() {
    const { data: session } = useSession();
    // Remaining tokens come from the authenticated session; shown as "—" until the backend provides it.
    const remainingTokens = session?.user?.remaining_tokens ?? session?.remaining_tokens ?? null;

    return (
        <main className="flex-1 h-screen overflow-y-auto p-3 sm:p-8">
            <div className="max-w-5xl mx-auto space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                    <div className="space-y-2 w-full">
                        <h1 className="text-2xl mt-3 sm:text-3xl font-semibold text-slate-900 tracking-tight">
                            Join the WebBI Community
                        </h1>
                        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                            {"Connect with other WebBI users, share ideas, ask questions, learn from others and stay up to date with what's happening around WebBI."}
                        </p>
                    </div>

                    {/* <div className="shrink-0 bg-white border border-primary/20 rounded-2xl px-5 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">Remaining Tokens</p>
                        <p className="text-xl font-semibold text-primary">
                            {remainingTokens !== null ? Number(remainingTokens).toLocaleString() : '—'}
                        </p>
                    </div> */}
                </div>

                <div className="grid tablet:grid-cols-2 grid-cols-3 gap-5">
                    {COMMUNITY_PLATFORMS.map((platform) => (
                        <PlatformCard key={platform.name} {...platform} />
                    ))}
                </div>
            </div>
        </main>
    );
}

function PlatformCard({ name, description, action, link, icon }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
            <div className="flex items-center gap-x-2">
                <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {icon ? <img src={icon} alt={name} className="w-5 h-5" /> : <FacebookIcon />}
                    
                </div>
                <p className="font-semibold text-slate-900">{name}</p>
            </div>

            <div className="space-y-1">
                <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
            </div>

            <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center justify-center text-sm font-medium text-blue-600 border border-blue-100 bg-blue-50 hover:bg-blue-100 rounded-full px-4 py-2 transition"
            >
                {action}
            </a>
        </div>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#1877F2]">
            <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.02 3.657 9.184 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.462h-1.26c-1.243 0-1.63.771-1.63 1.562v1.876h2.773l-.443 2.91h-2.33V22c4.78-.756 8.437-4.92 8.437-9.94Z" />
        </svg>
    );
}
