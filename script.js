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
  return calendarObj;
}

function returnPopularDevices(calendarObj, date, amount) {
  let dayMap = calendarObj[date];
  let sortedArray = [...dayMap.entries()].sort((a, b) => a[1] < b[1]);

  const popularDeviceArray = [];

  for (let i = 0; i < amount; i++) {
    popularDeviceArray.push(sortedArray[i]);
  }
  return popularDeviceArray;
}

function changeFromLastWeek(calendarObj, thisWeekDate, deviceId) {
    // console.log(calendarObj, thisWeekDate, deviceId)
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
  const date = event.target.value;
  let amount = 10;

  let thisWeekTopTen = returnPopularDevices(calendarObj, date, amount);
  // thisWeekTopTen.forEach((entry) =>{
  //   let percentChange = changeFromLastWeek(calendarObj, date, entry[0])
  //   console.log(entry, percentChange)
  //   entry.push(percentChange);
  // })
  // console.log(percentChange)
})