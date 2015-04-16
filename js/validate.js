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

  var _addError = function(formField, glyphicon, message) {
    $('#error-alert').append(message + "<br />");
    formField.parent().parent().addClass('has-error has-feedback');
    glyphicon.removeClass('hide');
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

  my.nullFields = function() {
    var errorState = false;

    if ($('#ratings-file').val() === '') {
      $('#error-alert').append("Please select the ratings file <br />");
      errorState = true;
    }

    if ($('#num-groups').val() === '') {
      _addError($('#num-groups'), $('#num-groups-error'), "Please specify number of groups");
      errorState = true;
    }

    if ($('#pics-per-group').val() === '') {
      _addError($('#pics-per-group'), $('#pics-per-group-error'), "Please specify pictures per group");
      errorState = true;
    }

    if ($('#rating-per-group').val() === '') {
      _addError($('#rating-per-group'), $('#rating-per-group-error'), "Please specify average rating per group");
      errorState = true;
    }

    return errorState;
  }

  return my;
}());
