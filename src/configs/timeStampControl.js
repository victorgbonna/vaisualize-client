  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const shortWeekdays = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
  ];
const getWeekNumber=(date) => {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), 0, 1);
  const pastDaysOfYear = (d - firstDay) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
}

const getWeekGroup=(weekNumber) => {
  // groups: wk1-4 (group 1), wk5-8 (group 2), ... wk49-52 (group 13)
  const group = Math.ceil(weekNumber / 4);
  return weekGroups[group - 1] || "wk49-52";
}
const weekGroups = [
  "wk1-4", "wk5-8", "wk9-12", "wk13-16", "wk17-20", "wk21-24",
  "wk25-28", "wk29-32", "wk33-36", "wk37-40", "wk41-44", "wk45-48", "wk49-52"
];

// {
//     movie:{
//         september:{total:3, count:4},
//         october:{total:3, count:4}
//     },
//     series:{
//         october:{total:3, count:4}
//     }
// }
const timeStampControl={
    shortMonths,
    shortWeekdays,
    weekGroups,
    extractDateUnit:({unit, value:dateInput})=>{
        const date = new Date(dateInput);
        const u = unit.toLowerCase();
        if (u.includes("year")) {
            return date.getFullYear();

        } else if (u.includes("mon")) {
            // "mon" = month name
            return shortMonths[date.getMonth()];

        } else if (u.includes("mm")) {
            // month number
            return date.getMonth() + 1;

        } else if (u.includes("week") || u.includes("wk")) {
            // return shortWeekdays[date.getWeek()];
            const weekNum = getWeekNumber(date);
            return getWeekGroup(weekNum);

        } else if (u.includes("dd")) {
            return date.getDate();

        } else if (u.includes("day")) {
            return shortWeekdays[date.getDay()];

        } else if (u.includes("hr") || u.includes("hour")) {
            return date.getHours();

        } else if (u.includes("min")) {
            return date.getMinutes();

        } else if (u.includes("sec")) {
            return date.getSeconds();

        } else if (u.includes("timestamp")) {
            return date.getTime();

        } else {
            return null;
        }
    },
    isTimeStamp:(value)=>{
        if(!value) return value
        let date = new Date(value);
        if (!isNaN(date)) return 'date';

        const adjusted = value.replace(' ', 'T');
        date = new Date(adjusted);

        return !isNaN(date) ? 'adjusted-date' : null;
    },
    isDate:(value,c=false)=> {
        if (value instanceof Date && !isNaN(value.getTime())) return true;
        const d = new Date(value);
        if(c){
            console.log({z:d.getTime(), d,value})
        }
        return !isNaN(d.getTime());
    },
    parseTimestamp:({pattern, value})=>{
        if(pattern ==='date') return value
        if(pattern==='adjusted-date'){
            const adjusted = value.replace(' ', 'T');
            return new Date(adjusted);
        }
        return value
    },
    parseIfValidTimestamp:(value)=>{
        let date = new Date(value);
        if (!isNaN(date)) return date;

        const adjusted = value.replace(' ', 'T');
        date = new Date(adjusted);

        return !isNaN(date) ? date : null;      
            },
    getUnit:(values)=>{
        for (const element of values) {
            if(element.toLowerCase().includes('month')){
                return 'month'
            }
            else if(element.toLowerCase().includes('day')){
                return 'day'
            }
            if(element.toLowerCase().includes('month')){
                return 'hour'
            }           
        }
        return ''
    },
    convertToDigit:(value)=>{
        if(!value) return value
        if(typeof value ==='number') return value
        return +value.replace(/[^0-9.]/g, '')
    }   
    // getAggregation:({})
}

    
export default timeStampControl;