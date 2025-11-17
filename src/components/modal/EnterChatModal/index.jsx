import { EnterChatContext } from "@/context";
import ModalLayout from "../modalLayout"
import {useContext, useState, useEffect} from 'react'
import { ImageContainer, LoadButton, SelectOption, SelectOptionAsObjectValue, iconSvgPath } from "@/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useHttpServices } from "@/hooks";
import { API_ENDPOINTS, consolelog } from "@/configs";
// import { PAGE_ROUTES } from '@/configs';


export default function EnterChatModal({onNext}) {
    const { showModal, setShowModal } = useContext(EnterChatContext);
    const [msgObj, setMsgObj]= useState({})
    const [searchStatus, setSearchStatus]= useState(null)

    const {postData}= useHttpServices()
    const formChange=(e, key, option=false)=>{
        if (option) return setMsgObj({...msgObj,[key]:e})
        return setMsgObj({...msgObj,[key]:e.target.value})
    }
    const loadSeasonQuery= async()=>{
        return await postData(API_ENDPOINTS.SEARCH_SEASON_INFO,{...msgObj, league:msgObj.league.toLowerCase()})
    }

    const {mutate:loadSeason,data:ues, isPending:loadLoading}=useMutation({
    mutationFn: ()=>loadSeasonQuery(),
    onError:({error})=>{
        consolelog({error})
        return NotifyError(error.message || 'Could not get data')
    },
    onSuccess:({data})=>{
        consolelog({mutation:data})
        setSearchStatus(data?.data?.body)
        if(data?.data?.api_endpoint==="get_existing_league_stats"){
            setTimeout(() => {
                onNext({...msgObj, league:msgObj.league.toLowerCase()})                
                setSearchStatus(null)
            }, 3000);
            return
        }
        else{
            
            consolelog('no e')
            return call_season_to_db()
        }
        // return NotifySuccess('Account created! Please check your email for activation link.')
    }
    })

    const addSeasonQuery= async()=>{
        return await postData(API_ENDPOINTS.GET_NEW_SEASON_INFO,
            {...msgObj, league:msgObj.league.toLowerCase(),
                participating_teams:searchStatus?.participating_teams
            })
    }
    const {mutate:addSeasonToDb,data:new_season_data, isLoading:addLoading}=useQuery({
        // addSeasonQuery,
        queryKey:['new-season-info:',msgObj.league, msgObj.year],
        queryFn:()=>addSeasonQuery(),
        // onError:({error})=>{
        //     consolelog({error})
        //     return NotifyError(error.message || 'Could not get data')
        // },
        // onSuccess:({data})=>{
        //     consolelog({data})
            
        //     onNext(msgObj)           
        //     return setSearchStatus(null)
        //     // return NotifySuccess('Account created! Please check your email for activation link.')
        // }, 
        retry:false, enabled:!!searchStatus?.participating_teams,
        refetchOnWindowFocus:false,
    })
    useEffect(() => {
        if(!new_season_data) return
        setSearchStatus(null)
        onNext({...msgObj, league:msgObj.league.toLowerCase()}) 
        return
    }, [new_season_data]);

    if (!showModal) return null
    return (
        <ModalLayout onClose={()=>setShowModal('')}>
            <div 
                onClick={(e)=> e.stopPropagation()} 
                className={"bg-white rounded-md px-5 py-5 text-center w-[400px] tablet:w-full "}>
               <div className="flex justify-between items-center mb-8">
                   {/* <ImageContainer src={'/vercel.svg'} className={'w-[70px] h-[30px]'}/> */}
                   <h2 className="text-[#E51837] text-lg font-medium">FootyDataScraper</h2>
                
                   
                   <img className="cursor-pointer" onClick={
                        ()=>{
                            setShowModal('') 
                            setSearchStatus(null)
                        }
                    } alt="icon" src={'/svg/close.svg'}/>
               </div>
               <button className="hidden" id="add_season_btn" onClick={()=>addSeasonToDb()}>
                    click
                </button>
               <div className=" flex flex-col items-start w-full space-y-4">
                    {!searchStatus?
                    <div className="w-full grid grid-cols-1 tablet:grid-cols-1 gap-4">
                        <div className="w-full">
                            <p className="text-left text-sm text-gray-600">League</p>
                            <SelectOption
                                options={['EPL', 'La Liga', 'Serie A']}
                                value={msgObj.league || ''} 
                                onChange={(e)=>formChange(e,'league', true)}
                                label="Choose the league"
                            />
                        </div>
                        <div className="w-full">
                            <p className="text-left text-sm text-gray-600">Season</p>
                            {/* <input type="text" className="border mt-[4px] border-green tablet:text-base text-sm px-3 py-3 rounded-md min-w-full"
                                value={msgObj.name} 
                                onChange={(e)=>formChange(e,'name')}
                            /> */}
                            <SelectOption
                                options={
                                    [...Array(15).keys()].map((x)=>(2010+x)+'–'+(''+(2011+x)).slice(2,))
                                }
                                value={msgObj.year || ''} 
                                onChange={(e)=>formChange(e,'year', true)}
                                label="Choose the season"
                            />
                        </div>
                    </div>:
                    <div className="w-full flex flex-col justify-center items-center h-[100px]">
                        <p className="text-left text-sm text-gray-600 font-medium">Fetching teams and matches...</p>
                    </div>
                    }
                    
                    {!searchStatus && <div className="flex w-full justify-center">
                    <LoadButton 
                        onClick={()=>loadSeason()}
                        disabled={!msgObj.year || !msgObj.league}
                        isLoading={loadLoading || addLoading}
                        className='tablet:w-[80%] w-1/2 text-center flex px-3 py-2 bg-green-600 items-center justify-center gap-x-[8px] rounded-full'>
                        <p className='text-black text-sm'>Send</p>
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.4645 1.18571C16.5009 1.09484 16.5098 0.995303 16.4901 0.899426C16.4704 0.80355 16.4231 0.715554 16.3539 0.646348C16.2847 0.577141 16.1967 0.529768 16.1008 0.5101C16.0049 0.490433 15.9054 0.499336 15.8145 0.535707L1.26751 6.35471H1.26651L0.814506 6.53471C0.728896 6.56886 0.654391 6.626 0.599221 6.69984C0.544051 6.77367 0.510364 6.86132 0.501879 6.9531C0.493395 7.04487 0.510443 7.13721 0.551143 7.21991C0.591842 7.3026 0.654607 7.37244 0.732506 7.42171L1.14251 7.68171L1.14351 7.68371L6.13851 10.8617L9.31651 15.8567L9.31851 15.8587L9.57851 16.2687C9.62793 16.3463 9.6978 16.4088 9.78044 16.4492C9.86307 16.4896 9.95527 16.5065 10.0469 16.4979C10.1385 16.4893 10.2259 16.4557 10.2996 16.4006C10.3733 16.3455 10.4304 16.2711 10.4645 16.1857L16.4645 1.18571ZM14.6315 3.07571L7.13751 10.5697L6.92251 10.2317C6.88311 10.1697 6.83053 10.1171 6.76851 10.0777L6.43051 9.86271L13.9245 2.36871L15.1025 1.89771L14.6315 3.07571Z" fill="white"/>
                        </svg>
                    </LoadButton>
                    </div>}
                    
               </div>
            </div>
        </ModalLayout>

    );
  }
