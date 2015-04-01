/*
Author: Gary Song
Group: Stimulus
Created on: 1/31/2015

Modified on: 3/31/2015

Creates a mock ratings list of size num_pics,
which has data between 0 to data_ra
*/
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

  return pics_data;
}