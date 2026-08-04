export default function ChartEditor({data}) {
    const [chartOptions, setChartOptions] = useState({})
    return (
        <div className="flex items-start">
            <VisualizationTypes/>
            {/* <DataMapping/> */}
            
        </div>
    );
}

function VisualizationTypes(){
    return(
        <div>

        </div>
    )
}