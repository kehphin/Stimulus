//idek

/*
  Author: David Lin
  Group: Team Stimulus
  Created At: 2/28/15

  This Parse module handles the code to parse the
  ratings.csv file that is imported into an array of pictures.

  All code in this file was authored by David Lin
*/

var Parse = (function() {
  var my = {};

  /*
    Open the file that was input and parse it into an array of picture objects

    Arguments:
    ratingsFile - File - where the ratings CSV is located
    picturePath - String - the absolute path to the directory holding the pictures

    Returns a list of type Picture from the ratings file
  */
  my.getPictures = function(ratingsFile, picturePath) {
    var pictures = [];
    var fileStream = new air.FileStream();
    fileStream.open(ratingsFile, air.FileMode.READ);
    var content = String(fileStream.readUTFBytes(fileStream.bytesAvailable));
    fileStream.close();

    var rows = content.split("\n");

    var dataIndex = -1;
    for(i = 0; i < rows.length; i++) {
      if (rows[i].indexOf("PictureName,Rating") > -1) {
        dataIndex = i;
      }
    }

    if (dataIndex === -1) {
      air.trace("Couldn't parse ratings file");
    } else {
      for(i = dataIndex + 1; i < rows.length; i++) {
        var cols = rows[i].split(",");
        var path = [picturePath, cols[0]].join("/");
        pictures.push(new Picture(cols[1], path));
      }
    }

    pictures.forEach(function(picture) {
      air.trace("filePath: " + picture.filePath + ", rating: " + picture.rating);
    });

    return pictures;
  }

  /*
    Gets the values from the input form

    Arguments: None

    Returns a hash of the parsed fields:
      ratingsFile - File - where the ratings CSV is located
      numGroups - Int - value of the Number of Groups field
      picsPerGroup - Int - value of the Pictures per Group field
      avgRating - Int - value of the Average Rating field
  */
  my.getFormFields = function() {
    air.trace("parsing: " + $('#ratings-file').val());
    var ratingsFile = new air.File($('#ratings-file').val());
    var numGroups = $('#num-groups').val();
    var picsPerGroup = $('#pics-per-group').val();
    var avgRating = $('#rating-per-group').val();
    air.trace("numGroups: " + numGroups + ", picsPerGroup: " + picsPerGroup
      + ", avgRating: " + avgRating);

    return { ratingsFile: ratingsFile, numGroups: numGroups,
      picsPerGroup: picsPerGroup, avgRating: avgRating }
  }

  return my;
}());