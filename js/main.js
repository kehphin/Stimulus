/*
  Author: David Lin & Tony Huang & Kevin Yang
  Group: Team Stimulus
  Created At: 2/28/15

  This is the core JS file that contains all of the bindings for DOM
  actions such as file browsing and submitting the form
*/

$(function() {
  var directory = new air.File();
  var picturePath = "";
  var ratingsFile;
  var pictures = [];
  var groups = {};

  /* This function will populate all the picture objects into
  the group containers in the Groups tab. */
  var loadPics = function() {
    var unsortedPicsHtml = "";
    groups.unsorted.forEach(function(picture) {
      unsortedPicsHtml += _getPictureHtml(picture);
    });

    // flush DOM then add current pictures
    $('.unsorted-row .pic-box').html('');
    $('.unsorted-row .pic-box').append(unsortedPicsHtml);

    $('.sorted-group').remove();

    // Use JQuery each for easy access to index.
    $.each(groups.sorted, function(index, group) {
      var row;
      if(index < 4) {
        row = $(".sorted-row")[0];
      } else {
        row = $(".sorted-row")[1];
      }

      var groupElement = _addGroupToRow(group, index, $(row));
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

  /* This function attaches drag and drop capability to all the groups and pictures */
  var loadDragAndDrop = function () {
    $(".image-container").draggable({
      scroll: true,
      refreshPositions: true,
      helper: 'clone',
      containment: 'window'
    });

    $( ".group").droppable({
      accept: '.image-container',
      activeClass: 'active',
      hoverClass: 'hover',
      tolerance: 'pointer',
      drop: function(event, ui) {
        var clone = $(ui.draggable).clone();
        clone.draggable({
          scroll: true,
          refreshPositions: true,
          helper: 'clone'
        });

        $(this).children('div').append(clone);
        ui.draggable.remove();
      }
    });
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
    loadDragAndDrop();
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

  function onInputFormSubmit() {
    // get the grouping parameters off of the form
    //var formFields = Parse.getFormFields();

    // read pictures from the ratings file
    //pictures = Parse.getPictures(formFields['ratingsFile'], picturePath);
    picturePath = "/Users/tony/sd/Stimulus/test_data";
    var ratingsFile = new air.File(picturePath + "/ratings.csv");
    pictures = Parse.getPictures(ratingsFile, picturePath);

    // choose algorithm for splitting the pictures
    var splitFunc = 'ra'
    air.trace("Splitting with algorithm: " + splitFunc);

    // process the pictures with the stats module
    groups = Stats.split({
      numGroups: 8,//formFields['numGroups'],
      numPictures: 1,//formFields['picsPerGroup'],
      targetRating: 5,//formFields['avgRating'],
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
  }

  /*
    When submit is clicked on the form, parse all of the input into variables
    and use the Parse module to parse the ratings file.
  */
  $('#input-form').submit(function(e) {
    e.preventDefault();
    onInputFormSubmit();
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

  //showSettings();
  onInputFormSubmit();
});

String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

function _getPictureHtml(picture) {
  var path = new air.File(picture.filePath).url;
  var imageHtml =
    '<div class="image-container">\n' +
      '<img src="' + path + '" class="image">\n' +
      '<div class="pic-info">Rating: ' + picture.rating + '</div>\n' +
    '</div>\n';
  return imageHtml;
}


// Adds a group of pictures to a given row element, assigns
// it an id of {index}
//
// Creation date: 4/10/15 - Tony J Huang
// Modifications list:
//
function _addGroupToRow(group, index, $parentRow) {
  var groupHtml = 
    '<div class="group sorted-group" data-group="{index}">\n' + 
    '  <div class="pic-box"></div>\n' + 
    '  <div class="stats-box">\n' + 
    '    <h4 class="group-name">Group {index}</h4>\n' + 
    '    <div class="stats">\n' + 
    '      <div class="stats-mean">Mean: {mean}</div>\n' + 
    '      <div class="stats-stdev">St.dev: {stdev}</div>\n' + 
    '    </div>\n' + 
    '  </div>\n' + 
    '</div>\n';

  var meanRating = Stats.meanRating(group);
  var stdevRating = Stats.stdevRating(group);

  groupHtml = groupHtml.supplant({
    index: index,
    mean: meanRating,
    stdev: stdevRating
  });

  var $groupElement = $(groupHtml);
  $parentRow.append($groupElement);

  // Add pictures to group
  var pictureHtml = "";
  group.forEach(function(picture) {
    pictureHtml += _getPictureHtml(picture);
  });
  $groupElement.find(".pic-box").append(pictureHtml);



  return $groupElement;
}




