var mock_pictures = [
  [
    {filePath: "slide1", rating: 1},
    {filePath: "slide2", rating: 2},
    {filePath: "slide3", rating: 3},
    {filePath: "slide4", rating: 4},
    {filePath: "slide5", rating: 5}
  ],
  [
    {filePath: "slide1", rating: 1},
    {filePath: "slide2", rating: 2},
    {filePath: "slide3", rating: 3},
    {filePath: "slide4", rating: 4},
    {filePath: "slide5", rating: 5}
  ]
];

var Chart = (function(groups) {

  for(var g = 0; g < pictures.length; g++) {
    
    var overviewClass = "overview" + g;
    var overviewDiv = $("<div></div>");
    overviewDiv.addClass(overviewClass);
    
    var chartClass = "chart" + g;
    var chartDiv = $("<div></div>");
    chartDiv.addClass(chartClass);
    
    $("#content").append(chartDiv);
    $("#content").append(overviewDiv);
    
    var pictures = groups[g];
    
    var data = [];
    for(var i = 0; i < pictures.length; i++) {
      data.push([i, pictures[i].rating]);
    }

    var chart_data = {
      label: "ratings",
      data: data
    }

    var options = {
      legend: {show: false},
      series: {
        lines: {show: false},
        points: {show: true}
      },
      selection: {mode: "xy"}
    };

    var overview = $.plot(overviewClass, chart_data, options);

    var plot = $.plot(chartClass, chart_data, options);

    $(chartClass).bind("plotselected", function(event, ranges) {
      // clamp the zooming to prevent eternal zoom
      if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
        ranges.xaxis.to = ranges.xaxis.from + 0.00001;
      }
      if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
        ranges.yaxis.to = ranges.yaxis.from + 0.00001;
      }
      // do the zooming
      plot = $.plot(".chart", getData(ranges.xaxis.from, ranges.xaxis.to),
        $.extend(true, {}, options, {
          xaxis: { min: ranges.xaxis.from, max: ranges.xaxis.to },
          yaxis: { min: ranges.yaxis.from, max: ranges.yaxis.to }
        })
      );
      // don't fire event on the overview to prevent eternal loop
      overview.setSelection(ranges, true);
    });

    $(overviewClass).bind("plotselected", function (event, ranges) {
      plot.setSelection(ranges);
    });
    
  }

}());
