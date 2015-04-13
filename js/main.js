/*
  Author: David Lin & Tony Huang & Kevin Yang
  Group: Team Stimulus
  Created At: 2/28/15

  This is the core JS file that contains all of the bindings for DOM
  actions such as file browsing and submitting the form
*/

var DEBUG = false;

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

  // This function attaches drag and drop capability to all the groups and pictures.
  var loadDragAndDrop = function () {
    $(".pic-container").draggable({
      scroll: true,
      refreshPositions: true,
      helper: 'clone',
      containment: 'window'
    });

    $( ".group").droppable({
      accept: '.pic-container',
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

        $(this).find('.pic-box').append(clone);


        _moveDraggedPicture($(this), clone);
        ui.draggable.remove();
      }
    });
  }

  // Finds the Picture object that is dragged in the data structure and moves it
  // to the correct group based on the user's draggable interaction.
  var _moveDraggedPicture = function(toGroup, draggedPicture) {
    var toGroupNumber = toGroup.attr('data-group');
    var pictureId = draggedPicture.children('img').attr('id');

    // Picture moved from sorted to sorted/unsorted
    for (var i=0; i<groups.sorted.length; i++) {
      var currGroup = groups.sorted[i];

      for (var j=0; j<currGroup.length; j++) {
        var currPic = currGroup[j];

        if (currPic.id.toString() == pictureId) {
          if (!toGroupNumber) {       // Dragged from sorted to unsorted
            groups.unsorted.push(currPic);
          } else {                    // Dragged from sorted to sorted
            groups.sorted[parseInt(toGroupNumber)].push(currPic);
          }

          currGroup.splice(j, 1);
          _recalculateStats();
          return;
        }
      }
    }

    // Picture moved from unsorted to unsorted/sorted
    for (var k=0; k<groups.unsorted.length; k++) {
      var currUnsortedPic = groups.unsorted[k];

      if (currUnsortedPic.id.toString() == pictureId) {
        if (!toGroupNumber) {       // Dragged from unsorted to unsorted
          groups.unsorted.push(currUnsortedPic);
        } else {                    // Dragged from unsorted to sorted
          groups.sorted[parseInt(toGroupNumber)].push(currUnsortedPic);
        }

        groups.unsorted.splice(k, 1);
        _recalculateStats();
        return;
      }
    }
  }

  // Redisplays the new group stats of each group in the UI.
  var _recalculateStats = function() {
    for (var i=0; i<groups.sorted.length; i++) {
      var group = groups.sorted[i];
      var meanRating = +Stats.meanRating(group).toFixed(3);
      var stdevRating = +Stats.stdevRating(group).toFixed(3);

      $('[data-group=' + i + ']').find('.stats-mean').text('Mean: ' + meanRating);
      $('[data-group=' + i + ']').find('.stats-stdev').text('SD: ' + stdevRating);
    }
  }

  // Shows the Settings tab in the UI.
  var showSettings = function() {
    $(".groupsContainer").hide();
    $(".graphsContainer").hide();
    $(".settingsContainer").show();
  }

  // Shows the Groups tab in the UI.
  var showGroups = function() {
    $('[data-group]').hide();

    $(".settingsContainer").hide();
    $(".graphsContainer").hide();
    $(".groupsContainer").show();

    loadPics();
    loadDragAndDrop();
  }

  // Shows the Graph tab in the UI.
  var showGraphs = function() {
    $(".groupsContainer").hide();
    $(".settingsContainer").hide();
    $(".graphsContainer").show();
    Chart.plotCharts(groups.sorted);
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

  // Handler for form submission for the Settings tab.
  function onInputFormSubmit() {
    if(DEBUG) {
      picturePath = "/Users/Kevin/Desktop/Stimly";
      var ratingsFile = new air.File(picturePath + "/ratings.csv");
      pictures = Parse.getPictures(ratingsFile, picturePath);
    } else {
      // get the grouping parameters off of the form
      var formFields = Parse.getFormFields();
      // read pictures from the ratings file
      pictures = Parse.getPictures(formFields['ratingsFile'], picturePath);
    }

    // choose algorithm for splitting the pictures
    var splitFunc = 'ra'
    air.trace("Splitting with algorithm: " + splitFunc);

    if(DEBUG) {
      // process the pictures with the stats module
      groups = Stats.split({
        numGroups: 2,
        numPictures: 5,
        targetRating: 5,
        pictures: pictures,
        splitFunc: splitFunc
      });
    } else {
      // process the pictures with the stats module
      groups = Stats.split({
        numGroups: formFields['numGroups'],
        numPictures: formFields['picsPerGroup'],
        targetRating: formFields['avgRating'],
        pictures: pictures,
        splitFunc: splitFunc
      });
    }

    var i = 1;
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

  if(DEBUG) {
    onInputFormSubmit();
  } else {
    showSettings();
  }
});

// Substitutes metadata in a HTML segment by the placing '{...}'' with its value
String.prototype.supplant = function (o) {
  return this.replace(/{([^{}]*)}/g,
    function (a, b) {
      var r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    }
  );
};

// Returns the HTML segment of a picture that will be inserted into the DOM,
// populated with the picture's metadata.
function _getPictureHtml(picture) {
  var path = new air.File(picture.filePath).url;
  var imageHtml =
    '<div class="pic-container">\n' +
    '  <img src="{path}" class="pic-image" id="{id}"">\n' +
    '  <div class="pic-info">Rating: {rating}</div>\n' +
    '</div>\n';

  return imageHtml.supplant({
    path: path,
    rating: picture.rating,
    id: picture.id
  });
}

// Adds a group of pictures to a given row element, assigns
// it an id of {index}
function _addGroupToRow(group, index, $parentRow) {
  var groupHtml =
    '<div class="group sorted-group" data-group="{index_0}">\n' +
    '  <div class="inner-group">\n' +
    '    <div class="pic-box"></div>\n' +
    '    <div class="stats-box">\n' +
    '      <h4 class="group-name">Group {index}</h4>\n' +
    '      <div class="stats">\n' +
    '        <div class="stats-mean">Mean: {mean}</div>\n' +
    '        <div class="stats-stdev">SD: {stdev}</div>\n' +
    '      </div>\n' +
    '  </div>\n' +
    '  </div>\n' +
    '</div>\n';

  var meanRating = +Stats.meanRating(group).toFixed(3);
  var stdevRating = +Stats.stdevRating(group).toFixed(3);

  //http://stackoverflow.com/a/12830454

  groupHtml = groupHtml.supplant({
    index_0: index, // 0-indexed
    index: index + 1,
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
