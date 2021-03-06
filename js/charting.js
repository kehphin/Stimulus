/*
  Author: Gary Song & Tony J Husng
  Group: Team Stimulus
  Created At: 3/28/15

  The Chart module focuses on producing the scatter plots
  for the Graphs tab using the parsed data

  It is called in main.js

*/
var Chart = (function() {
  var my = {};

  /*
  Author: Gary Song
  Takes in groups

  Plots out each group as a chart
  Each chart is seperated into two charts
  The main chart has the data and is large
  The overview chart has the same data but is smaller and sits on the right on the main chart
  The main chart can be zoomed in
  The overview chart is used for zooming and more importantly, unzooming
  */
  my.plotCharts = function(groups) {

    $(".graphsContainer").empty();

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

      var buttonClass = "reset" + g;
      var resetButton = $("<button type='button'>Unzoom</button>").addClass("reset-zoom " + buttonClass).data("graphId", g);

      var toggleClass = "toggle" + g;
      var toggleButton = $("<button type='button'>Show/Unshow Images</button>").addClass("toggle " + toggleClass).data("graphId", g);

      var title = $("<h1></h1>").addClass("chart-title").text("Group " + (g + 1));

      var graphContainerDiv = $("<div></div>");
      graphContainerDiv.addClass("graph-container");
      graphContainerDiv.append(title, chartDiv, overviewDiv, resetButton, toggleButton);

      $(".graphsContainer").append(graphContainerDiv);

      // chart object saved for use after initialization, i.e for zooming
      chart = {};

      chart.overviewSelector = "." + overviewClass;
      chart.chartSelector = "." + chartClass;
      chart.buttonSelector = "." + buttonClass;
      chart.toggleSelector = "." + toggleClass;

      // sorts the given group based on ratings
      function compare(a, b) {
        return a.rating1 - b.rating1;
      }
      var pictures = groups[g].sort(compare);

      // parses groups data into flot format
      var data = [];
      var filepaths = [];

      // if rating2 f given, use that for xaxis, else just increment 1 for xaxis
      if(pictures[0].rating2) {
        var min = Number.MAX_VALUE;
        var max = Number.MIN_VALUE;
        for(var i = 0; i < pictures.length; i++) {
          var rating2 = pictures[i].rating2;
          if(rating2 < min) {
            min = rating2;
          }
          if(rating2 > max) {
            max = rating2;
          }
          data.push([pictures[i].rating2, pictures[i].rating1]);
          filepaths.push(pictures[i].filePath);
        }

        // so the points aren't exactly on the edge of the graph horizontally wise
        var margin = (max - min) / 10;
        max += margin;
        min -= margin;
      }
      else {
        var min = -0.5;
        var max =  groups[g].length - 0.5;
        for(var i = 0; i < pictures.length; i++) {
          data.push([i, pictures[i].rating1]);
          filepaths.push(pictures[i].filePath);
        }
      }
      

      chart.dataset = {
        data: data,
        points: { show: true },
        showLabels: false,
        labels: filepaths,
        labelPlacement: "center",
        canvasRender: true
      };

      chart.overviewDataset = {
        data: data,
        points: { show: true }
      };

      // styles the charts
      chart.chartOptions = {
        axisLabels: {show: true},
        legend: {show: false},
        series: {
          lines: {show: false},
          points: {show: false}
        },
        xaxis: {
          min: min,
          max: max,
          axisLabel: label2 || "Picture"
        },
        yaxis: {
          axisLabel: label1 || "Ratings"
        },
        selection: {mode: "xy"}
      };

      // overview charts do not have axes labels
      chart.overviewOptions = {
        legend: {show: false},
        series: {
          lines: {show: false},
          points: {show: true}
        },
        xaxis: {
          min: min,
          max: max,
        },
        selection: {mode: "xy"}
      };

      chart.overview = $.plot(chart.overviewSelector, [chart.overviewDataset], chart.overviewOptions);
      chart.plot = $.plot(chart.chartSelector, [chart.dataset], chart.chartOptions);

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
            charts[i].plot = $.plot(charts[i].chartSelector, [charts[i].dataset],
              $.extend(true, {}, charts[i].chartOptions, {
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

      // binds unzoom image button
      $(charts[g].buttonSelector).click(function(e) {
        // finds which chart wants to be unzoomed
        var chart = charts[$(e.currentTarget).data("graphId")];

        chart.plot = $.plot(chart.chartSelector, [chart.dataset], chart.chartOptions);
        chart.overview = $.plot(chart.overviewSelector, [chart.overviewDataset], chart.overviewOptions);
      });

      // binds the toggle image button
      $(charts[g].toggleSelector).click(function(e) {
        // finds which chart wants to be toggled
        var chart = charts[$(e.currentTarget).data("graphId")];

        chart.dataset.showLabels = !chart.dataset.showLabels;
        chart.plot = $.plot(chart.chartSelector, [chart.dataset],
          $.extend(true, {}, chart.chartOptions, {
            xaxis: chart.plot.getOptions().xaxis,
            yaxis: chart.plot.getOptions().yaxis
          })
        );
      });
    }

  }

  return my;
}());