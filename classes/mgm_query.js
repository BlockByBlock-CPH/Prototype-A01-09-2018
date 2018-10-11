import { Feature } from 'ol';
import { Polygon } from 'ol/geom';
import { QUERY1, QUERY2, QUERY3, QUERY4, QUERY5,
        QUERY6, QUERY7, QUERY8, QUERY9, QUERY10,
        QUERY11, QUERY12, QUERY13, QUERY14, QUERY15,
        QUERY16, QUERY17, QUERY18, QUERY19, QUERY20,
        QUERY23, QUERY24, QUERY25, QUERY17_2, QUERY18_2,
        QUERY_1_2, QUERY_3_4, QUERY_5_6, QUERY_7_8,
        QUERY_9_10, QUERY_11_12, PROTON, WEEK, WEEK_HOUR  } from '../constant/api';

var Highcharts = require('highcharts');

//Classes
import ServiceQuery from './services';
import ChartBBB from './chart';
import LayerBBB from './layer';
import MapBBB from './map';

export default class MgmQuery{
    constructor(){
        this.createTimelineDayChart = this.createTimelineDayChart.bind(this);
        this.createTimelineWeekChart = this.createTimelineWeekChart.bind(this);
        this.showTimeDay = this.showTimeDay.bind(this);
        this.showTimeWeek = this.showTimeWeek.bind(this);
    }

    addressCoord(address){
        const service = new ServiceQuery();
        const API_PROTON = PROTON;
        const addressFind = address;
        const point = service.get(API_PROTON+addressFind, function(status, response){
            if(status == 200){
                const resp = response.features;
                const dataAddress = resp.map(e => {
                    return{
                        lon:e.geometry.coordinates[0],
                        lat:e.geometry.coordinates[1],
                        address:{
                            name:e.properties.name,
                            street: e.properties.street,
                            housenumber: e.properties.housenumber,
                            postcode:e.properties.postcode,
                            city:e.properties.city,
                            state:e.properties.state,
                            country:e.properties.country
                        },
                        original:{
                            formatted:e.properties.name,
                            details:e.properties
                        }
                    }
                });

                const suggestions = dataAddress.map(resp =>{
                    const country = (resp.address.country == undefined) ? '' : resp.address.country;
                    const city = (resp.address.city == undefined) ? '' : resp.address.city+',';
                    const street = (resp.address.street == undefined) ? '' : resp.address.street;
                    const housenumber = (resp.address.housenumber == undefined) ? '' : '#'+resp.address.housenumber+',';
                    const postcode = (resp.address.postcode == undefined) ? '' : resp.address.postcode;
                    const state = (resp.address.state == undefined) ? '' : resp.address.state+',';
                    const name = (resp.address.name == undefined) ? '' : resp.address.name+',';
                    const longitude = resp.lon; 
                    const latitude = resp.lat;

                    const list_suggestions = `
                        <li>
                            <a id="element" href="#">
                                ${street} ${housenumber} ${name} ${postcode} ${city} ${state} ${country}
                                <input type="hidden" id="long" value="${longitude}"/>
                                <input type="hidden" id="lat" value="${latitude}"/>
                            </a>
                        </li>          
                    `;

                    return list_suggestions;
                });
                $('#list_suggestions').append(suggestions);
            }else{
                console.log("Error AddressCoord: "+status);
            }
        });
    }


    findQuery(coordParam, dayParam){
        const day = dayParam;
        const longAddress = coordParam[0];
        const latAddress = coordParam[1];
        const POINT_ADDRESS = 'POINT(' + longAddress + ' ' + latAddress + ')';
        let params = {};
        let viewparams = {};
        let query1 = {};
        let query2 = {};
        let query3 = {};
       
        if(day == 0){         
            params = 'COORD:' + POINT_ADDRESS;
            query1 = WEEK+params;
            query2 = WEEK_HOUR+params;
            query3 = QUERY13+params;

            return [query1,query2,query3];

        }else if(day > 0){
            viewparams = ['COORD:' + POINT_ADDRESS, 'DAY:' + day];
            params = viewparams.join(';');
            query1 = QUERY14+params;

            return query1;
        }
    }

