import { useEffect, useRef } from "react";
import { API_ENDPOINTS, dataiChatFunctionalities } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";

/**
 * Owns all DataAI formula execution + template resolution for a single assistant message,
 * and persists the resolved content back onto that same message once computed.
 */
export default function DataAIResponse({ chat, datasets, onResolved }) {
    const { id: messageId, status, formula, response, content, clarification } = chat || {};
    const { result = [] } = response || {};

    const { patchProtectedData } = useHttpServices();
    const { NotifyError } = useToast();
    const hasResolved = useRef(false);

    const { mutate: updateMessageContent } = useMutation({
        mutationFn: (resolvedContent) => patchProtectedData({
            path: API_ENDPOINTS.UPDATE_DATAI_MESSAGE(messageId),
            body: { content: resolvedContent },
        }),
        onError: (error) => NotifyError(error?.error?.message || error?.message || 'Could not save the resolved response'),
    });

    useEffect(() => {
        if (status !== 'success' || hasResolved.current) return
        hasResolved.current = true

        try {
            const computedResult = dataiChatFunctionalities.executeDataAIFormula(formula, datasets)
            const resolvedContent = dataiChatFunctionalities.resolveTemplate(response?.template, computedResult)

            onResolved?.(messageId, resolvedContent, computedResult)
            if (messageId) updateMessageContent(resolvedContent)
        } catch (error) {
            NotifyError(error?.message || 'Could not compute the answer for this question.')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, formula, datasets])

    if (status === 'clarification_required') {
        return <p className="text-sm text-slate-700">{clarification}</p>;
    }

    return (
        <div className="space-y-3">
            {content && (
                <p className="text-sm text-slate-700">
                    {content}
                </p>
            )}

            {result.length > 0 && (
                <div className="space-y-2">
                    {result.map((item, index) => (
                        <div
                            key={index}
                            className="rounded-lg border border-slate-200 p-3"
                        >
                            {Object.entries(item).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="flex justify-between gap-4"
                                    >
                                        <span className="text-sm text-slate-500">
                                            {key}
                                        </span>

                                        <span className="font-medium">
                                            {String(value)}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}