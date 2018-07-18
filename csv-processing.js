const Papa = require("papaparse");


const parserConfig = {
    header: true
};

$(document).ready(() => {
    $.ajax({
        url: "http://localhost:8080"
    })
    .then(data => {
        calendarObject = calendarFormat(Papa.parse(data, parserConfig).data);
    })
    .fail(err => {
        console.log("err", err);
    });
});

const calendarFormat = (csvFileData) => {
    const calendarObj = {};
    csvFileData.forEach(entry => {
        
        let date = new Date(new Date(entry.timestamp).setHours(0,0,0,0));
        let id = entry["id"];
        let status = entry["status"];
        let type = entry["type"];
        
        
        if (!(date in calendarObj)) {
            let typeObj = {'sensor': new Map(), 'gateway': new Map()};
            let statusObj = {};
            statusObj[status] = 1;
            
            typeObj[type].set(id, statusObj);
            calendarObj[date] = typeObj
            return;
        }
        
        let isDevicePresent = calendarObj[date][type].has(id);
        if (isDevicePresent) {
            let deviceEvents = calendarObj[date][type].get(id)[status]+1 || 1
            let statusObj = calendarObj[date][type].get(id)
            statusObj[status] = deviceEvents
            calendarObj[date][type].set(id, statusObj)
        } else {
            let statusObj = {};
            statusObj[status] = 1;
            
            calendarObj[date][type].set(id, statusObj);
        }
    });
    
    return calendarObj;
}
/*
Calendar Object Format
Example: { "Mon Sept 07": { sensor: ["5kfkb3", { online: 2, offline: 3 }] } };

It is an object with the dates as keys. The value are also an object.
In that object the keys are either 'sensor'  and/or 'gateway'. The values are Map objects, separating each device based on device type.
In that map object, the keys are device IDs. The value are objects..
In that object, the keys are either 'online' and/or 'offline' which counts the statuses of that specific device on that day. 

*/

