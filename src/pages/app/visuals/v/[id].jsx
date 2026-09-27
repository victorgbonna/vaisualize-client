import { AppLayout, DisplayProjectId } from "@/components"

export default function ViewProject(){
    const active='Projects'
    return(
       <AppLayout active={active}>
            <DisplayProjectId/>
        </AppLayout>
    )
}