    runTimelineDay(data,mapBase, coord){ 
        $("#timeline").val(0);
        $('#timeline').attr('min', 0);
        $('#timeline').attr('max', 23);
        const chartCont = `<div id="timelineChart"></div>`;
        $( "#timelineChart2" ).remove();
        $('.summary2').html(chartCont);        
        const layer = new LayerBBB();
        const mapb = new MapBBB();
        let pointPolygon = {};
        let polygon_feature = {};
        let polygon_geom = {};
        let centerPolygon = {};
        let i = 0;
        let labels = [];
        let dataChart = [];
        let people = [];
        let day = '';
        let area = data[0].properties.area;
        let divideZone = 0;

        if(area == 1){
            divideZone = 4;
        }else if(area == 2){
            divideZone = 16;
        }
        else if(area == 4){
            divideZone = 64;
        }
        else if(area == 8){
            divideZone = 256;
        }else if(area == 0.25){
            divideZone = 1;
        }
        
        const size = Object.keys(data).length;        
        const dataInfo = data;        
                
        dataInfo.map(d => {
                dataChart.push(d.properties.people);
                labels.push(d.properties.hours_act);
                day = d.properties.name_day;
        });
        this.createTimelineDayChart(dataChart, labels, day);
        this.showTimeDay(day);

        for (i = 0; i < size; i++) {
            setDelay(i);
        }

        function setDelay(i) {
            setTimeout(function(){
                people = (dataChart[i]/divideZone)/10;
                pointPolygon = data[i].geometry.coordinates[0];
                $("#timeline").val(i);
                mapb.removeOldAddress(mapBase.map);
                polygon_feature = new Feature({});
                polygon_geom = new Polygon(pointPolygon);
                polygon_feature.setGeometry(polygon_geom);
                polygon_feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                centerPolygon = layer.getCenterOfExtent(polygon_feature.getGeometry());
                layer.createLayerCircle(coord,mapBase.map);  
                const featurePolygonZone = layer.makePolygonFromCentroid(centerPolygon,mapBase.map);
                //layer.randomPointInPoly(featurePolygonZone.getGeometry(),Math.round(people),mapBase.map);
            }, i * 1000);
        }   
    }


    createTimelineDayChart(a,b,c){
        Highcharts.chart('timelineChart', {
                title: {
                        text: c                
                },
                legend: {
                        enabled: false
                }, 
                plotOptions: {
                        column: {
                                pointPadding: 0.1,
                                borderWidth: 0,
                                color: '#12646f',
                                pointWidth: 25,
                                //pointWidth: 3
                        }
                },
                xAxis: {
                        categories: b
                },
                yAxis: {
                    title: {
                        enabled: true,
                        text: '<b># People</b>',
                        style: {
                            fontWeight: '400',
                            color: '#fbfbfb'
                        }
                    }
                },
                credits: {
                        enabled: false
                },
                labels: {
                        items: [{
                        //html: 'Total # people',
                                style: {
                                        left: '50px',
                                        top: '18px',
                                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'                                        
                                }
                        }]
                },
                series: [
                        {
                                type: 'column',
                                name: '0',
                                data: a,
                                animation: {
                                    duration: 26000
                                }
                        }
                        // ,                  
                        // {
                        //         type: 'spline',
                        //         name: 'hour # people',
                        //         data: a,
                        //         color: '#4572A7',
                        //         animation: {
                        //             duration: 26000
                        //         },
                        //         marker: {
                        //                 lineWidth: 2,
                        //                 lineColor: Highcharts.getOptions().colors[2],
                        //                 fillColor: 'white'
                        //                 }
                        // }
                        ]
                });
        }

