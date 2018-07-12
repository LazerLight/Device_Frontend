var Papa = require('papaparse');

const parserConfig = {
    header: true,
    complete: (results, file)=> {
        console.log("Parsing complete:", results.data);
    }
}

$(document).ready(function() {
    $.ajax({
        url: "http://localhost:8080"
    }).then((data)=> {
        // console.log('data', data)
        Papa.parse(data, parserConfig)
    })
    .fail((err)=>{
        console.log('err', err)
    })
});