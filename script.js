const returnPopularDevices = (calendarObj, date, amount) => {
  const dayMap = calendarObj[date];
  const deviceArr = [];
  dayMap.sensor.forEach((statusObj, id) => {
    let events = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'sensor', 'events': events}])
  })
  
  dayMap.gateway.forEach((statusObj, id) => {
    let events = (statusObj.online || 0) + (statusObj.offline || 0);
    deviceArr.push([{'id': id,'type': 'gateway', 'events': events}])
    
  })
  const sortedArray = deviceArr.sort((a, b) => a[0]["events"] < b[0]["events"]);
  const popularDeviceArray = sortedArray.slice(0, amount);
  
  return popularDeviceArray;
}

const changeFromLastWeek = (calendarObj, thisWeekDate, deviceObj) => {
  const deviceId = deviceObj.id;
  const deviceType = deviceObj.type;
  const deviceEventsThisWeek = deviceObj.events;
  
  
  let lastWeekDateObj = new Date(thisWeekDate);
  lastWeekDateObj.setDate(lastWeekDateObj.getDate() - 7);
  const lastWeekDate = lastWeekDateObj.toString();
  if (calendarObj[lastWeekDate] === undefined || !calendarObj[lastWeekDate][deviceType].has(deviceId)){
    return 'No Information Found For This Device'
  }
  const lastWeekObj = calendarObj[lastWeekDate][deviceType].get(deviceId);
  
  const deviceEventsLastWeek = (lastWeekObj.online || 0) + (lastWeekObj.offline || 0);
  const percentChange = (deviceEventsThisWeek - deviceEventsLastWeek)/deviceEventsLastWeek;
  return `${Math.floor(percentChange * 100)}%`
}

const monthView = (calendarObj, endDate, deviceType, deviceStatus) =>{
  const dayCollector = [];
  
  for(let day = 0; day < 30; day++){
    let dateObj = new Date(endDate);
    dateObj.setDate(dateObj.getDate() - day);
    let date = dateObj.toString();
    
    if(calendarObj[date]){
      let deviceOfTypeUsed = calendarObj[date][deviceType]
      var deviceCounter = 0;
      deviceOfTypeUsed.forEach((statusObj, deviceId) => {
        if(statusObj[deviceStatus] > 0){
          deviceCounter++
        }
      })
    } else{
      deviceCounter = 'No records found for this day.'
    }
    dayCollector.push({'deviceAmount' : deviceCounter, 'date': dateObj.toDateString()})
  }
  return dayCollector
}

const popularDaySelect = $(".date-popular-view");
const monthDaySelect = $(".date-month-view");
const popularSection = $(".popular-device-section");
const monthlyReportSection = $(".monthly-device-section");
const monthlyTable = $(".monthly-device");
const popularTable = $(".popular-device");
const monthlyTableHeader = $(".monthly-device-header");
const popularTableHeader = $(".popular-device-header");


popularDaySelect.one('click', ()=>{
  const dateChoices = Object.keys(calendarObject)
  dateChoices.forEach((date)=>{
    const day = new Date(date);
    popularDaySelect.append($("<option/>").val(date).text(day.toDateString()));
  })
})


const populateDeviceHTML = (entry, ranking, change) => {
  popularTable.append(
    `<tr><td>${ranking}</td>
    <td>${entry[0].id}</td>
    <td>${entry[0].events}</td>
    <td>${change}</td></tr>`
  )
}


$(document).on('click', '.date-popular-view option', (event)=>{
  popularSection.show();
  monthlyReportSection.hide();
  popularTableHeader.siblings().remove();
  
  const dateSelected = event.target.value;
  const topNDevices = 10;
  const thisWeekTopTen = returnPopularDevices(calendarObject, dateSelected, topNDevices);
  
  thisWeekTopTen.forEach((deviceEntry) =>{
    const rank = thisWeekTopTen.indexOf(deviceEntry) + 1;
    const percentChange = changeFromLastWeek(calendarObject, dateSelected, deviceEntry[0]);
    populateDeviceHTML(deviceEntry, rank, percentChange);
  })
});




monthDaySelect.one('click', ()=>{
  const dateChoices = Object.keys(calendarObject)
  dateChoices.forEach((date)=>{
    const day = new Date(date);
    monthDaySelect.append($("<option/>").val(date).text(day.toDateString()));
  })
})

const populateMonthHTML = (day, amount) => {
  monthlyTable.append(
    `<tr><td>${day}</td>
    <td>${amount}</td></tr>`
  )
}

$('.month-view button').click((event)=>{
  const typeSelected = $('#device-type').val();
  const statusSelected = $('#device-status').val();
  const daySelected = $('.date-month-view').val();
  
  if(typeSelected === null || statusSelected === null || daySelected === null){
    return
  }
  popularSection.hide();
  monthlyReportSection.show();
  monthlyTableHeader.siblings().remove();
  
  const monthArr = monthView(calendarObject, daySelected, typeSelected, statusSelected);
  monthArr.forEach((dayEntry) => {
    populateMonthHTML(dayEntry.date, dayEntry.deviceAmount)
  })
  
})