"use client";
import { API_ENDPOINTS, consolelog } from "@/configs";
import { DataRequestContext } from "@/context";
import React, { useContext } from "react";
//  import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

// import Chart from "./chartSetup"; 
import { Bar} from "react-chartjs-2";

function HistogramGrouped({type, ...props}){
  return(
    <div>
      {props?.group_by?
        <HistogramZ {...props}/>
      : <HistogramSingle {...props}/>}
    </div>
  )
}


function HistogramZ({x, y, z=null, title, group_by, aggregation='count'}){
  const {dataArray}=useContext(DataRequestContext);

  const x_y_computations = dataArray.map((dataRow) => +dataRow[x]);
  const x_keys = x_y_computations;
  const rawData = x_keys;

  const max_bin = roundUpTo5(Math.max(...x_keys));
  const min_bin = roundDownTo5(Math.min(...x_keys));

  let bins = [];
  let diff = (max_bin - min_bin) / 6;
  diff = Math.round(diff / 1) * 1;

  for (let index = min_bin; index < max_bin; index += diff) {
    bins.push(index);
  }

  if (!bins.length) {
    return null;
  }

  const groups = [...new Set(dataArray.map((row) => row[group_by]))];

  // Create a buckets container for each group
  // buckets[group][binIndex] = array of {xValue, yValue}
  const buckets = {};
  groups.forEach((g) => {
    buckets[g] = bins.slice(0, -1).map(() => []);
  });

  rawData.forEach((value, idx) => {
    const groupValue = dataArray[idx][group_by];
    const yValue = y ? Number(dataArray[idx][y]) || 0 : 0;

    for (let i = 0; i < bins.length - 1; i++) {
      if (value >= bins[i] && value < bins[i + 1]) {
        buckets[groupValue][i].push({
          xValue: value,
          yValue,
        });
        break;
      }
    }
  });

  const computeAggregatesGroupBy = (bucket, aggregation='count') => {
    if (aggregation === "count") {
      return bucket.length;
    }

    const total = bucket.reduce((acc, item) => acc + item.yValue, 0);

    if (aggregation === "total") {
      return total;
    }

    if (aggregation === "average") {
      if (bucket.length === 0) return 0;
      return +(total / bucket.length).toFixed(2);
    }

    return bucket.length;
  };


  const labels = bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1] - 1}`);

  const datasets = groups.map((g, index) => {
    const groupBuckets = buckets[g];

    const aggregatedValues = groupBuckets.map((bucket) =>
      computeAggregatesGroupBy(bucket, aggregation)
    );

    return {
      label: g,
      data: aggregatedValues,
      backgroundColor: API_ENDPOINTS.GET_COLORS[index].replace('1)','0.6)'),
      borderColor: API_ENDPOINTS.GET_COLORS[index],
      borderWidth: 1,
    };a
  });


  const chartData = {
    labels,
    datasets,
  };
    const options = {
      responsive: true,
      plugins: {
        legend: { position: "top" , display:false},
        title: { display: true, text: y[0] },
      },
      scales: {
        x: {
          title: { display: true, text: x[0] },
          stacked: false, 
        },
        y: {
          beginAtZero: false,
          ticks: { stepSize: 1, precision: 0 },
          title: { display: true, text: y[0] || aggregation  },
          
        },
      },
    };

  return (
    <div className="">
      <Bar data={chartData} options={options} />
    </div>
  );
};

function HistogramSingle({x,y,z, aggregation='count'}){
  
  const {dataArray}=useContext(DataRequestContext);
  const x_y_computations = dataArray.map((dataRow) => +dataRow[x]);
  const x_keys = x_y_computations;
  const rawData = x_keys;

  const max_bin = roundUpTo5(Math.max(...x_keys));
  const min_bin = roundDownTo5(Math.min(...x_keys));

  let bins = [];
  let diff = (max_bin - min_bin) / 6;
  diff = Math.round(diff / 1) * 1;

  for (let index = min_bin; index < max_bin; index += diff) {
    bins.push(index);
  }

  if (!bins.length) {
    return null;
  }

  const buckets = bins.slice(0, -1).map(() => []);

  // Fill buckets with values
  rawData.forEach((value, idx) => {
    for (let i = 0; i < bins.length - 1; i++) {
      if (value >= bins[i] && value < bins[i + 1]) {
        // store value so we can aggregation later
        buckets[i].push({
          xValue: value,
          yValue: y ? Number(dataArray[idx][y]) || 0 : 0
        });
        break;
      }
    }
  });

  const computeAggregates = (bucket, aggregation='count') => {
    if (aggregation === "count") {
      return bucket.length;
    }

    const total = bucket.reduce((acc, item) => acc + item.yValue, 0);

    if (aggregation === "total") {
      return total;
    }

    if (aggregation === "average") {
      if (bucket.length === 0) return 0;
      return +(total / bucket.length).toFixed(2);
    }

    // fallback
    return bucket.length;
  };

  // compute final aggregated values
  const aggregatedValues = buckets.map((bucket) =>
    computeAggregates(bucket, aggregation)
  );

  // labels stay same
  const labels = bins.slice(0, -1).map((b, i) => `${b}-${bins[i + 1] - 1}`);

  // final chartData
  const chartData = {
    labels,
    datasets: [
      {
        label:
          aggregation === "count"
            ? "Frequency"
            : aggregation === "total"
            ? `Total (${y})`
            : `Average (${y})`,
        data: aggregatedValues,
        backgroundColor: API_ENDPOINTS.GET_COLORS,
        borderColor: "rgba(75,192,192,1)",
        borderWidth: 1,
      },
    ],
  };
  const options = {
    // categoryPercentage: 1.0,
      // barPercentage: 1.0,
    responsive: true,
    plugins: {
      legend: { position: "", display:false },
      title: { display: false, text: "Histogram Example" },
    },
    scales: {
      x: {
        title: { display: true, text: x[0] },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: y[0] },
      },
    },
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* <DND/> */}
      <Bar data={chartData} options={options} />
    </div>
  );
};

const roundUpTo5 = (num) => Math.ceil(num / 5) * 5;
const roundDownTo5 = (num) => Math.floor(num / 5) * 5;

function groupData({array, key, aggregation = "count"}) {
  if (!Array.isArray(array) || !array.length) return {};
  const result = {};

  for (const item of array) {
    const value = Number(item[key]);
    const group = item[key];

    if (!result[group]) {
      result[group] = { count: 0, sum: 0 };
    }

    result[group].count += 1;
    result[group].sum += Number.isFinite(value) ? value : 0;

  }
// consolelog({ori:result})
  for (const group in result) {
    const { count, sum } = result[group];
    result[group] =
      aggregation === "sum"
        ? sum
        : aggregation === "average"
        ? sum / count
        : count;
  }

  return result;
}


// function Draggable() {
//   const { attributes, listeners, setNodeRef, transform } = useDraggable({
//     id: "draggable",
//   });
//   const style = {
//     transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
//   };

//   return (
//     <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
//       Drag me
//     </button>
//   );
// }

// function Droppable() {
//   const { isOver, setNodeRef } = useDroppable({ id: "droppable" });
//   const style = {
//     backgroundColor: isOver ? "lightgreen" : "lightgray",
//     width: 200,
//     height: 200,
//   };

//   return <div ref={setNodeRef} style={style}>Drop here</div>;
// }

// function DND() {
//   return (
//     <DndContext onDragEnd={(e) => console.log("Dropped:", e.over?.id)}>
//       <Draggable />
//       <Droppable />
//     </DndContext>
//   );
// }
// const get_for_40_49= x?.xData.filter((x)=>(x>=93))
  // console.log({x_length:get_for_40_49.length})
  // console.log({bins, max_bin, min_bin})
  
  // const counts = bins.length 
  // console.log({counts})
  

  // console.log({counts})

function aggregateValuesSingle({ data, x, y, group_by, aggregation }) {
  // bins must be manually defined or computed before this
  // here we assume the "x" column already contains the bin label: "0–10", "10–20", etc.

  const groups = {};
  
  data.forEach(row => {
    const group = row[group_by];
    const bin = row[x];
    const value = Number(row[y]) || 0;

    if (!groups[group]) groups[group] = {};
    if (!groups[group][bin]) groups[group][bin] = [];

    groups[group][bin].push(value);
  });

  const result = {};

  Object.keys(groups).forEach(group => {
    result[group] = {};

    Object.keys(groups[group]).forEach(bin => {
      const arr = groups[group][bin];

      if (aggregation === "count") {
        result[group][bin] = arr.length;
      } 
      else if (aggregation === "total") {
        result[group][bin] = arr.reduce((a,b) => a + b, 0);
      }
      else if (aggregation === "average") {
        const total = arr.reduce((a,b) => a + b, 0);
        result[group][bin] = +(total / arr.length).toFixed(2);
      }
    });
  });

  return result;
}


export default HistogramGrouped;









