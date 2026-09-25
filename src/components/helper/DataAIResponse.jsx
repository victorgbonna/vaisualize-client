import { useContext, useEffect, useRef, useState } from "react";
import {
    API_ENDPOINTS,
    dataiChatFunctionalities,
} from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { DataRequestContext } from "@/context";

/**
 * Owns all DataAI formula execution + template resolution for a single assistant message,
 * and persists the resolved content back onto that same message once computed.
 */
export default function DataAIResponse({ chat, onResolved }) {
    const {
        _id: messageId,
        status,
        formula,
        response,
        content,
        clarification,
    } = chat || {};

    const { patchProtectedData } = useHttpServices();
    const { NotifyError } = useToast();
    const [finalResponse, setFinalResponse] = useState("");

    const hasResolved = useRef(false);

    const {
        datasets,
        columns,
    } = useContext(DataRequestContext);
    // console.log({ datasets:Object.keys(datasets || {}), columns });
    

    useEffect(() => {
        if (
            content ||
            status !== "success" ||
            hasResolved.current ||
            !formula ||
            !datasets
        ) {
            return;
        }
        //console log all the states/var/props
        // get the first 3 rows of each dataset
        // const firstThreeRows = {};
        // for (const [key, value] of Object.entries(datasets || {})) {
        //     firstThreeRows[key] = value.slice(0, 3);
        // }
        // console.log({ datasets: firstThreeRows });
        hasResolved.current = true;

        try {
            const result =
                dataiChatFunctionalities.executeDataAIFormula({
                    formula,
                    datasets,
                    columns,
                });

            const responseString=
                dataiChatFunctionalities.buildDataAIResponse({
                    response: response || {},
                    result,
                });
            setFinalResponse(responseString)
            // console.log({resolvedContent, responseString,result})
            onResolved?.({
                responseString, messageId,
            });

            // if (messageId && resolvedContent) {
            //     updateMessageContent(resolvedContent);
            // }
        } catch (error) {
            hasResolved.current = false;

            NotifyError(
                error?.message ||
                    "Could not compute the answer for this question."
            );
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        status,
        formula,
        datasets,
        columns,
        messageId,
    ]);
    
    if(content){    
        return (
            <div
                className="text-sm text-slate-700"
                dangerouslySetInnerHTML={{
                    __html: content || "",
                }}
            />
        );
    }
    if (status === "clarification_required" || status === "unsupported" || status === "informational") {
        return (
            <div
                className="text-sm text-slate-700"
                dangerouslySetInnerHTML={{
                    __html: content || "",
                }}
            />
        );
    }
// if (status === "unsupported") {
//         return (
//             <div
//                 className="text-sm text-slate-700"
//                 dangerouslySetInnerHTML={{
//                     __html: content || "",
//                 }}
//             />
//         );
//     }
    return (
        <div className="space-y-3">
            {finalResponse? (
                <div
                    className="text-sm text-slate-700"
                    dangerouslySetInnerHTML={{
                        __html: finalResponse,
                    }}
                />
            ):
                <div className='text-sm'>
                    <p>Analyzing...</p>
                </div>
            }
        </div>
    );
}