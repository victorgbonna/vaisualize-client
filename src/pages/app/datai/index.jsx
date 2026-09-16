import { AppLayout, DataFetch, LoadButton, SelectOptionAsObjectValue, DataAIResponse } from "@/components";
import { API_ENDPOINTS } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function DataAiChat() {
    return (
        <AppLayout active={'Talk to Datai'}>
            <DataAiChatTemplate/>
        </AppLayout>
    )
}   
function DataAiChatTemplate() {
    const [prompt, setPrompt] = useState('')
    const [project, setProject] = useState({value: '', title: ''})
    const [newChats, setNewChats] = useState([])
    const {getProtectedData, postProtectedData} = useHttpServices()
    const {NotifyError} = useToast()

    const {data: projectData} = useQuery({
        queryKey: ['all-projects'],
        queryFn: () => getProtectedData({path: API_ENDPOINTS.OWNED_ALL}),
        refetchOnWindowFocus: false,
        retry: false,
    })
    console.log({projectData})

    const projectOptions = useMemo(() => (projectData?.projects)
        // .filter((item) => item._id && item.title)
        , [projectData])
    // const projects = projectOptions.map(({title}) => title)
    // const projectId = projectOptions.find(({title}) => title === project)?.id

    // Full project record (title, table_relationships, datasets) needed for the DataAI request/formula execution.
    const {data: projectDetailData} = useQuery({
        queryKey: ['project-details', project?._id],
        queryFn: () => getProtectedData({path: API_ENDPOINTS.OWNED_BY_ID(project._id)}),
        enabled: Boolean(project?._id),
        refetchOnWindowFocus: false,
        retry: false,
    })
    const fullProject = projectDetailData?.project

    const datasetsByTable = useMemo(() => {
        const map = {}
        ;(fullProject?.datasets || []).forEach((dataset) => {
            if (dataset?.file_name) map[dataset.file_name] = dataset.first_five_rows || []
        })
        return map
    }, [fullProject])

    const {data: chatData, isLoading: chatsLoading, isError: chatsError, error: chatError} = useQuery({
        queryKey: ['datai-chats', project?._id],
        queryFn: () => getProtectedData({path: API_ENDPOINTS.GET_DATAI_CHATS(project?._id)}),
        enabled: Boolean(project?._id),
        refetchOnWindowFocus: false,
        retry: false,
    })

    const chats = useMemo(() => normalizeChats(
        chatData?.data?.chats || chatData?.data?.conversations || chatData?.chats || chatData?.conversations || []
    ), [chatData])
    const displayedChats = useMemo(() => [...chats, ...newChats], [chats, newChats])
    // const hasMessages = displayedChats.length > 0

    useEffect(() => {
        setNewChats([])
    }, [project?._id])

    const {mutate: sendPrompt, isPending} = useMutation({
        mutationFn: ({selectedPrompt, existingConversations}) => postProtectedData({
            path: API_ENDPOINTS.SEND_DATAI_PROMPT,
            body: {
                prompt: selectedPrompt,
                existingConversations,
                project: {
                    title: fullProject?.title,
                    table_relationships: fullProject?.table_relationships,
                    datasets: fullProject?.datasets,
                },
                datasets: fullProject?.datasets,
                relationships: fullProject?.table_relationships,
            },
        }),
        onError: (error) => NotifyError(error?.error?.message || error?.message || 'Could not send prompt'),
        onSuccess: ({data}) => {
            const aiResponse = data?.data?.ai_response
            if (!aiResponse) return

            const messageId = aiResponse._id || aiResponse.id

            setNewChats((current) => [...current, {
                id: messageId,
                role: 'assistant',
                content: aiResponse.status === 'clarification_required' ? aiResponse.clarification : aiResponse.content,
                status: aiResponse.status,
                formula: aiResponse.formula,
                response: aiResponse.response,
                pending_questions: aiResponse.pending_questions,
                clarification: aiResponse.clarification,
            }])

            if (aiResponse.status === 'error') {
                NotifyError(aiResponse.content || 'DataAI could not process this request.')
            }
        },
    })

    const submitPrompt = () => {
        if (!prompt.trim()) return
        if (!project?._id ) {
            NotifyError('Please select a project first.')
            return
        }

        const selectedPrompt = prompt.trim()
        const existingConversations = displayedChats.map(({role, content}) => ({role, content}))

        setNewChats((current) => [...current, {role: 'user', content: selectedPrompt}])
        setPrompt('')
        sendPrompt({selectedPrompt, existingConversations})
    }

    const handlePromptKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            submitPrompt()
        }
    }

    const promptSuggestions = [ 
        'Which product category drove 80% of revenue in Q4?',
         'Compare sales conversion rate between mobile and desktop', 
         'Generate a breakdown of top 10 customers by lifetime value', 
         'Which marketing channel has the lowest CAC?', 
         'Was there a significant increase in churn between Q3 and Q4 compared with Q1 and Q2?', 
         'How many sales were accumulated across weekdays?', 
         'Which quarter recorded the highest sales volume?', 
    ];

    return (
        <main className="flex-1 flex flex-col justify-between p-4">
            <div className="mb-3 max-w-sm">
                    <SelectOptionAsObjectValue
                        options={projectOptions}
                        value={project}
                        changeAll={true}
                        labelProp="title"
                        valueProp="_id"
                        onChange={(value) => setProject(value)}
                        label="Select a project"
                        containerClass="border border-slate-200 bg-white"
                    />
                </div>
            <DataFetch
                isLoading={Boolean(project?._id) && chatsLoading}
                isError={Boolean(project?._id) && chatsError}
                errorMsg={chatError?.message}
                isEmpty={!displayedChats?.length}
                emptyComponent={<section className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center p-8 sm:p-12 md:py-16 min-h-[320px] lg:min-h-[380px] transition-all">

                {/* <div className="mb-5 relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200/80 flex items-center justify-center shadow-sm">
                        <img src="/svg/sidebar/datai.svg" alt="DataAI" className="w-9 h-9" />
                    </div>
                </div> */}

                <div className="max-w-xl mx-auto space-y-1 mb-8">
                    <h2 className="text-base sm:text-lg font-medium text-slate-700 tracking-tight">
                        Hi, I'm DataAI — ask a question to query your WebBi data.
                    </h2>
                    <p className="text-xs text-slate-400 font-normal">
                        Trained on your schema, relationships, and calculated measures in real time.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
                    <div className="flex flex-wrap justify-center items-center gap-2.5">
                        {(project.insight_questions_template || promptSuggestions).map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => project.insight_questions_template ? setPrompt(suggestion) : null}
                                className="prompt-chip px-4 py-2 text-xs sm:text-[13px] font-medium text-slate-600 bg-white border border-slate-200/90 rounded-full hover:border-slate-400 hover:bg-slate-50/80 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </section>}
            >
                <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 min-h-[320px] lg:min-h-[380px] overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        {displayedChats?.map((chat, index) => (
                            <div key={chat.id || index} className={chat.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}>
                                <div className={chat.role === 'assistant' ? 'max-w-[80%] rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700' : 'max-w-[80%] rounded-xl rounded-br-none bg-blue-600 px-4 py-2 text-sm text-white'}>
                                    {chat.role === 'assistant'
                                        ? <DataAIResponse
                                            chat={chat}
                                            datasets={datasetsByTable}
                                            onResolved={(messageId, resolvedContent, result) => setNewChats((current) => current.map((current_chat) => current_chat.id === messageId
                                                ? {...current_chat, content: resolvedContent, response: {...current_chat.response, result}}
                                                : current_chat))}
                                        />
                                        : chat.content}
                                </div>
                            </div>
                        ))}
                        {isPending && <div className="text-sm italic text-slate-400">Datai is thinking...</div>}
                    </div>
                </section>
            </DataFetch>

            {project._id && <section className="mt-4 sm:mt-5">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden relative">
                    <div className="relative flex items-end">
                        <textarea
                            id="analytics-prompt-input"
                            rows="3"
                            placeholder="We still dey test am for pidgin, but you fit still ask."
                            value={prompt}
                            onChange={(event) => setPrompt(event.target.value)}
                            onKeyDown={handlePromptKeyDown}
                            className="w-full resize-none border-0 focus:ring-0 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 leading-relaxed font-normal bg-transparent"
                        />
                        <div className="p-2.5 shrink-0">
                            <LoadButton
                                isLoading={isPending}
                                
                                disabled={!prompt.trim() || !project?._id}
                                id="send-query-btn"
                                type="button"
                                aria-label="Submit Query"
                                onClick={submitPrompt}
                                className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.2"
                                    viewBox="0 0 24 24"
                                >
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </LoadButton>
                        </div>
                    </div>
                </div>

                <p className="mt-2.5 text-xs text-slate-500 text-center sm:text-left leading-normal px-1">
                    Enter to query <span className="mx-0.5">·</span> Shift+Enter for a new line. Answers are synthesized directly from live connected data sources and may require verification.
                </p>
            </section>}
        </main>
    )
}

function normalizeChats(messages) {
    return Array.isArray(messages) ? messages.map((message) => normalizeChat(message)) : []
}

function normalizeChat(message, fallbackRole = 'assistant') {
    return {
        id: message?._id || message?.id,
        role: message?.role || (message?.isUser ? 'user' : fallbackRole),
        content: message?.content || message?.short_note || message?.message || '',
    }
}