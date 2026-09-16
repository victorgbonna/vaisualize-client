import { AppLayout, InputHelper, LoadButton } from "@/components";
import { API_ENDPOINTS } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

const CATEGORY_OPTIONS = ['Complaint', 'Inquiry', 'Suggestion'];

export default function Suggestion() {
    return (
        <AppLayout active={'Suggestion'}>
            <SuggestionTemplate />
        </AppLayout>
    );
}

function SuggestionTemplate() {
    const [form, setForm] = useState({ name: '', contact: '', category: '', message: '' });
    const { postProtectedData } = useHttpServices();
    const { NotifySuccess, NotifyError } = useToast();

    const { mutate: sendFeedback, isPending } = useMutation({
        mutationFn: (payload) => postProtectedData({ path: API_ENDPOINTS.SEND_SUGGESTION, body: payload }),
        onError: (error) => NotifyError(error?.error?.message || error?.message || 'Could not send your feedback. Please try again.'),
        onSuccess: () => {
            NotifySuccess('Thank you! Your feedback has been received.');
            setForm({ name: '', contact: '', category: '', message: '' });
        },
    });

    const updateField = (field) => (value) => setForm((current) => ({ ...current, [field]: value }));

    const submitFeedback = () => {
        if (!form.name.trim() || !form.contact.trim() || !form.category || !form.message.trim()) {
            NotifyError('Please fill in your name, contact information, category, and message.');
            return;
        }

        sendFeedback(form);
    };

    return (
        <main className="flex-1 h-screen overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
                <div className="lg:sticky lg:top-8 space-y-4 py-2">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
                        Help Us Make WebBI Better
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {"We don't know everything, and we believe a great product is built with itsusers, not just by its developers."}
                    </p>

                    <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                        {"Every review, suggestion, and complaint is appreciated. We take your feedback seriously and use it to make WebBI better for users around the world."}
                    </p>
                </div>

                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
                    <InputHelper
                        showLabel
                        label="Name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={(e) => updateField('name')(e.target.value)}
                        className="border-slate-200"
                    />

                    <InputHelper
                        showLabel
                        label="Contact Information"
                        placeholder="Email address or phone number"
                        value={form.contact}
                        onChange={(e) => updateField('contact')(e.target.value)}
                        className="border-slate-200"
                        extraText="Your preferred contact info, in case we need to follow up."
                    />

                    <InputHelper
                        showLabel
                        label="Category"
                        type="option"
                        options={CATEGORY_OPTIONS}
                        value={form.category}
                        onChange={(value) => updateField('category')(value)}
                        className="border-slate-200"
                    />

                    <InputHelper
                        showLabel
                        label="Message"
                        type="textarea"
                        rows={6}
                        placeholder="Tell us what's on your mind..."
                        value={form.message}
                        onChange={(e) => updateField('message')(e.target.value)}
                        className="border-slate-200 items-start"
                    />

                    <LoadButton
                        isLoading={isPending}
                        onClick={submitFeedback}
                        className="w-full inline-flex items-center justify-center py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium shadow-sm transition"
                    >
                        Send Feedback
                    </LoadButton>
                </div>
            </div>
        </main>
    );
}
