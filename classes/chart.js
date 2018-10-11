var Highcharts = require('highcharts');

export default class ChartBBB{
    constructor(){
    }

    createChart(label, dataSource, contChart, title, type){

        Highcharts.chart(contChart, {
            chart: {
                type: type
            },
            title: {
                text: title
            },
            subtitle: {
                text: ''
            },
            xAxis: {
                className: 'xtopChart',
                categories: label,
                title: {
                    text: null
                }
            },
            yAxis: {
                className: 'ytopChart',
                min: 0,
                title: {
                    text: '# People',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify',
                    color: '#FFFFFF'
                }
            },
            tooltip: {
                valueSuffix: ''
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: false
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 0,
                floating: true,
                borderWidth: 1,
                backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Zones',
                data: dataSource,
                color: '#12646f'
            }]
        });
        
    }
}