// Creates mock data to make initial fusion chart
// num_pics is an int : number of pictures
// data_range is a array of size 2 : [min, max]
function createMockChartData(num_pics, data_range) {

  // Returns a random number between min (inclusive) and max (exclusive)
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

  // a sorted list of random ratings within data_range and of length num_pics
  var pics_data = [];

  for(var i = 0; i < num_pics; i++) {
    pics_data.push(getRandomArbitrary(data_range[0], data_range[1]));
  }

  pics_data = _.sortBy(pics_data, function(num) {
      return num;
  });
  
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