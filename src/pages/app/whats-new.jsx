import { AppLayout } from "@/components";
import { API_ENDPOINTS } from "@/configs";

const WAITLIST_MESSAGE = "Hi WebBI, I'd like to join the waitlist!";

export default function WhatsNew() {
    return (
        <AppLayout active={"What's New?"}>
            <WhatsNewTemplate />
        </AppLayout>
    );
}

function WhatsNewTemplate() {
    const waitlistLink = `${API_ENDPOINTS.CONTACT_LINE}?text=${encodeURIComponent(WAITLIST_MESSAGE)}`;

    return (
        <main className="flex-1 h-screen overflow-y-auto flex items-center justify-center p-4 sm:p-8">
            <section className="relative w-full max-w-2xl">
                {/* Soft ambient glow behind the card for visual interest, no extra content */}
                <div className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />

                <div className="relative bg-white border border-slate-200 shadow-sm rounded-3xl p-8 sm:p-14 text-center flex flex-col items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm">
                        <img src="/svg/sidebar/rocket.svg" alt="" className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs sm:text-sm font-semibold tracking-wide uppercase text-primary">
                            {"What's New?"}
                        </p>
                        <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
                            {"WebBI is Coming Soon."}
                        </h1>
                    </div>

                    <p className="max-w-md text-sm sm:text-base text-slate-500 leading-relaxed">
                        {"We're building WebBI to help businesses understand their data and uncover useful insights, faster and with less friction. Be the first to know when it's ready."}
                    </p>

                    <a
                        href={waitlistLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-x-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-medium px-6 py-3 rounded-full shadow-sm transition"
                    >
                        <img src="/svg/socials/whatsapp.svg" alt="" className="w-5 h-5" />
                        Join the Waitlist
                    </a>
                </div>
            </section>
        </main>
    );
}
