/*
  Author: David Lin
  Group: Team Stimulus
  Created At: 2/28/15

  This is the core JS file that contains all of the bindings for DOM
  actions such as file browsing and submitting the form

  All code in this file was authored by David Lin
*/

var showSettings = function() {
  $(".groupsContainer").hide();
  $(".graphsContainer").hide();
  $(".settingsContainer").show();
}

var showGroups = function() {
  $(".settingsContainer").hide();
  $(".graphsContainer").hide();
  $(".groupsContainer").show();
}

var showGraphs = function() {
  $(".groupsContainer").hide();
  $(".settingsContainer").hide();
  $(".graphsContainer").show();
}

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

    // get the grouping parameters off of the form
    var formFields = Parse.getFormFields();

    // read pictures from the ratings file
    pictures = Parse.getPictures(formFields['ratingsFile'], picturePath);

    // choose algorithm for splitting the pictures
    var splitFunc = 'ra'
    air.trace("Splitting with algorithm: " + splitFunc);

    // process the pictures with the stats module
    groups = Stats.split({
      numGroups: formFields['numGroups'],
      numPictures: formFields['picsPerGroup'],
      targetRating: formFields['avgRating'],
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

    Export.savePictures(groups, picturePath);
  });

  $(".groupsNav").click(function() {
    showGroups();
  });

  $(".settingsNav").click(function() {
    showSettings();
  });

  $(".graphsNav").click(function() {
    showGraphs();
  });

  showSettings();
});
