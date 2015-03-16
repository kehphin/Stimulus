/*
  Author: David Lin
  Group: Team Stimulus
  Created At: 3/06/15

  This Export module handles the code to export the generated grouping
  of pictures to a new directory structure

  All code in this file was authored by David Lin
*/

var Export = (function(groups) {
  var my = {};

  /*
    takes groups of pictures and a picturePath origin and copies the grouped
    pictures into a new directory structure

    Arguments:
    groups - Array of Array of Pictures - pictures grouped by algorithm
    picturePath - String - directory location of imported pictures

    Returns:
    Nothing, but:
      - creates directory structure under picturePath/results/ based on the groups
  */
  my.savePictures = function(groups, picturePath) {
    var resultsPath = picturePath + "/results";
    var dir = new air.File(resultsPath);
    dir.createDirectory();

    var currentFile;
    var i = 1;

    groups.forEach(function(group) {
      var groupPath = resultsPath + "/group_" + i;
      currentFile = new air.File(groupPath);
      currentFile.createDirectory();

      group.forEach(function(picture) {
        currentFile = new air.File(picture.filePath);
        destination = new air.File(groupPath + "/" + picture.name())
        currentFile.copyTo(destination);
      });

      i++;
    });
  }

  return my;
}());