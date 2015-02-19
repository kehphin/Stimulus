var _ = require('underscore')


var Picture = function(name, rating, filePath) {
	this.name = name;
	this.rating = rating;
	this.filePath = filePath;
}

Picture.prototype.toString = function() {
  console.log("Hello, " + this.name + ", " + this.rating + ", " + this.filePath);
};


/**
 * Takes a list of objects, returns true if they are all of the 'picture' type.
 */
function checkIfPictures(objects) {
	return _.every(objects, o => o instanceof Picture);
}


/**
 * numGroups: number of different groups you want to split the pictures into
 * numPictures: number of pictures you want in each group
 * targetRating: the numerical value you want the groups to average to, ideally
 * pictures: array of Pictures that we'll be splitting into groups
 */
function sSplit(numGroups, numPictures, targetRating, pictures) {
	if(!_.isArray(pictures)) {
		throwInvalidInput("Received something other than an array for pictures argument.");
	}		
	if(!checkIfPictures(pictures)) {
		throwInvalidInput("Pictures arguments are not properly formatted.");
	}
	var size = _.size(pictures);		
	if(numGroups * numPictures > size){
		throwInvalidInput("Can't split " + size + " total pictures into " 
			+ numGroups + "groups of " + numPictures);
	}
  
  return sSplitRR(numGroups, numPictures, targetRating, pictures);
}

/**
 * Does NOT sort the pictures from lowest to highest rating. Actually sorts the numbers
 * based on their rating distance from the targetRating.
 */
function sortPicturesByRating(targetRating, pictures) {
	return _.sortBy(pictures, pic => Math.abs(pic.rating - targetRating))
}

/**
 * Chunks an array into equal sizes of chunkSize, notwithstanding the very last chunk, which
 * is anywhere from size 1 to chunkSize
 */
function chunk(array, chunkSize) {
  var R = [];
    for (var i=0; i<array.length; i+=chunkSize)
        R.push(array.slice(i,i+chunkSize));
    return R;
}

/**
 * Split pictures by choosing the best pictures for the first group, then the second,
 * then the third...
 */
function sSplitGreedy(numGroups, numPictures, targetRating, pictures) {
    var sortedPictures = sortPicturesByRating(targetRating, pictures);
  	var chunkedPictures = chunk(sortedPictures, numPictures);
  	return _.first(chunkedPictures, numGroups);
}

function sSplitRR(numGroups, numPictures, targetRating, pictures) {
    var sortedPictures = sortPicturesByRating(targetRating, pictures);
    var i = 0;
    return _.values(_.groupBy(_.first(sortedPictures, numGroups * numPictures), 
                              p => i++ % numGroups));
}

function sSplitRandom(numGroups, numPictures, targetRating, pictures) {
    return chunk(_.first(_.shuffle(pictures), numGroups * numPictures), 
                 numPictures);
}

/**
 * Returns an array of size numElements with integers random 
 * distributed from 1 to upperBound, inclusive.
 */
function getRandomIntArray(numElements, upperBound) {
	var pool = _.range(upperBound);
	return _.map(_.range(numElements), n => _.sample(pool) + 1);
}

function sSplitHelper(numGroups, numPictures, targetRating, pictures, sSplitFunc) {
  if(!_.isArray(pictures)) {
		throwInvalidInput("Received something other than an array for pictures argument.");
	}		
	if(!checkIfPictures(pictures)) {
		throwInvalidInput("Pictures arguments are not properly formatted.");
	}
	var size = _.size(pictures);		
	if(numGroups * numPictures > size){
		throwInvalidInput("Can't split " + size + " total pictures into " 
			+ numGroups + "groups of " + numPictures);
	}
  
  return sSplitFunc(numGroups, numPictures, targetRating, pictures);
}

function avg(nums) {
  return _.reduce(nums, (m, n) => m + n, 0) / _.size(nums);
}

function printStats(sorted, targetRating) {
  var i = 0;
  var dist = 0;
  _.each(sorted, grouping => {
    var cavg = avg(_.pluck(grouping, 'rating'));
    console.log('###group ' + i++ + '###');
    console.log('avg: ' + cavg);
    console.log('ratings: ' + _.pluck(grouping, 'rating'));
    dist += Math.abs(targetRating - cavg);
  });
  console.log('total distance from targetRating: ' + dist);
}


/**
 * numGroups: number of groups you want to split the dataset into
 * numPictures: number of pictures you want in each group
 * targetRating: ideal average of each group of pictures
 * dataSetSize: how many randomly generated 'pictures' you want to pull from
 * ratingUpperBound: defines range of ratings, from 1 to ratingUpperBound.
 */
function testSSplit(numGroups, 
                     numPictures, 
                     targetRating, 
                     dataSetSize, 
                     ratingUpperBound) {

  var pictures = _.map(getRandomIntArray(dataSetSize, ratingUpperBound), r => new Picture("name", r, "filePath"));

  console.log("sorting by greedy");
  console.time('time taken (greedy)');
  var sorted1 = sSplitHelper(numGroups, numPictures, targetRating, pictures, sSplitGreedy);
  console.timeEnd('time taken (greedy)');
  printStats(sorted1, targetRating);

  console.log();

  console.log("sorting by round robin");
  console.time('time taken (round robin)');
  var sorted2 = sSplitHelper(numGroups, numPictures, targetRating, pictures, sSplitRR);
  console.timeEnd('time taken (round robin)');
    printStats(sorted2, targetRating);

  console.log();

  console.log("sorting by random");
  console.time('time taken (random)');
  var sorted3 = sSplitHelper(numGroups, numPictures, targetRating, pictures, sSplitRandom);
  console.timeEnd('time taken (random)');
    printStats(sorted3, targetRating);
}


/* update this function with parameters */
testSSplit(4, 10, 5, 100, 10);

      


