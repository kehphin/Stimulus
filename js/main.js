/*
  Author: David Lin
  Group: Team Stimulus
  Created At: 2/28/15

  This is the core JS file that contains all of the bindings for DOM
  actions such as file browsing and submitting the form

  All code in this file was authored by David Lin
*/

$(function() {
  var directory = new air.File();
  var picturePath = "";
  var ratingsFile;
  var pictures = [];

  /*
    When the #picture-directory input is clicked, use AIR's browseForDirectory() method
    When the directory is selected, save the path and display it in the form.
  */
  $('#picture-directory').click(function(e) {
    e.preventDefault();
    directory.addEventListener(air.Event.SELECT, function(e) {
      picturePath = directory.nativePath;
      $('#picture-directory').text(picturePath);
    });
    directory.browseForDirectory("Choose the picture directory");
  });

  /*
    When submit is clicked on the form, parse all of the input into variables
    and use the Parse module to parse the ratings file.
  */
  $('#input-form').submit(function(e) {
    e.preventDefault();
    air.trace("parsing: " + $('#ratings-file').val());
    ratingsFile = new air.File($('#ratings-file').val());
    numGroups = $('#num-groups').val();
    picsPerGroup = $('#pics-per-group').val();
    avgRating = $('#rating-per-group').val();
    air.trace("numGroups: " + numGroups + ", picsPerGroup: " + picsPerGroup + ", avgRating: " + avgRating);
    pictures = Parse.getPictures(ratingsFile, picturePath);

    splitFunc = 'ra'

    air.trace("Splitting with algorithm: " + splitFunc);

    groups = Stats.split({
      numGroups: numGroups,
      numPictures: picsPerGroup,
      targetRating: avgRating,
      pictures: pictures,
      splitFunc: splitFunc
    });

    i = 1;
    groups.forEach(function(group) {
      air.trace("Group " + i);
      group.forEach(function(picture) {
        air.trace("filePath: " + picture.filePath + ", rating: " + picture.rating);
      });

      i++;
    });
  });
});