    runTimelineWeek(data1, data2, data3, mapBase, coord){ 
        $("#timeline").val(0);
        $('#timeline').attr('min', 0);
        $('#timeline').attr('max', 6);
        const chartCanvas = `<div id="timelineChart2"></div>`;
        $( "#timelineChart" ).remove();
        $('.summary2').html(chartCanvas);
        const layer = new LayerBBB();
        const mapb = new MapBBB();
        let pointPolygon = {};
        let polygon_feature = {};
        let polygon_geom = {};
        let centerPolygon = {};
        let i = 0;
        let people = [];
        let area = data3.features[0].properties.area;
        let divideZone = 0;
        let serie0 = [];
        let serie1 = [];
        let serie2 = [];
        let serie3 = [];
        let serie4 = [];
        let serie5 = [];
        let serie6 = [];
        let serie7 = [];
        let serie8 = [];
        let serie9 = [];
        let serie10 = [];
        let serie11 = [];
        let serie12 = [];
        let serie13 = [];
        let serie14 = [];
        let serie15 = [];
        let serie16 = [];
        let serie17 = [];
        let serie18 = [];
        let serie19 = [];
        let serie20 = [];
        let serie21 = [];
        let serie22 = [];
        let serie23 = [];
        let serieLine = [];
        if(area == 1){
            divideZone = 4;
        }else if(area == 2){
            divideZone = 16;
        }
        else if(area == 4){
            divideZone = 64;
        }
        else if(area == 8){
            divideZone = 256;
        }else if(area == 0.25){
            divideZone = 1;
        }
        
        const dataBar = data1.features;
        const dataLine = data2.features;
                dataBar.map(d => {
                    
                    const hours = d.properties.hours_act;
                    const dataChart = d.properties.people;

                    if(hours == 0){
                            serie0.push(dataChart);
                    }else if(hours == 1){
                            serie1.push(dataChart);
                    }else if(hours == 2){
                            serie2.push(dataChart);
                    }else if(hours == 3){
                            serie3.push(dataChart);
                    }else if(hours == 4){
                            serie4.push(dataChart);
                    }else if(hours == 5){
                            serie5.push(dataChart);
                    }else if(hours == 6){
                            serie6.push(dataChart);
                    }else if(hours == 7){
                            serie7.push(dataChart);
                    }else if(hours == 8){
                            serie8.push(dataChart);			
                    }else if(hours == 9){
                            serie9.push(dataChart);
                    }else if(hours == 10){
                            serie10.push(dataChart);
                    }else if(hours == 11){
                            serie11.push(dataChart);
                    }else if(hours == 12){
                            serie12.push(dataChart);
                    }else if(hours == 13){
                            serie13.push(dataChart);			
                    }else if(hours == 14){
                            serie14.push(dataChart);
                    }else if(hours == 15){
                            serie15.push(dataChart);
                    }else if(hours == 16){
                            serie16.push(dataChart);
                    }else if(hours == 17){
                            serie17.push(dataChart);
                    }else if(hours == 18){
                            serie18.push(dataChart);
                    }else if(hours == 19){
                            serie19.push(dataChart);
                    }else if(hours == 20){
                            serie20.push(dataChart);
                    }else if(hours == 21){
                            serie21.push(dataChart);
                    }else if(hours == 22){
                            serie22.push(dataChart);
                    }else if(hours == 23){
                            serie23.push(dataChart);
                    }
            }); 
            
        dataLine.map(d => {
                serieLine.push(d.properties.people);
        });
        this.createTimelineWeekChart(serie0,serie1,serie2,serie3,serie4,serie5,serie6,serie7,serie8,serie9,serie10,serie11,serie12,serie13,serie14,serie15,serie16,serie17,serie18,serie19,serie20,serie21,serie22,serie23,serieLine);
        this.showTimeWeek();
        const size = Object.keys(data3.features).length;

        for (i = 0; i < size; i++) {
            setDelay(i);
        }
           
        function setDelay(i) {
            setTimeout(function(){
                people = (data3.features[i].properties.people/divideZone)/10;
                pointPolygon = data3.features[i].geometry.coordinates[0];
                $("#timeline").val(i);                
                mapb.removeOldAddress(mapBase.map);
                polygon_feature = new Feature({});
                polygon_geom = new Polygon(pointPolygon);
                polygon_feature.setGeometry(polygon_geom);
                polygon_feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
                centerPolygon = layer.getCenterOfExtent(polygon_feature.getGeometry());
                layer.createLayerCircle(coord,mapBase.map);
                const featurePolygonZone = layer.makePolygonFromCentroid(centerPolygon,mapBase.map);
                //layer.randomPointInPoly(featurePolygonZone.getGeometry(),Math.round(people),mapBase.map);
            }, i * 1000);
        }   
    }
    
    
    createTimelineWeekChart(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,serieLine){
        Highcharts.chart('timelineChart2', {
            title: {
                text: ''
            },
            legend: {
                enabled: false
            }, 
            plotOptions: {
                column: {
                        pointPadding: 0.1,
                        borderWidth: 1,
                        color: '#12646f',
                        pointWidth: 3,
                        animation: {
                            duration: 7000
                        }
                //pointWidth: 3
                }
            },
            xAxis: {
                
                categories: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                labels: {
                        style: {
                            width: '100px',
                            'min-width': '0px'
                        },
                        useHTML : true
                    }
            },
            yAxis: {
                title: {
                    enabled: true,
                    text: '<b># People</b>',
                    style: {
                        fontWeight: '400',
                        color: '#fbfbfb'
                    }
                }
            },
            credits: {
                enabled: false
            },
            labels: {
                items: [{
                    //html: 'Total # people',
                    style: {
                        left: '50px',
                        top: '18px',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                    }
                }]
            },
            series: [
                {
                    type: 'column',
                    name: '0',
                    data: a
                },{
                    type: 'column',
                    name: '1',
                    data: b
                },{
                    type: 'column',
                    name: '2',
                    data: c
                },{
                    type: 'column',
                    name: '3',
                    data: d
                },{
                    type: 'column',
                    name: '4',
                    data: e
                },{
                    type: 'column',
                    name: '5',
                    data: f
                },{
                    type: 'column',
                    name: '6',
                    data: g
                },{
                    type: 'column',
                    name: '7',
                    data: h
                },{
                    type: 'column',
                    name: '8',
                    data: i
                },{
                    type: 'column',
                    name: '9',
                    data: j
                },{
                    type: 'column',
                    name: '10',
                    data: k
                },{
                    type: 'column',
                    name: '11',
                    data: l
                },{
                    type: 'column',
                    name: '12',
                    data: m
                },{
                    type: 'column',
                    name: '13',
                    data: n
                },{
                    type: 'column',
                    name: '14',
                    data: o
                },{
                    type: 'column',
                    name: '15',
                    data: p
                },{
                    type: 'column',
                    name: '16',
                    data: q
                },{
                    type: 'column',
                    name: '17',
                    data: r
                },{
                    type: 'column',
                    name: '18',
                    data: s
                },{
                    type: 'column',
                    name: '19',
                    data: t
                },{
                    type: 'column',
                    name: '20',
                    data: u
                },{
                    type: 'column',
                    name: '21',
                    data: v
                },{
                    type: 'column',
                    name: '22',
                    data: w
                },{
                    type: 'column',
                    name: '23',
                    data: x
                }
                // ,                 
                // {
                //     type: 'spline',
                //     name: 'Max # people',
                //     data: serieLine,
                //     color: '#4572A7',
                //     marker: {
                //         lineWidth: 2,
                //         lineColor: Highcharts.getOptions().colors[2],
                //         fillColor: 'white'
                //     },
                //     animation: {
                //         duration: 7000
                //     }
                // }
            ]
        });
    }


