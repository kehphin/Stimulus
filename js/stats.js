
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
  // public facing object export.
  var my = {};

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
  //   3/15/15 - reverse the list so it's ordered by ascending.
  //
  function _sortPicturesByRating(targetRating, pictures) {
    return _.sortBy(pictures, function(p) {
      return Math.abs(p.rating1 - targetRating);
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
    var sortedPictures = _sortPicturesByRating(targetRating, pictures);
    var candidates = _.first(sortedPictures, numGroups * numPictures);

    var i = 0;
    var grouped = _.groupBy(candidates, function(p) {
      // Group each picture via round robin.
      return i++ % numGroups;
    })

    return _.values(grouped);
  }


  // Random.
  // ALGORITHM: Pretty much what it sounds like.
  //     Will return pictures at random. Useful for... ???
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
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
  //
  function splitGR(numGroups, numPictures, targetRating, pictures) {
    var sortedPictures = _sortPicturesByRating(targetRating, pictures);
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
  //
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
  //  3/2/15 - Use Validate module.
  //
  my.split = function(params) {
    // Validate input.
    var numGroups    = Validate.ensure(params, "numGroups");
    var numPictures  = Validate.ensure(params, "numPictures");
    var targetRating = Validate.ensure(params, "targetRating");
    var pictures     = Validate.ensure(params, "pictures");

    var sorted;

    // Pick an algorithm, any algorithm.
    switch(params["splitFunc"] || "gr") {
      case "rr":
        sorted = splitRR(numGroups, numPictures, targetRating, pictures);
        break;
      case "ra":
        sorted = splitRA(numGroups, numPictures, targetRating, pictures);
        break;
      case "gr":
        sorted = splitGR(numGroups, numPictures, targetRating, pictures);
        break;
      case "dp":
        sorted = splitDP(numGroups, numPictures, targetRating, pictures);
        break;
      default:
        sorted = splitGR(numGroups, numPictures, targetRating, pictures);
    }

    var unsorted = _.difference(pictures, _.flatten(sorted));

    return {
      sorted: sorted,
      unsorted: unsorted
    };
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

  // Returns the an object of average rating1 and rating2 from a list of pictures.
  // If length of picture array is 0, the object's rating1 and rating2 are 0.
  //
  // Throws an error if not called with an Array of Pictures.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  // - Kevin Yang (4/27): calculate mean of two ratings
  my.meanRating = function(pictures) {
    Validate.validatePictures(pictures);
    if(pictures.length === 0) {
      return {
        rating1: 0,
        rating2: 0
      };
    } else {
      return {
        rating1: _avg(_.pluck(pictures, "rating1")),
        rating2: _avg(_.pluck(pictures, "rating2"))
      };
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
      var sorted = _.sortBy(pictures, "rating1");
      if(sorted.length % 2 == 0) {
        // Even number of entries, find middle two entries and average.
        var half = sorted.length / 2;
        return _avg([sorted[half-1]['rating1'], sorted[half]['rating1']]);
      } else {
        return sorted[Math.floor((sorted.length - 1) / 2)]['rating1'];
      }
    }
  }

  // Get the most common rating in a list of Pictures.
  // Returns
  // 0 given an empty Array.
  //
  // Throws an error if not called with a non-empty Array of Pictures.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.modeRating = function(pictures) {
    Validate.validatePictures(pictures);
    if(pictures.length === 0) {
      throw new Error("Called with an empty Array.");
    } else {
      var modeMap = {};
      var mode = 0;
      var modeCount = 0;
      _.each(pictures, function(p) {
        var r = p.rating1;

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
  }


  // Get the (population) standard deviation of a list of Pictures
  // for their rating 1 and rating 2. We return a object with fields
  // stdev1 and stdev2 for rating 1 and rating 2.

  // Returns an object with stdev1: 0 and stdev2: 0
  // if given an Array with less than 2 entries.
  //
  // Throws an error if not called with an Array of Picture.
  //
  // See https://www.mathsisfun.com/data/standard-deviation-formulas.html
  //
  // Creation date: 3/2/15
  // Modifications list:
  //   3/15/15 - update desc, add conditional for length of 1 case
  //   4/27/15 - kevin yang - calculating std for both ratings
  //
  my.stdevRating = function(pictures){
    Validate.validatePictures(pictures);
    if(pictures.length < 2) {
      return {
        stdev1: 0,
        stdev2: 0
      };
    } else {
      // Get average rating of the list of Pictures.
      var avgRating1 = my.meanRating(pictures).rating1;
      var avgRating2 = my.meanRating(pictures).rating2;

      // Get the square of the differences between
      // each rating and the average rating
      var sqrDiffs1 = _.map(pictures, function(p) {
        return Math.pow(p.rating1 - avgRating1, 2);
      });

      var sqrDiffs2 = _.map(pictures, function(p) {
        return Math.pow(p.rating2 - avgRating2, 2);
      });

      // Stdev = Square root the average of the squared diffs.


      return {
        stdev1: Math.sqrt(_avg(sqrDiffs1)),
        stdev2: Math.sqrt(_avg(sqrDiffs2)),
      }
    }
  }

  return my;
}());
