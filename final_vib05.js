var rawchart;
var rmschart;
var vecchart;
var alpha = 0.44314;
var xLowpass = 0;
var yLowpass = 0;
var zLowpass = 0;

// MQTT client
var mqttClient= null;

//MQTT info
// 각자 상황에 맞는 host, port, topic 을 사용합니다.
var mqtt_host = "192.168.0.19";
var mqtt_port = "9001";
var xmqtt_clientId = "clientID-" + parseInt(Math.random() * 100);
var ymqtt_clientId = "clientID-" + parseInt(Math.random() * 100);
var zmqtt_clientId = "clientID-" + parseInt(Math.random() * 100);
var vmqtt_clientId = "clientID-" + parseInt(Math.random() * 100);// 랜덤 클라이언트 ID


// MQTT 클라이언트 연결
function fncStartxMqtt()
{
    xmqttClient = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), xmqtt_clientId);

    xmqttClient.onConnectionLost = xonConnectionLost;
    xmqttClient.onMessageArrived = xonMessageArrived;

    xmqttClient.connect({
        onSuccess : xonConnect
        , onFailure : xonFailure
    });
}
function fncStartyMqtt()
{
    ymqttClient = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), ymqtt_clientId);

    ymqttClient.onConnectionLost = yonConnectionLost;
    ymqttClient.onMessageArrived = yonMessageArrived;

    ymqttClient.connect({
        onSuccess : yonConnect
        , onFailure : yonFailure
    });
}
function fncStartzMqtt()
{
    zmqttClient = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), zmqtt_clientId);

    zmqttClient.onConnectionLost = zonConnectionLost;
    zmqttClient.onMessageArrived = zonMessageArrived;

    zmqttClient.connect({
        onSuccess : zonConnect
        , onFailure : zonFailure
    });
}
function fncStartvMqtt()
{
    vmqttClient = new Paho.MQTT.Client(mqtt_host, Number(mqtt_port), vmqtt_clientId);

    vmqttClient.onConnectionLost = vonConnectionLost;
    vmqttClient.onMessageArrived = vonMessageArrived;

    vmqttClient.connect({
        onSuccess : vonConnect
        , onFailure : vonFailure
    });
}
function xonConnect()
{
    console.log("connect : X onConnect..");

    xmqttClient.subscribe("xRMS");
}
function yonConnect()
{
    console.log("connect : Y onConnect..");

    ymqttClient.subscribe("yRMS");
}
function zonConnect()
{
    console.log("connect : Z onConnect..");

    zmqttClient.subscribe("zRMS");
}
function vonConnect()
{
    console.log("connect : V onConnect..");

    vmqttClient.subscribe("vSum");
}
// 연결 실패 시 실행되는 function
function xonFailure()
{
    console.log("connect : X onFailure..");


}
function yonFailure()
{
    console.log("connect : Y onFailure..");


}
function zonFailure()
{
    console.log("connect : Z onFailure..");


}
function vonFailure()
{
    console.log("connect : Vector onFailure..");


}


function xonConnectionLost(responseObject)
{
    if (responseObject.errorCode !== 0)
    {
        console.log("onConnectionLost : " + responseObject.errorMessage);

        // 연결 재시도
        fncStartxMqtt();
    }
}
function yonConnectionLost(responseObject)
{
    if (responseObject.errorCode !== 0)
    {
        console.log("onConnectionLost : " + responseObject.errorMessage);

        // 연결 재시도
        fncStartyMqtt();
    }
}
function zonConnectionLost(responseObject)
{
    if (responseObject.errorCode !== 0)
    {
        console.log("onConnectionLost : " + responseObject.errorMessage);

        // 연결 재시도
        fncStartzMqtt();
    }
}
function vonConnectionLost(responseObject)
{
    if (responseObject.errorCode !== 0)
    {
        console.log("onConnectionLost : " + responseObject.errorMessage);

        // 연결 재시도
        fncStartvMqtt();
    }
}
function xonMessageArrived(message)
{
    console.log(message.payloadString);
	var x_series = rmschart.series[0],
        shift = x_series.data.length > 100;
    let time = new Date();
    let point = {x: time.getTime(), y: Number(message.payloadString), marker: {enabled : false}};
    rmschart.series[0].addPoint(point, false, shift);
}
function yonMessageArrived(message)
{
    console.log(message.payloadString);
	var y_series = rmschart.series[1],
        shift = y_series.data.length > 100;
    let time = new Date();
    let point = {x: time.getTime(), y: Number(message.payloadString), marker: {enabled : false}};
    rmschart.series[1].addPoint(point, true, shift);
}

