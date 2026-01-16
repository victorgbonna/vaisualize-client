import { useHttpServices, useToast } from "@/hooks";
import { Fragment, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DataRequestContext, FilterContext, FilterContextComponent } from "@/context";
import { ModalLayout, Ok } from "@/components/modal";
import { DataFetch } from "@/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/configs";
import { useRouter } from "next/router";

export default function ChatBot({
  onClose
}) {
    
  const [mount, setMount]= useState(true)
  const {getData, postData}= useHttpServices()
  const {NotifyError}=useToast()
  const [chats, setChats]= useState([])
  const [prev_chat, setPrevChat]= useState(null)

  const router =useRouter()

  const getAllChats=async()=>{    
    return await getData({path:API_ENDPOINTS.GET_CONVO_BY_ID(router?.query?.id)})
  }

  const {isLoading, error, data:chat_data,isError}= useQuery(
      {
      queryKey:['all-chats-for-'+router?.query?.id],
      queryFn:()=>getAllChats(),
      refetchOnWindowFocus: false,
      refetchOnMount:true,
      retry:false, enabled:!!(mount && router?.query?.id)
      }
  )
const chartInpRef= useRef(null)
const chartRef= useRef(null)
  const sendChatQuery= async(chatObj)=>{

      return await postData(
          {
            path:API_ENDPOINTS.SEND_CONVO,
            body:{analysis_id:router?.query?.id, content:chatObj.content}
          })
    }

    const {mutate:sendChat, isPending}=useMutation({
        mutationFn: (chat)=>sendChatQuery(chat),
        onError:({error})=>{
          // let ex_chats= [...chats]
          // ex_chats.push(
          //   {role:'assistant', short_note:'<p>I cannot reply you at the moment, check your network connectivity please.</p>'}
          // )
          // setChats([...ex_chats])
          setChats(prev => [
            ...prev,
            {role:'assistant', short_note:'<p>I cannot reply you at the moment, check your network connectivity please.</p>'}
          ]);
          return NotifyError(error.message || 'Could not send data')
        },
        onSuccess:({data})=>{
          // let ex_chats= [...chats]
          // ex_chats.push(
          //   {role:'assistant', short_note:data?.short_note}
          // )
          // setChats([...ex_chats])
          // console.log({data})
          setChats(prev => [
            ...prev,
            {role:'assistant', short_note:data?.chat?.short_note}
          ]);
          return
        }
    })
  useEffect(()=>{ 
    console.log(chartInpRef.current)
    chartInpRef?.current?.focus()
    scrollnow()
  },[])
  const scrollnow=()=>{
    const chat_id= document.getElementById('chatcontent')

    chat_id.scrollIntoView({ behavior: 'smooth' });

  }
  useEffect(() => {
    if(!chat_data) return
    const chat_id= document.getElementById('chatcontent')
    chat_id.scrollIntoView({ behavior: 'smooth' });

  },[chats, chat_data]);
  return (
    <>
      <ModalLayout onClose={onClose}>
        <div
          onClick={(e) => e.stopPropagation()}
          className={"bg-gray-50 rounded-lg py-5 w-[95vw] h-[90vh] tablet:w-full "}
        >
          <div className="justify-end flex px-4 mb-3">
            <button onClick={onClose}>
              <img
                alt="icon"
                src={"/svg/close.svg"}
                className="w-[14px] h-[14px]"
              />
            </button>
          </div>
          <button onClick={onClose} className="flex items-center gap-x-2 px-3 mb-4">
            <img src="/svg/arrow-back2.svg" alt="arrow" />
            <p>Go Back</p>
          </button>
          <div className="flex px-3 justify-between gap-10" 
            style={mount ? {} : { visibility: "hidden" }}>
            <div className="bg-white relative rounded-[15px] shadow-lg w-[33%] px-2 py-3 max-h-[73vh] overflow-y-auto">
              <div className="sticky top-0 mb-4 px-3">
                <p className="text-lg tablet:text-lg mb-[4px] text-[#8F34E9] font-semibold">
                  {'Ask AI'}
                </p>
                <p className="text-[#5D5C5C] text-sm">
                  {'Ask your question in plain language. I’ll handle the analysis for you.'}
                </p>
              </div>
              <div className="h-[45vh] overflow-y-auto flex flex-col px-1" 
                style={isLoading?{justifyContent:'center'}:{}}>
                <DataFetch isLoading={isLoading} isError={isError} 
                    errorMsg={error?.message}
                    isEmpty={!!(chats?.length===0 && chat_data?.conversations?.length==0)}
                    emptyComponent={
                      <div className="flex justify-center items-center px-5">
                        <p className="w-full text-center text-sm italic">You have not asked anything yet</p>                        
                      </div>
                    }
                    // isEmpty={chat_data?.conversations?.length}
                  >
                  <ChatBoxes new_chats={chats} 
                    old_chats={chat_data?.conversations ?? []} 
                    isLoading={isPending}
                  />
                </DataFetch>
                <p id="chatcontent" className="invisible text-xs">4</p>
              </div>
              <div className="sticky bottom-0 w-full px-3">
                <ChartInput 
                  chartInpRef={chartInpRef}
                  onNext={(chat)=>{

                    // chatDiv.scrollTo({
                    //   top: chatDiv.scrollHeight,
                    //   behavior: 'smooth'
                    // });
                    let ex_chats= [...chats]
                    ex_chats.push(chat)

                    // let new_chats=[chat, {isLoading:true, isUser:false}]
                    setChats([...ex_chats])
                    sendChat(chat)
                  }} 
                  isLoading={isPending}
                />
              </div>
            </div>

            <div className="rounded-[15px] w-[65%] bg-white shadow-lg px-6 py-3">
              <PreviewChart data={prev_chat}/>
            </div>
          </div>
          <div>

          </div>
        </div>
      </ModalLayout>
    </>
  );
}

