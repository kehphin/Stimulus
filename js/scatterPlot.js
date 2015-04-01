/*
Author: Gary Song
Group: Stimulus
Created on: 3/31/2015

Takes in pics_data, a sorted list of ratings (numbers)
and returns a object used to create scatter plot
*/
function createChart(pics_data) {
	var pic_num = 0;
  // converts pics_data into a form fusioncharts use as input
  var mock_data = _.map(pics_data, function(pic_data) {
    pic_num++;
    return [pic_num, pic_data];
  });

  // creates fusioncharts input json
  var chart_data = {
    "chart": {
      "type": "scatter",
      "zoomType": "xy"
    },
    "legend": {
      "enabled": false
    },
    "xAxis": {
      "title": {
        "text": "picture"
      }
    },
    "yAxis": {
      "title": {
        "text": "rating"
      }
    },
    "plotOptions": {
      "scatter": {
        "marker": {
          "radius": 5,
          "states": {
            "hover": {
              "enabled": true,
              "lineColor": "rgb(100,100,100)"
            }
          }
        },
        "states": {
          "hover": {
            "marker": {
              "enabled": false
            }
          }
        },
        "tooltip": {
          "headerFormat": '<b>{series.name}</b><br>',
          "pointFormat": '{point.y}'
        }
      }
    },
    "series": [{
      "name": "Picture",
      "color": "rgba(119, 152, 191, .5)",
      "data": mock_data
    }]
  };
  
  return chart_data;
}