    tableQueries(coordParam, dayParam){
        const service = new ServiceQuery();
        const day = dayParam;
        const longAddress = coordParam[0];
        const latAddress = coordParam[1];
        const POINT_ADDRESS = 'POINT(' + longAddress + ' ' + latAddress + ')';
        let params = {};
        let viewparams = {};
        let len = 0;
        let i = 0;
        
        if(day == 0){  
            $('#table_1_2').css('display', 'none');
            $('#table_7_8').css('display', 'none');
            $('#table_3_4').css('display', 'table');
            $('#table_5_6').css('display', 'none');
            $('#table_9_10').css('display', 'none');
            $('#table_11_12').css('display', 'none');
            params = 'COORD:' + POINT_ADDRESS;
            const query3_4 = QUERY_3_4+params;

            service.get(query3_4, function(status, response){
                let zone_num = [];
                let name_day = [];
                let people = [];
                
                if(status == 200){
                    len = response.features.length;
                    for(i = 0; i < len; i++){
                        zone_num.push(response.features[i].properties.id);
                        name_day.push(response.features[i].properties.name_day);
                        people.push(response.features[i].properties.people);
                    } 
                    
                    let rowTable = [];
                    len = response.features.length;
                    for(i = 0; i < len; i++){
                        rowTable.push(`<tr><td id="icon_table">${i==0 ? '<i class="fas fa-arrow-up"></i> <i class="fas fa-users"></i>' : '<i class="fas fa-arrow-down"></i> <i class="fas fa-users"></i>'}</td><td>${name_day[i]}</td><td>${people[i]}</td></tr>`);
                    }

                    const tableTop = `</tbody>
                    <thead>
                     <tr>
                        <th scope="col"></th>
                        <th scope="col">Day</th>
                        <th scope="col">People</th>
                     </tr>
                   </thead>
                   <tbody>`;

                   const tableBottom = `</tbody>`;
                   rowTable.unshift(tableTop);
                   rowTable.push(tableBottom);
                    $('#table_3_4').html(rowTable);  
                }
            });

        }else if(day > 0){
            $('#table_1_2').css('display', 'table');
            $('#table_7_8').css('display', 'none');
            $('#table_3_4').css('display', 'none');
            $('#table_5_6').css('display', 'none');
            $('#table_9_10').css('display', 'none');
            $('#table_11_12').css('display', 'none');  
            viewparams = ['COORD:' + POINT_ADDRESS, 'DAY:' + day];
            params = viewparams.join(';');
            const query1_2 = QUERY_1_2+params;

            service.get(query1_2, function(status, response){
                let zone_num = [];
                let name_day = [];
                let hours_act = [];
                let people = [];
                if(status == 200){
                    len = response.features.length;
                    for(i = 0; i < len; i++){
                        zone_num.push(response.features[i].properties.id);
                        name_day.push(response.features[i].properties.name_day);
                        hours_act.push(response.features[i].properties.hours_act);
                        people.push(response.features[i].properties.count_act);
                    } 
                    
                    let rowTable = [];
                    len = response.features.length;
                    for(i = 0; i < len; i++){
                        rowTable.push(`<tr><td id="icon_table">${i==0 ? '<i class="fas fa-arrow-up"></i> <i class="fas fa-users"></i>' : '<i class="fas fa-arrow-down"></i> <i class="fas fa-users"></i>'}</td><td>${name_day[i]}</td><td>${hours_act[i]}</td><td>${people[i]}</td></tr>`);
                    }
                    const tableTop = `</tbody>
                    <thead>
                     <tr>                       
                        <th scope="col"></th>
                        <th scope="col">Day</th>
                        <th scope="col">Hour</th>
                        <th scope="col">People</th>
                     </tr>
                   </thead>
                   <tbody>`;

                   const tableBottom = `</tbody>`;
                   rowTable.unshift(tableTop);
                   rowTable.push(tableBottom);
                    $('#table_1_2').html(rowTable);  
                }
            });
        }

    }
    