function PreviewChart(){
  return(
    <div>

    </div>
  )
}
function ChatBoxes(
  {new_chats, old_chats, isLoading}){
    // console.log({old_chats})
  return(
    <div className="flex flex-col gap-y-2 pb-6 px-2" id="chat">
      {old_chats?.map(({role, ...chat},ind)=>
        <div key={ind}>
          {role==='assistant'?
            <AIchart chat={chat}/>:
            <div className="flex justify-end">
              <div dangerouslySetInnerHTML={{__html:chat.content}} style={{borderBottomRightRadius:'0px'}} 
                className="font-medium w-fit bg-gray-100 flex justify-end items-center text-right rounded-xl text-black text-sm p-2 px-3">
                {/* {chat.content} */}
              </div>
            </div>

          }
        </div>
      )}
      {new_chats?.map(({role, ...chat},ind)=>
        <div key={ind}>
          {role==='assistant'?
            <AIchart chat={chat} chatInd={ind} len_chat={new_chats?.length-1}/>:
            <div className="flex justify-end">
            <div dangerouslySetInnerHTML={{__html:chat.content}} style={{borderBottomRightRadius:'0px'}} 
              className="font-medium w-fit bg-gray-100 flex justify-end items-center text-right rounded-xl text-black text-sm p-2 px-3">
              {/* {chat.content} */}
            </div>
            </div>
          } 
        </div>
      )}
      {isLoading?
      <div className="h-12 flex gap-x-[5px] items-end w-fit">
        <div className="bg-black rounded-md p-1">
          <img src="/svg/robot.svg" alt="robot" className="w-5 h-5"/>
        </div>
        <p className="text-gray-500 thinking" style={{letterSpacing:'3px'}}></p>
      </div>
      :null}
    </div>
  )
}

function ChartInput({onNext, isLoading, chartInpRef:textareaRef}){
  //  const textareaRef = useRef(null);
  const [text, setText]= useState('')
  const handleInput = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  return(
    <div  className="border rounded-lg h-fit border-gray-300 flex items-end px-3 py-2">
      <div className="h-full flex-1">
        <textarea  
            maxLength={400} ref={textareaRef} rows={1} value={text} onInput={handleInput} 
            onChange={(e)=>setText(e.target.value)} placeholder="Ask me anything..."
            className="
              w-full bg-transparent resize-none overflow-hidden
              leading-relaxed outline-none
            "
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onNext({
                        content:'<p>'+text+'</p>',
                        status: 'loading', 
                        role:'user'
                    });
                    setText('')
                }
            }}
          />
      </div>
      <button onClick={()=>
      {
        onNext({
          content:'<p>'+text+'</p>', status:'loading', role:'user'
        })
        setText('')
      }
    } disabled={isLoading} 
        className="min-w-fit bg-black rounded-full p-2">
        <img style={{transform:'rotate(90deg)'}} src="/svg/arrow-back-white.svg" alt="go" className="h-5 w-5"/>
      </button>
    </div>
  )
}

function AIchart({chat,  chatInd, len_chat}){
  const [visible, setVisible] = useState(false);
  const [text, setText] = useState("");
// console.log({chat})
  useEffect(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if(!chatInd || !len_chat) return
    if(chatInd!=len_chat) return
    let i = 0;
    const fullText=chat?.short_note
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i === fullText.length) clearInterval(interval);
    }, 35); 
    return () => clearInterval(interval);
  }, [chatInd, len_chat]);
  return(

      <div className={chatInd===len_chat===(!!chatInd)?`w-full transition-all duration-700  flex items-end gap-x-[5px] ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`:' w-full flex items-end gap-x-[5px] '}>
        {/* <img src="/svg/robot.svg" alt="robot" className="w-4 h-4"/> */}
        {/* <p>{!isLatest?'This is a text':text}</p> */}
        <div className="bg-black rounded-md p-1">
          <img src="/svg/robot.svg" alt="robot" className="w-5 h-5"/>
        </div>
        <div className="text-sm" dangerouslySetInnerHTML={{__html:!chatInd?chat.short_note:chatInd!==len_chat?chat.short_note:text}}>

        </div>
      </div>
  ) 
}