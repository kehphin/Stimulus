
/*
  Author: Tony J Huang
  Group: Team Stimulus
  Created At: 2/18/15

  This is the stats module, affectionately and globally referred 
  to as Stats. This module provides the solutions to all of your 
  statistical needs, including standard deviations, means, medians, 
  modes, and much much more (coming soon [tm])!

  Check the README file for complete documentation on public methods.

  DEPENDENCIES: 
    - underscore.js
    - validate.js
    - picture.js

  Note: Unless otherwise noted, all code henceforth in this file
      has been authored by me, Tony J Huang. 

  Note: Cleared by $wapnil, using TWO space tabs as opposed to 3.
*/

/*
  Global export for Stats variable. 

  Sample usages include: 
    Stats.split(...);
    Stats.stDev(...);
*/
var Stats = (function() {
  var my = {};


  // Given a object, checks if it has a value at fieldName.
  // Otherwise throws an error.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  function ensure(params, fieldName) {
    if(params[fieldName]) {
      return params[fieldName];
    } else {
     throw new Error("missing param field: " + fieldName);
    }
  }

  // Validates the input as a properly formatted Picture.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  function validatePicture(object) {
    if(object instanceof Picture) {
      ensure(object, "rating");
      ensure(object, "filePath");
    } else {
      throw new Error("Picture is not properly formatted: " + object);
    }
  }

  // Validates the input as a properly formatted Array of Pictures.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //  3/2/15 - Updated to use validatePicture helper function.
  function validatePictures(objects) {
    if(!_.isArray(objects)) {
      throw new Error(
        "Pictures argument is not an Array of Picture");
    } else {
      _.each(objects, validatePicture);
    }
  }


  // Validates the other user defined input params ansd makes sure
  // they make sense/are possible.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  function validateNumArgs(numGroups, numPictures, pictures) {
    var size = _.size(pictures);        
    if(numGroups * numPictures > size) {
        throw new Error("Can't split " + size + " total pictures into " 
            + numGroups + " groups of " + numPictures);
    }
  }


  // Chunks an array into equal sizes of chunkSize, notwithstanding 
  // the very last chunk, which is anywhere from size 1 to chunkSize
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  Array.prototype.chunk = function(chunkSize) {
    var R = [];
    for (var i = 0; i < this.length; i += chunkSize) {
        R.push(this.slice(i, i + chunkSize));
    }   
    return R;
  }


  // Sorts pictures by their rating distance from targetRating.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  function sortPicturesByRating(targetRating, pictures) {
    return _.sortBy(pictures, function(p) {
      Math.abs(p.rating - targetRating);
    });
  }


  
  // Round Robin.
  // ALGORITHM: Picks the picture with the closest rating to the target
  //     and assigns it to group 1, then group 2, then group 3, ...,
  //     until all groups are full.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  
  function splitRR(numGroups, numPictures, targetRating, pictures) {
    var sortedPictures = sortPicturesByRating(targetRating, pictures);
    var candidates = _.first(sortedPictures, numGroups * numPictures);
    var i = 0;
    return _.values(_.groupBy(candidates), function(p) {
      i++ % numGroups;
    });
  }

  
  // Random.
  // ALGORITHM: Pretty much what it sounds like.
  //     Will return pictures at random. Useful for... ???
  //
  // Creation date: 3/1/15
  // Modifications list:
  
  function splitRA(numGroups, numPictures, targetRating, pictures) {
    return _.first(_.shuffle(pictures), numGroups * numPictures)
      .chunk(numPictures);
  }


  // Greedy.
  // ALGORITHM: Distributes the pictures by assigning the ones
  //     with ratings closest to the target to the groups in order.
  //
  // Creation date: 3/1/15
  // Modifications list:
  function splitGR(numGroups, numPictures, targetRating, pictures) {
    var sortedPictures = sortPicturesByRating(targetRating, pictures);
    var chunkedPictures = sortedPictures.chunk(numPictures);
    return _.first(chunkedPictures, numGroups);
  }

  // Dynamic Programming.
  // ALGORITHM: Go through every possible combination of pictures,
  //     caching the results when possible, and pick the combination
  //     with the smallest total distance from the target rating.
  //
  // Creation date: 3/1/15
  // Modifications list:
  function splitDP(numGroups, numPictures, targetRating, pictures) {
    return []; // TODO.
  }


  /*
    The main entree. Splits a set of pictures up into numGroups 
    distinct groups of numPictures entries, in which the pictures'
    average ratings' distance form targetRating is minimized.


    params object should contain:
        numGroups:    number of different groups you want to 
                      split the pictures into

        numPictures:  number of pictures you want in each group

        targetRating: the numerical value you want the groups 
                      to average to, ideally

        pictures:     array of Pictures that we'll be splitting 
                      into groups

    params object OPTIONAL fields:
        splitFunc:    the algorithm you want to use in this split
                      ONEOF: "gr" [greedy]
                             "rr" [round robin]
                             "ra" [random]
                             "dp" [dynamic programming]
                      defaults to greedy.
  */
  //
  // Creation date: 3/1/15
  // Modifications list:
  my.split = function(params) {
    // Validate input.
    var numGroups    = ensure(params, "numGroups");
    var numPictures  = ensure(params, "numPictures");
    var targetRating = ensure(params, "targetRating");
    var pictures     = ensure(params, "pictures");

    validatePictures(pictures);
    validateNumArgs(numGroups, numPictures, pictures);

    // Return value.
    var r;

    // Pick an algorithm, any algorithm.
    switch(params["splitFunc"] || "gr") {
      case "rr":
        r = splitRR(numGroups, numPictures, targetRating, pictures);
        break;
      case "ra":
        r = splitRA(numGroups, numPictures, targetRating, pictures);
        break;
      case "gr":
        r = splitGR(numGroups, numPictures, targetRating, pictures);
        break;
      case "dp":
        r = splitDP(numGroups, numPictures, targetRating, pictures);
        break;
      default:
        r = splitGR(numGroups, numPictures, targetRating, pictures);
    }

    return r;
  }


  /* Statistics methods */

  // Internal helper function to get an average value from a list of numbers.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  var _avg = function(values) {
    var sum = _.reduce(values, function(s, v){return s + v}, 0);
    return sum / values.length;
  }

  // Returns the average rating from a list of pictures. Returns
  // 0 given an empty Array.
  //
  // Throws an error if not called with an Array of Pictures.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.meanRating = function(pictures) {
    Validate.validatePictures(pictures);
    if(pictures.length === 0) {
      return 0;
    } else {
      return _avg(_.pluck(pictures, "rating"));
    }
  }

  // Returns the median rating given a list of Pictures
  //
  // Throws an error if not called with a non-empty Array of Pictures.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.medianRating = function(pictures) {
    Validate.validatePictures(pictures);
    if(pictures.length === 0) {
      throw new Error("Called with an empty Array.");
    } else {
      var sorted = _.sortBy(pictures, "rating");
      if(sorted.length % 2 == 0) {
        // Even number of entries, find middle two entries and average.
        var half = sorted.length / 2;
        return _avg([sorted[half-1]['rating'], sorted[half]['rating']]);
      } else {
        return sorted[Math.floor((sorted.length - 1) / 2)]['rating'];
      }
    }
  }

  // Get the most common rating in a list of Pictures. 
  // Returns
  // 0 given an empty Array.
  //
  // Throws an error if not called with an Array of Pictures.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.modeRating = function(pictures) {
    Validate.validatePictures(pictures);
    var modeMap = {};
    var mode = 0;
    var modeCount = 0;
    _.each(pictures, function(p) {
      var r = p.rating;
      
      if(modeMap[r] === undefined) {
        modeMap[r] = 0;
      }   
      
      modeMap[r]++;
      if(modeMap[r] > modeCount) {
        mode = r;
        modeCount = modeMap[r];
      }
    });
    return mode;
  }


  // Get the (population) standard deviation of a list of Pictures.
  // Returns 0 given an empty Array.
  // 
  // See https://www.mathsisfun.com/data/standard-deviation-formulas.html
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.stdevRating = function(pictures){
    Validate.validatePictures(pictures);
    if(pictures.length === 0) {
      return 0;
    } else {
      // Get average rating of the list of Pictures.
      var avgRating = meanRating(pictures);

      // Get the square of the differences between 
      // each rating and the average rating
      var sqrDiffs = _.map(pictures, function(p) {
        return Math.pow(p.rating - avgRating, 2);
      });

      // Stdev = Square root the average of the squared diffs.
      return Math.sqrt(avg(sqrDiffs));
    }
  }

  return my;
}());





