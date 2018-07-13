const Papa = require("papaparse");
var calendarObj

const parserConfig = {
  header: true
  // complete: (results, file)=> {
  //     console.log("Parsing complete:", results.data);
  // }
};

$(document).ready(function() {
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

function calendarFormat(csvFileData) {
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
      let deviceEventOccurance = calendarObj[date][type].get(id)[status]+1 || 1
      let statusObj = calendarObj[date][type].get(id)
      statusObj[status] = deviceEventOccurance
      calendarObj[date][type].set(id, statusObj)
    } else {
      let statusObj = {};
      statusObj[status] = 1;

      calendarObj[date][type].set(id, statusObj);
    }
  });

  return calendarObj;
}

function returnPopularDevices(calendarObj, date, amount) {
  let dayMap = calendarObj[date];
  let deviceArr = [];
  dayMap.sensor.forEach((statusObj, id) => {
    let occurances = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'sensor', 'occurances': occurances}])
  })

  dayMap.gateway.forEach((statusObj, id) => {
    let occurances = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'gateway', 'occurances': occurances}])

  })
  let sortedArray = deviceArr.sort((a, b) => a[0]["occurances"] < b[0]["occurances"]);

  let popularDeviceArray = sortedArray.slice(0, amount);
  return popularDeviceArray;
}

function changeFromLastWeek(calendarObj, thisWeekDate, deviceId) {
  let lastWeekDate = new Date(thisWeekDate);
  lastWeekDate.setDate(lastWeekDate.getDate() - 7);

  let lastWeekDateEv = calendarObj[lastWeekDate].get(deviceId);
  let thisWeekDateEv = calendarObj[thisWeekDate].get(deviceId);

  let percentChage = (thisWeekDateEv - lastWeekDateEv)/lastWeekDateEv

  return percentChage;
}
$(".getDates").one('click', ()=>{
  let dateChoices = Object.keys(calendarObj)
  dateChoices.forEach((date)=>{
    let day = new Date(date);
    $(".getDates").append($("<option class='dateInfo'/>").val(date).text(day.toDateString()));
  })
})

$(document).on('click', 'option.dateInfo', (event)=>{
  console.log('clicked')
  const date = event.target.value;
  let amount = 10;

  let thisWeekTopTen = returnPopularDevices(calendarObj, date, amount);
  console.log(thisWeekTopTen)
  // thisWeekTopTen.forEach((entry) =>{
  //   let percentChange = changeFromLastWeek(calendarObj, date, entry[0])
  //   console.log(entry, percentChange)
  //   entry.push(percentChange);
  // })
  // console.log(percentChange)
})