    topQueries(day){
        const service = new ServiceQuery();
        let chart = new ChartBBB();
        let i = 0;
        const contChart3 = $('#topMaxPeo');
        const contChart4 = $('#topMinPeo');
        const title3 = 'Top Max People by Zone';
        const title4 = 'Top Min People by Zone';
        
        if(day == 0){
            service.get(QUERY17, function(status, response){
                let zone_num3 = [];
                let people = [];
                let len3 = 0;
                if(status == 200){
                    len3 = response.features.length;
                    for(i = 0; i < len3; i++){
                        zone_num3.push(response.features[i].properties.id);
                        people.push(response.features[i].properties.people);
                    }      
                    chart.createChart(zone_num3, people, contChart3[0].id, title3, 'bar');
                }
            });

            service.get(QUERY18, function(status, response){
                let zone_num4 = [];
                let people2 = [];
                let len4 = 0;
                if(status == 200){
                    len4 = response.features.length;
                    for(i = 0; i < len4; i++){
                        zone_num4.push(response.features[i].properties.id);
                        people2.push(response.features[i].properties.people);
                    }                
                    chart.createChart(zone_num4, people2, contChart4[0].id, title4, 'bar');
                }
            });
        }else if(day > 0){
            service.get(QUERY17_2+'DAY:'+day, function(status, response){
                let zone_num3 = [];
                let people = [];
                let len3 = 0;
                if(status == 200){
                    len3 = response.features.length;
                    for(i = 0; i < len3; i++){
                        zone_num3.push(response.features[i].properties.id);
                        people.push(response.features[i].properties.people);
                    }      
                    chart.createChart(zone_num3, people, contChart3[0].id, title3, 'bar');
                }
            });

            service.get(QUERY18_2+'DAY:'+day, function(status, response){
                let zone_num4 = [];
                let people2 = [];
                let len4 = 0;
                if(status == 200){
                    len4 = response.features.length;
                    for(i = 0; i < len4; i++){
                        zone_num4.push(response.features[i].properties.id);
                        people2.push(response.features[i].properties.people);
                    }                
                    chart.createChart(zone_num4, people2, contChart4[0].id, title4, 'bar');
                }
            });

        }
    } 

    
    showTimeDay(name_day){
        const chartCont = `<div id="clockDay" class="clock"></div>`;
        $( "#clockWeek" ).remove();
        $('#clocks').html(chartCont); 
        const day = name_day;
        let h = 0;
        let m = 0;
        let i = 0;
        let time = '';
          
        for(i=0; i < 1440; i++){
            setDelay(i);
        }
            
        function setDelay(i) {
            setTimeout(function(){      
                m++;
                if(m == 60){
                    m = 0;
                    h++;
                    if(h == 24){
                        h=0;
                    }
                }
            
            if(h < 10){
                h = h.toString();
                h = h.substr(h.length - 1);
                h = '0'+h;
            }
    
            if(h == '00' && m == 0){
                h = '23';
                //m = '0'+m;    
                m = '59';
            }
    
            time = day + ' '+ h + ":" + m;
            document.getElementById("clockDay").innerText = time;
            document.getElementById("clockDay").textContent = time;
            }, i * 16);
        }        
    }

    showTimeWeek(){
        const chartCont = `<div id="clockWeek" class="clock clockweek"></div>`;
        $( "#clockDay" ).remove();
        $('#clocks').html(chartCont); 
        const week = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        let time = '';
        let i = 0;
          
        for(i=0; i < 7; i++){
            setDelay(i);
        }
            
        function setDelay(i) {
            setTimeout(function(){          
            time = week[i];
            document.getElementById("clockWeek").innerText = time;
            document.getElementById("clockWeek").textContent = time;
            }, i * 1000);
        } 
    }
}