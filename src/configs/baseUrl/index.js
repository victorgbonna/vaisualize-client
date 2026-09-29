const baseURL =
  process.env.NODE_ENV === "production"
    ? "https://vaisualize-api.onrender.com"
    // :"http://192.168.153.36:5002";
    // : "https://vaisualize-api.onrender.com"
    : "http://localhost:5001"
    // : "https://vaisualize-api.onrender.com"

    // : "http://127.0.0.1:8000";
    // :"https://football-cleansheet-data-api.onrender.com"

export default baseURL 

// const a={
//     "status": "success",
//     "filters": [
//         [
//             {
//                 "table": "26_fanchallenger_db.users.json",
//                 "column": "favourite_team",
//                 "filterOpt": "eq",
//                 "value": "Arsenal"
//             }
//         ]
//     ],
//     "relationships": [
//         {
//             "from_table": "26_fanchallenger_db.transactions.csv",
//             "from_column": "user",
//             "to_table": "26_fanchallenger_db.users.json",
//             "to_column": "_id"
//         }
//     ]
// }

// {
//     "status": "success",
//     "filters": [
//         [
//             {
//                 "table": "26_fanchallenger_db.transactions.csv",
//                 "column": "amount",
//                 "filterOpt": "gt",
//                 "value": 2000
//             },
//             {
//                 "table": "26_fanchallenger_db.transactions.csv",
//                 "column": "type",
//                 "filterOpt": "eq",
//                 "value": "deposit"
//             }
//         ]
//     ],
//     "relationships": []
// }