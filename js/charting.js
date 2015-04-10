/*
  Author: Gary Song
  Group: Team Stimulus
  Created At: 3/28/15

  The Chart module focuses on producing the scatter plots
  for the Graphs tab using the parsed data

  It is called in main.js

  All code in this file was authored by Gary Song
*/
var Chart = (function() {
  var my = {};

  /*
  Takes in groups

  Plots out each group as a chart
  Each chart is seperated into two charts
  The main chart has the data and is large
  The overview chart has the same data but is smaller and sits on the right on the main chart
  The main chart can be zoomed in
  The overview chart is used for zooming and more importantly, unzooming
  */
  my.plotCharts = function(groups) {

    // keeps track of multiple charts and chart css selectors
    var charts = [];

    // goes through each group of pictures and creates a zooming scatter plot for each one
    for(var g = 0; g < groups.length; g++) {
      
      // makes nessesary divs for each chart
      var overviewClass = "overview" + g;
      var overviewDiv = $("<div></div>");
      overviewDiv.addClass("overview " + overviewClass);
      
      var chartClass = "chart" + g;
      var chartDiv = $("<div></div>");
      chartDiv.addClass("chart " + chartClass);
      
      $(".graphsContainer").append(chartDiv);
      $(".graphsContainer").append(overviewDiv);

      // chart object saved for use after initialization, i.e for zooming
      chart = {};

      chart.overviewSelector = "." + overviewClass;
      chart.chartSelector = "." + chartClass;

      // sorts the given group based on ratings
      function compare(a, b) {
        return a.rating - b.rating;
      }
      var pictures = groups[g].sort(compare);
      
      // parses groups data into flot format
      var data = [];
      for(var i = 0; i < pictures.length; i++) {
        data.push([i, pictures[i].rating]);
      }

      chart.chart_data = [{
        label: "ratings",
        data: data
      }];

      var options = {
        legend: {show: false},
        series: {
          lines: {show: false},
          points: {show: true}
        },
        selection: {mode: "xy"}
      };

      chart.overview = $.plot(chart.overviewSelector, chart.chart_data, options);
      chart.plot = $.plot(chart.chartSelector, chart.chart_data, options);

      charts.push(chart);

      // Does the zooming of the plot
      $(charts[g].chartSelector).bind("plotselected", function (event, ranges) {
        for(var i = 0; i < charts.length; i++) {
          if(charts[i].plot.getPlaceholder()[0] == event.currentTarget) {
            // clamp the zooming to prevent eternal zoom
            if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
              ranges.xaxis.to = ranges.xaxis.from + 0.00001;
            }
            if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
              ranges.yaxis.to = ranges.yaxis.from + 0.00001;
            }
            // do the zooming
            charts[i].plot = $.plot(charts[i].chartSelector, charts[i].chart_data,
              $.extend(true, {}, options, {
                xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
                yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
              })
            );
            // don't fire event on the overview to prevent eternal loop
            charts[i].overview.setSelection(ranges, true);
          }
        }
      });

      // Does the zooming of the overview chart
      $(charts[g].overviewSelector).bind("plotselected", function (event, ranges) {
        for(var i = 0; i < charts.length; i++) {
          if(charts[i].overview.getPlaceholder()[0] == event.currentTarget) {
            charts[i].plot.setSelection(ranges);
          }
        }
      });
    }

  }

  return my;
}());

// Object used to tested in Module in Chrome when console testing is needed
var mock_pictures = [
   [
    {"filePath": "test_data/Slide4.JPG", "rating": 4},
    {"filePath": "test_data/Slide1.JPG", "rating": 1},
    {"filePath": "test_data/Slide10.JPG", "rating": 10},
    {"filePath": "test_data/Slide2.JPG", "rating": 2},
    {"filePath": "test_data/Slide9.JPG", "rating": 9},
  ],
  [
    {"filePath": "test_data/Slide6.JPG", "rating": 6},
    {"filePath": "test_data/Slide7.JPG", "rating": 7},
    {"filePath": "test_data/Slide5.JPG", "rating": 5},
    {"filePath": "test_data/Slide8.JPG", "rating": 8},
    {"filePath": "test_data/Slide3.JPG", "rating": 3},
  ]
];

