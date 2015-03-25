/*
  Author: Tony J Huang
  Group: Team Stimulus
  Created At: 3/2/15
    
  The Validate module contains several methods that validate
  user input for use in the rest of the program.

  Note: Cleared by $wapnil, using TWO space tabs as opposed to 3.
*/
var Validate = (function() {
  // public facing object export.
  var my = {};

  /* Required for testing on Node JS */
  //var _ = require("./underscore-min.js");
  //var Picture = require("./picture.js");

  // Internal helper method to reduce an object into a string representation
  // 
  // Creation date: 3/15/15
  // Modifications list:
  // 
  var _readObject = function(obj) {
    var output = '';
    for (var property in obj) {
      output += property + ': ' + obj[property]+'; ';
    }
    return output;
  }

  // Given a object, checks if it has a value at fieldName.
  // Otherwise throws an error.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //   3/15/15 - more robust undefined value checking. 
  //             See http://stackoverflow.com/a/3550319
  //
  my.ensure = function(params, fieldName) {
    if(typeof(params[fieldName]) != "undefined") {
      return params[fieldName];
    } else {
     throw new Error("missing param field, " + fieldName + 
      ", in: " + _readObject(params));
    }
  }

  // Validates the input as a properly formatted Picture.
  //
  // Creation date: 3/2/15
  // Modifications list:
  //
  my.validatePicture = function(object) {
    if(object instanceof Picture) {
      my.ensure(object, "rating");
      my.ensure(object, "filePath");
    } else {
      throw new Error("Picture is not properly formatted: " + 
        _readObject(object));
    }
  }

  // Validates the input as a properly formatted Array of Pictures.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //  3/2/15 - Updated to use validatePicture helper function.
  //
  my.validatePictures = function(objects) {
    if(!_.isArray(objects)) {
      throw new Error(
        "Pictures argument is not an Array of Picture");
    } else {
      _.each(objects, my.validatePicture);
    }
  }


  // Validates the other user defined input params ansd makes sure
  // they make sense/are possible.
  //
  // Creation date: 3/1/15
  // Modifications list:
  //
  my.validateNumArgs = function(numGroups, numPictures, pictures) {
    var size = _.size(pictures);        
    if(numGroups * numPictures > size) {
      throw new Error("Can't split " + size + " total pictures into " 
        + numGroups + " groups of " + numPictures);
    }
  }

  return my;
}());

/* Required for testing on Node JS */
//module.exports = Validate;
