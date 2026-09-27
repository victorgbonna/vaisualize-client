import { AppLayout, DisplayProjectId } from "@/components"

export default function ShareProject(){
    const active='Projects'
    return(
       <AppLayout active={active}>
            <DisplayProjectId/>
        </AppLayout>
    )
}