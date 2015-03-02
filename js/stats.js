/*
  Author: Tony J Huang
  Group: Team Stimulus
  Created At: 2/18/15

  This is the stats module, affectionately and globally referred 
  to as Stats. This module provides the solutions to all of your 
  statistical needs, including standard deviations, means, medians, 
  modes, and much much more (coming soon [tm])!

  Check the README file for complete documentation on public methods.

  Note: This module relies heavily on Underscore.js 
      (http://underscorejs.org/). If you don't have this library 
      installed then you're out of luck my friend.

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
  //
  function sortPicturesByRating(targetRating, pictures) {
    return _.sortBy(pictures, function(p) 
      {Math.abs(p.rating - targetRating)});
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
    return _.values(_.groupBy(candidates), function(p) {i++ % numGroups});
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
    var sortedPictures = sortPicturesByRating(targetRating, pictures);
    var chunkedPictures = sortedPictures.chunk(numPictures);
    return _.first(chunkedPictures, numGroups);
  }

  // Dynamic Programming.
  // ALGORITHM: Go through every possibly combination of pictures,
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

  return my;
}());