function zonMessageArrived(message)
{
    console.log(message.payloadString);
	var z_series = rmschart.series[2],
        shift = z_series.data.length > 100;
    let time = new Date();
    let point = {x: time.getTime(), y: Number(message.payloadString), marker: {enabled : false}};
    rmschart.series[2].addPoint(point, true, shift);
}
function vonMessageArrived(message)
{
    console.log(message.payloadString);
    let vect = message.payloadString;
    vecchart.series[0].setData(vect);
}


/**
 * Request data from the server, add it to the graph and set a timeout
 * to request again
 */
function requestRawData() {
    $.ajax({
        url: '/x-data',
        success: function(point) {
            var x_series = rawchart.series[0],
                shift = x_series.data.length > 200; // shift if the series is
                                                 // longer than 20
            var xval = point.pop();
            var xtime = point.pop();
            xLowpass = alpha * xLowpass + (1-alpha) * xval;
            var xpoint = (xval - xLowpass)*2;
            let oint = {x : xtime, y : xpoint, marker: {enabled : false}};
            // add the point
            rawchart.series[0].addPoint(oint, false, shift);

            // call it again after one second

        },
        cache: false
    });

    $.ajax({
        url: '/y-data',
        success: function(point) {
            var y_series = rawchart.series[1],
                shift = y_series.data.length > 200; // shift if the series is
                                                 // longer than 20
            var yval = point.pop();
            var ytime = point.pop();
            yLowpass = alpha * yLowpass + (1-alpha) * yval;
            var ypoint = (yval - yLowpass)*2;
            let oint = {x : ytime, y : ypoint, marker: {enabled : false}};
            // add the point
            rawchart.series[1].addPoint(oint, true, shift);

            // call it again after one second

        },
        cache: false
    });
    $.ajax({
        url: '/z-data',
        success: function(point) {
            var z_series = rawchart.series[2],
                shift = z_series.data.length > 200; // shift if the series is
                                                 // longer than 20
            var zval = point.pop();
            var ztime = point.pop();
            zLowpass = alpha * zLowpass + (1-alpha) * zval;
            var zpoint = (zval - zLowpass)*2;
            let oint = {x : ztime, y : zpoint, marker: {enabled : false}};
            // add the point
            rawchart.series[2].addPoint(oint, true, shift);

            // call it again after one second
            setTimeout(requestRawData, 0);
        },
        cache: false
    });
}




$(document).ready(function () {
        fncStartxMqtt()
        fncStartyMqtt()
        fncStartzMqtt()
        fncStartvMqtt()
        rawchart = new Highcharts.Chart('raw', {
            chart: {
                renderTo: 'data-container',
                defaultSeriesType: 'spline',
                events: {
                    load: requestRawData

                }
            },
            title: {
                text: 'Raw Data'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                maxZoom: 20 * 1000
            },
            yAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                title: {
                    text: 'mg',
                    margin: 80
                }
            },
            series: [{
                name: 'X',
                data: [],
                marker: {
                    enabled: false
                }

            }, {
                name: 'Y',
                data: [],
                marker: {
                    enabled: false
                }
            },
                {
                    name: 'Z',
                    data: [],
                    marker: {
                        enabled: false
                    }
                }]
        });
        vecchart = new Highcharts.Chart('vec', {
            chart: {
                renderTo: 'data-container',
                defaultSeriesType: 'spline',

            },
            title: {
                text: 'Raw data Vector Sum'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                maxZoom: 20 * 1000
            },
            yAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                title: {
                    text: 'mg',
                    margin: 80
                }
            },
            tooltip: {
		        crosshairs: true,
		        shared: true,
		        valueSuffix: 'mg'
		    },

		    legend: {
		        enabled: true
		    },
            plotOptions:{
                series:{
                    turboThreshold:5000//larger threshold or set to 0 to disable
                }
            },
            series: [{

                name: 'Vector Sum',
                data: vect,
                marker: {
                    enabled: false
                }

            }]

        });
        rmschart = new Highcharts.Chart('RMS', {
            chart: {
                renderTo: 'container',
                defaultSeriesType: 'spline',

            },
            title: {
                text: 'RMS'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150,
                maxZoom: 20 * 1000
            },
            yAxis: {
                minPadding: 0.2,
                maxPadding: 0.2,
                title: {
                    text: 'mg',
                    margin: 80
                }
            },
            series: [{
                name: 'X',
                data: [],
                marker: {
                    enabled: false
                }

            }, {
                name: 'Y',
                data: [],
                marker: {
                    enabled: false
                }
            },
                {
                    name: 'Z',
                    data: [],
                    marker: {
                        enabled: false
                    }
                }]
        });

    });