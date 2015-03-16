/*
  Author: David Lin
  Group: Team Stimulus
  Created At: 2/28/15

  This handles the event bindings for the input form and the code to parse the
  ratings.csv file that is imported.

  All code in this file was authored by David Lin
*/

$(function() {
  /*
    Open the file that was input and parse it into an array of picture objects
  */
  function parse() {
    var fileStream = new air.FileStream();
    fileStream.open(ratingsFile, air.FileMode.READ);
    content = String(fileStream.readUTFBytes(fileStream.bytesAvailable));
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
        path = [picturePath, cols[0]].join("/");
        pictures.push(new Picture(cols[1], path));
      }
    }

    pictures.forEach(function(picture) {
      air.trace("filePath: " + picture.filePath + ", rating: " + picture.rating);
    });

    return pictures;
  }
});