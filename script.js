var Papa = require('papaparse');

const parserConfig = {
    header: true,
    // complete: (results, file)=> {
    //     console.log("Parsing complete:", results.data);
    // }
}

$(document).ready(function() {
    $.ajax({
        url: "http://localhost:8080"
    }).then((data)=> {
   returnPopularDevices(calendarFormat(Papa.parse(data, parserConfig).data), "Mon May 01 2017")
    })
    .fail((err)=>{
        console.log('err', err)
    })
});

function calendarFormat(csvFileData){
    const calendarObj = {};
    csvFileData.forEach(entry => {
        let date = new Date(entry.timestamp).toDateString();
        let deviceId = entry["id"];
        
        if (!(date in calendarObj)) {
            let dateInfoHolder = new Map();
            calendarObj[date] = dateInfoHolder.set(deviceId, 1);  
            return;
        }
        
        let isDevicePresent = calendarObj[date].has(deviceId);
        if (isDevicePresent) {
            let deviceEventOccurance = calendarObj[date].get(deviceId);
            calendarObj[date].set(deviceId, deviceEventOccurance + 1);
        } else {
            calendarObj[date].set(deviceId, 1);
        }
    });
    return calendarObj
}

function returnPopularDevices(calendarObj, date, amount){
    let dayMap = calendarObj[date];
    let sortedArray = new Array([...dayMap.entries()].sort((a,b) => a[1] < b[1]));
    const popularDeviceArray = [];

    for(let i = 0; i < amount; i++){
        popularDeviceArray.push(sortedArray[i])
    }
    console.log(popularDeviceArray)
    return popularDeviceArray
}
