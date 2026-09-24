import { AppLayout, DataFetch, LoadButton, SelectOptionAsObjectValue, DataAIResponse } from "@/components";
import { API_ENDPOINTS } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

export default function DataAiChat() {
    // console.log('ddd')
    return (
        <AppLayout active={'Talk to Datai'}>
            <UseDataRequestContextComponent>
                <DataAiChatTemplate/>
            </UseDataRequestContextComponent>
        </AppLayout>
    )
}   
const sample_datai_response=[
    {
    "status": "success",
    "formula": {
        "operation": "group_aggregate",
        "main_table": "26_fanchallenger_db.transactions.csv",
        "relationships": [
            {
                "from_table": "26_fanchallenger_db.transactions.csv",
                "from_column": "user",
                "to_table": "26_fanchallenger_db.users.json",
                "to_column": "_id"
            }
        ],
        "filters": [
            {
                "table": "26_fanchallenger_db.users.json",
                "field": "favourite_team",
                "operator": "=",
                "value": "Arsenal"
            },
            {
                "table": "26_fanchallenger_db.transactions.csv",
                "field": "type",
                "operator": "in",
                "value": [
                    "deposit",
                    "withdrawal"
                ]
            }
        ],
        "group_by": [
            {
                "table": "26_fanchallenger_db.transactions.csv",
                "field": "type"
            }
        ],
        "calculations": [
            {
                "field": "amount",
                "function": "sum"
            }
        ],
        "post_aggregate": null,
        "sort": [],
        "limit": null
    },
    "response": {
        "template": "<p>Here are the total deposit and withdrawal amounts made by users who support Arsenal.</p>",
        "result": [
            {
                "type": "",
                "sum_amount": ""
            }
        ]
    },
    "pending_questions": []
}
,
{
    "status": "success",
    "formula": {
        "operation": "group_aggregate",
        "main_table": "26_fanchallenger_db.transactions.csv",
        "relationships": [
            {
                "from_table": "26_fanchallenger_db.transactions.csv",
                "from_column": "user",
                "to_table": "26_fanchallenger_db.users.json",
                "to_column": "_id"
            }
        ],
        "filters": [],
        "group_by": [
            {
                "table": "26_fanchallenger_db.transactions.csv",
                "field": "user",
                "showcase_key": [
                    "first_name",
                    "last_name"
                ]
            }
        ],
        "calculations": [
            {
                "field": "amount",
                "function": "sum",
                "alias": "sum_amount"
            }
        ],
        "post_aggregate": null,
        "sort": [
            {
                "field": "sum_amount",
                "direction": "desc"
            }
        ],
        "limit": 1
    },
    "response": {
        "template": "<p>Here is the user with the highest total transaction amount.</p>",
        "result": [
            {
                "user": "",
                "sum_amount": ""
            }
        ]
    },
    "pending_questions": []
},

{
    "status": "success",
    "formula": {
        "operation": "group_aggregate",
        "main_table": "fanchallenger_db.competitions.csv",
        "relationships": [],
        "filters": [],
        "group_by": [
            {
                "table": "fanchallenger_db.competitions.csv",
                "field": "league_name"
            }
        ],
        "calculations": [
            {
                "field": "entry_fee",
                "function": "sum"
            },
            {
                "field": "no_of_managers",
                "function": "sum"
            }
        ],
        "post_aggregate": null,
        "sort": [
            {
                "field": "sum_entry_fee",
                "direction": "desc"
            },
            {
                "field": "sum_no_of_managers",
                "direction": "desc"
            }
        ],
        "limit": 5
    },
    "response": {
        "template": "<p>Here are the top competitions ranked by entry fee (descending), with number of managers used as a tiebreaker.</p>",
        "result": [
            {
                "league_name": "",
                "sum_entry_fee": "",
                "sum_no_of_managers": ""
            }
        ]
    },
    "pending_questions": []
}
, 
{
    "status": "success",
    "formula": {
        "operation": "group_aggregate",
        "main_table": "26_fanchallenger_db.users.json",
        "relationships": [],
        "filters": [],
        "group_by": [
            {
                "table": "26_fanchallenger_db.users.json",
                "field": "createdAt",
                "unit": "month"
            }
        ],
        "calculations": [
            {
                "field": "_id",
                "function": "count",
                "alias": "monthly_registrations",
                "endTag": "registrations"
            }
        ],
        "post_aggregate": {
            "function": "average",
            "field": "monthly_registrations",
            "alias": "average_monthly_registrations",
            "endTag": "registrations"
        },
        "sort": [],
        "limit": null
    },
    "response": {
        "template": "<p>Here is the average number of user registrations per month, calculated by counting registrations in each calendar month and then averaging those monthly counts.</p>",
        "result": [
            {
                "average_monthly_registrations": ""
            }
        ]
    },
    "pending_questions": []
}
]
function DataAiChatTemplate() {
    const [prompt, setPrompt] = useState('')
    const [projectState, setProjectState] = useState({value: '', title: ''})
    const [newChats, setNewChats] = useState([])
    const chatSectionRef = useRef(null)
    const promptTextareaRef = useRef(null)
    const {getProtectedData, postProtectedData, patchProtectedData} = useHttpServices()
    const {NotifyError} = useToast()
    const { project, setProject } = useContext(DataRequestContext);
    
    const {data: projectData} = useQuery({
        queryKey: ['all-projects'],
        queryFn: () => getProtectedData({path: API_ENDPOINTS.OWNED_ALL}),
        refetchOnWindowFocus: false,
        retry: false,
    })
    // console.log({projectData})

    const projectOptions = useMemo(() => (projectData?.projects)
        // .filter((item) => item._id && item.title)
        , [projectData])
    // const projects = projectOptions.map(({title}) => title)
    // const projectId = projectOptions.find(({title}) => title === projectState)?.id

    // Full projectState record (title, table_relationships, datasets) needed for the DataAI request/formula execution.
    // const {data: projectDetailData} = useQuery({
    //     queryKey: ['projectState-details', projectState?._id],
    //     queryFn: () => getProtectedData({path: API_ENDPOINTS.OWNED_BY_ID(projectState._id)}),
    //     enabled: Boolean(projectState?._id),
    //     refetchOnWindowFocus: false,
    //     retry: false,
    // })
    // const projectDetailData?.projectState = projectDetailData?.projectState

    // const datasetsByTable = useMemo(() => {
    //     const map = {}
    //     ;(projectDetailData?.projectState?.datasets || []).forEach((dataset) => {
    //         if (dataset?.file_name) map[dataset.file_name] = dataset.first_five_rows || []
    //     })
    //     return map
    // }, [projectDetailData?.projectState])

    const {data: chatData, isLoading: chatsLoading, isError: chatsError, error: chatError} = useQuery({
        queryKey: ['datai-chats', projectState?._id],
        queryFn: () => getProtectedData({path: API_ENDPOINTS.GET_DATAI_CHATS(projectState?._id)}),
        enabled: Boolean(projectState?._id),
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
        if(projectState?._id) {
            setProject(projectState)
            return
        }
        // setProject(projectState)    
    }, [projectState?._id])

    // scroll chat panel to bottom and focus the prompt textarea once fetched chats are rendered
    useEffect(() => {
        if (chatsLoading || !chats.length) return
        requestAnimationFrame(() => {
            if (chatSectionRef.current) chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight
            promptTextareaRef.current?.focus()
        })
    }, [chatsLoading, chats])

    const askDataAI = (selectedPrompt, existingConversations) => {
        const body={
                input: selectedPrompt,
                existingConversations,
                project: {
                    _id:projectState?._id,
                    title: projectState?.title,
                    relationships: projectState?.table_relationships,
                    datasets: projectState?.datasets?.map(({file_name, first_five_rows, total_rows, file_size, columns}) => ({file_name, first_five_rows, total_rows, file_size, columns})),
                },
            }
        console.log({ body })
        // return { data: { ai_response: null } }
        return postProtectedData({
            path: API_ENDPOINTS.SEND_DATAI_PROMPT,
            body
        })
    }
    const {mutate: sendPrompt, isPending} = useMutation({
        mutationFn: ({selectedPrompt, existingConversations}) => askDataAI(selectedPrompt, existingConversations),  
        onError: (error) => NotifyError(error?.error?.message || error?.message || 'Could not send prompt'),
        onSuccess: ({data}) => {
            
             console.log({ aiResponse:data })
        
            setNewChats((current) => [...current, data.conversation])

            // if (aiResponse.status === 'error') {
            //     NotifyError(aiResponse.content || 'DataAI could not process this request.')
            // }
        },
    })

    const submitPrompt = () => {
        if (!prompt.trim()) return
        if (!projectState?._id ) {
            NotifyError('Please select a Project first.')
            return
        }

        const selectedPrompt = prompt.trim()
        const existingConversations = displayedChats.map(({role, content, response}) => ({role, content:content || response?.template || ''}))
        // const existingConversations = []

        setNewChats((current) => [...current, {role: 'user', content: selectedPrompt}])
        requestAnimationFrame(() => {
            if (chatSectionRef.current) chatSectionRef.current.scrollTop = chatSectionRef.current.scrollHeight
        })
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
    // normal api call without async and await but try block
    const updateMessageContent = async ({responseString, messageId}) => {
        try {
            await patchProtectedData({
                path: API_ENDPOINTS.UPDATE_DATAI_MESSAGE,
                body: {
                    content: responseString,
                    _id: messageId
                },
            });
        } catch (error) {
            console.log({error})
        }
    }

    return (
        <main className="flex-1 flex flex-col justify-between p-4">
            <div className="mb-3 max-w-sm">
                    <SelectOptionAsObjectValue
                        options={projectOptions}
                        value={projectState}
                        changeAll={true}
                        labelProp="title"
                        valueProp="_id"
                        onChange={(value) => setProjectState(value)}
                        label="Select a Project"
                        containerClass="border border-slate-200 bg-white"
                    />
                </div>
            <DataFetch
                isLoading={Boolean(projectState?._id) && chatsLoading}
                isError={Boolean(projectState?._id) && chatsError}
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
                        {"Hi, I'm DataAI — ask a question to query your WebBi data."}
                    </h2>
                    <p className="text-xs text-slate-400 font-normal">
                        Trained on your schema, relationships, and calculated measures in real time.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 w-full max-w-3xl">
                    <div className="flex flex-wrap justify-center items-center gap-2.5">
                        {(projectState.insight_questions_template || promptSuggestions).map((suggestion) => (
                            <button
                                key={suggestion}
                                type="button"
                                onClick={() => projectState.insight_questions_template ? setPrompt(suggestion) : null}
                                className="prompt-chip px-4 py-2 text-xs sm:text-[13px] font-medium text-slate-600 bg-white border border-slate-200/90 rounded-full hover:border-slate-400 hover:bg-slate-50/80 hover:text-slate-900 transition-all shadow-sm active:scale-95"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            </section>}
            >
                <section id='main-chat' ref={chatSectionRef} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 h-[340px] overflow-y-auto">
                    <div className="flex flex-col gap-3">
                        {displayedChats?.map((chat, index) => (
                            <div key={chat.id || index} className={chat.role === 'assistant' ? 'flex justify-start' : 'flex justify-end'}>
                                <div className={chat.role === 'assistant' ? 'max-w-[80%] rounded-xl bg-slate-100 px-4 py-2 text-sm text-slate-700' : 'max-w-[80%] rounded-xl rounded-br-none bg-blue-600 px-4 py-2 text-sm text-white'}>
                                    {chat.role === 'assistant'
                                        ? <DataAIResponse
                                            chat={chat}
                                            // datasets={projectDetailData?.projectState.datasets}
                                            onResolved={({responseString, messageId}) => {
                                            
                                                setNewChats((prevChats) =>
                                                    prevChats.map((c) =>
                                                        c.id === messageId ? { ...c, content:responseString } : c
                                                    )
                                                );
                                                void updateMessageContent({responseString, messageId});
                                                setTimeout(() => {
                                                    requestAnimationFrame(() => {
                                                        if (chatSectionRef.current) {
                                                            chatSectionRef.current.scrollTop =
                                                                chatSectionRef.current.scrollHeight;
                                                        }
                                                    });
                                                }, 200);
                                            }}
                                        />
                                        :<div dangerouslySetInnerHTML={{ __html: chat.content }} />
                                    }
                                </div>
                            </div>
                        ))}
                        {isPending && <div className="text-sm italic text-slate-400">Datai is thinking...</div>}
                    </div>
                </section>
            </DataFetch>

            {projectState._id && <section className="mt-4 sm:mt-5">
                
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden relative">
                    <div className="relative flex items-end">
                        <textarea
                            id="analytics-prompt-input"
                            ref={promptTextareaRef}
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
                                
                                disabled={!prompt.trim() || !projectState?._id}
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