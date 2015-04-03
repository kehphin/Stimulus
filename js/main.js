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
  var groups = {};
  var loadPics = function() {
    var unsortedPicsHtml = "";
    groups.unsorted.forEach(function(picture) {
      var path = new air.File(picture.filePath).url;
      unsortedPicsHtml += '<img src="' + path + '" class="image">';
    });

    // flush DOM then add current pictures
    $('#unsorted').html('');
    $('#unsorted').append(unsortedPicsHtml);

    var groupCount = 1;
    groups.sorted.forEach(function(group) {
      var currentGroup = $("div[data-group='" + groupCount + "']");
      var outHtml = "";

      currentGroup.show();

      // add each picture inside the group to the outHtml string that will be added to DOM
      group.forEach(function(picture) {
        var path = new air.File(picture.filePath).url;
        outHtml += '<img src="' + path + '" class="image"/>';
      });

      currentPicBox = $("div[data-group='" + groupCount + "'] > .pic-box");
      currentPicBox.html('');
      currentPicBox.append(outHtml);

      groupCount++;
    });

    var numGroups = groups.sorted.length;
    var colSize;

    // set the group box width based on number of groups
    switch(numGroups) {
      case 1:
        colSize = 12;
        break;
      case 2:
        colSize = 6;
        break;
      case 3:
        colSize = 4;
        break;
      default:
        colSize = 3;
        break;
    }

    $('[data-group]').addClass('col-md-' + colSize);
  }

  var showSettings = function() {
    $(".groupsContainer").hide();
    $(".graphsContainer").hide();
    $(".settingsContainer").show();
  }

  var showGroups = function() {
    $('[data-group]').hide();

    $(".settingsContainer").hide();
    $(".graphsContainer").hide();
    $(".groupsContainer").show();

    loadPics();
  }

  var showGraphs = function() {
    $(".groupsContainer").hide();
    $(".settingsContainer").hide();
    $(".graphsContainer").show();
  }

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
    groups.sorted.forEach(function(group) {
      air.trace("Group " + i);
      group.forEach(function(picture) {
        air.trace("filePath: " + picture.filePath + ", rating: " + picture.rating);
      });

      i++;
    });

    Export.savePictures(groups.sorted, picturePath);

    showGroups();
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
