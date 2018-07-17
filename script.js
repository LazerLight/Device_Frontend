const Papa = require("papaparse");
var calendarObj
//browserify script.js -o bundle.js
const parserConfig = {
  header: true
  // complete: (results, file)=> {
  //     console.log("Parsing complete:", results.data);
  // }
};

$(document).ready(() => {
  $.ajax({
    url: "http://localhost:8080"
  })
    .then(data => {
      
        calendarObj = calendarFormat(Papa.parse(data, parserConfig).data);
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

const returnPopularDevices = (calendarObj, date, amount) => {
  let dayMap = calendarObj[date];
  let deviceArr = [];
  dayMap.sensor.forEach((statusObj, id) => {
    let events = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'sensor', 'events': events}])
  })

  dayMap.gateway.forEach((statusObj, id) => {
    let events = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'gateway', 'events': events}])

  })
  let sortedArray = deviceArr.sort((a, b) => a[0]["events"] < b[0]["events"]);

  let popularDeviceArray = sortedArray.slice(0, amount);

  return popularDeviceArray;
}

const changeFromLastWeek = (calendarObj, thisWeekDate, deviceObj) => {
  let deviceId = deviceObj.id;
  let deviceType = deviceObj.type;
  let deviceEventsThisWeek = deviceObj.events;
 

  let lastWeekDateObj = new Date(thisWeekDate);
  lastWeekDateObj.setDate(lastWeekDateObj.getDate() - 7);
  let lastWeekDate = lastWeekDateObj.toString();
  if (calendarObj[lastWeekDate] === undefined || !calendarObj[lastWeekDate][deviceType].has(deviceId)){
    return 'No Information Found For This Device'
  }
  let lastWeekObj = calendarObj[lastWeekDate][deviceType].get(deviceId);

  let deviceEventsLastWeek = (lastWeekObj.online || 0) + (lastWeekObj.offline || 0);
  let percentChange = (deviceEventsThisWeek - deviceEventsLastWeek)/deviceEventsLastWeek;
  return `${Math.floor(percentChange * 100)}%`
}
$(".getDates").one('click', ()=>{
  let dateChoices = Object.keys(calendarObj)
  dateChoices.forEach((date)=>{
    let day = new Date(date);
    $(".getDates").append($("<option class='dateInfo'/>").val(date).text(day.toDateString()));
  })
})



const populateDeviceHTML = (entry, ranking, change) => {
  $(".popular-device").append(
    `<tr><td>${ranking}</td>
    <td>${entry[0].id}</td>
    <td>${entry[0].events}</td>
    <td>${change}</td></tr>`
  )
}

$(document).on('click', 'option.dateInfo', (event)=>{
  $(".popular-device-section").show();
  $(".popular-device-header").siblings().remove();

  const dateSelected = event.target.value;
  let topNDevices = 10;
  let thisWeekTopTen = returnPopularDevices(calendarObj, dateSelected, topNDevices);
  
  thisWeekTopTen.forEach((deviceEntry) =>{
    let rank = thisWeekTopTen.indexOf(deviceEntry) + 1;
    let percentChange = changeFromLastWeek(calendarObj, dateSelected, deviceEntry[0]);
    populateDeviceHTML(deviceEntry, rank, percentChange);
  })
});