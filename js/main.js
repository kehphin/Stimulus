/*
  Author: David Lin & Tony Huang & Kevin Yang
  Group: Team Stimulus
  Created At: 2/28/15

  This is the core JS file that contains all of the bindings for DOM
  actions such as file browsing and submitting the form
*/
var DEBUG = false;
var label1 = "";
var label2 = "";

$(function() {
  var directory = new air.File();
  var picturePath = "";
  var ratingsFile;
  var pictures = [];
  var groups = {};

  // This function will populate all the picture objects into
  // the group containers in the Groups tab.
  //
  // Creation date: 2/28/15 - David Lin
  // Modifications list:
  // 4/10/15 - dynamically add html group elements to DOM (Tony J Huang)
  //
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

  // Update the stats bar for a group with the given stats.
  //
  // Creation date: 4/15/15 - Tony J Huang
  // Modification list:
  //
  var _setStatsForGroup = function(groupIndex, mean, stdev) {
    var meanFormatted1  = +mean.rating1.toFixed(3);
    var meanFormatted2  = +mean.rating2.toFixed(3);
    var stdevFormatted1 = +stdev.stdev1.toFixed(3);
    var stdevFormatted2 = +stdev.stdev2.toFixed(3);
    var $group = $('[data-group=' + groupIndex + ']');
    $group.find('.stats-mean1').text(label1 + ' μ: ' + meanFormatted1);
    $group.find('.stats-stdev1').text(label1 + ' σ: ' + stdevFormatted1);
    $group.find('.stats-mean2').text(label2 + ' μ: ' + meanFormatted2);
    $group.find('.stats-stdev2').text(label2 + ' σ: ' + stdevFormatted2);
    }

  // This function attaches drag and drop capability to all
  // the groups and pictures.
  //
  // Creation date: 3/26/15 - Kevin Yang
  // Modifications list:
  // - 4/15/15 Dynamically update stats box when dragging
  //   pictures (Tony J Huang)
  //
  var loadDragAndDrop = function () {

    // Check if the given x and y coordinates are within the
    // JQuery element's view bounds.
    //
    // Creation date: 4/15/15 - Tony J Huang
    // Modifications list:
    //
    var _containsPoint = function($element, x, y) {
      var offset = $element.offset();
      var top = offset.top;
      var left = offset.left;
      var right = left + $element.width();
      var bottom = top + $element.height();

      return left <= x && x <= right && top <= y && y <= bottom;
    }

    // Retrieve a picture given its id
    //
    // Creation date: 4/15/15 - Tony J Huang
    // Modifications list:
    //
    var _getPicture = function(pictureId) {
      var result;
      pictures.forEach(function(picture) {
        if(parseInt(picture.id) === parseInt(pictureId)) {
          result = picture;
          return false;
        }
      });
      return result;
    }

    // Update a group's stats box dynamically when dragging a picture
    // over its div.
    //
    // Creation date: 4/15/15 - Tony J Huang
    // Modifications list:
    //
    var handleDragEvent = function(event, ui) {
      var pictureId = ui.helper.find('img').data('id');
      var picture = _getPicture(pictureId);
      var x = parseInt( ui.offset.left );
      var y = parseInt( ui.offset.top );
      $.each($('.group'), function(index, groupDiv) {
        if(index === $('.group').length - 1) {
          // unsorted (ignore)
        } else if(_containsPoint($(groupDiv), x, y)) {
          if($.inArray(picture, groups.sorted[index]) >= 0) {
              // don't do anything, the dragging picture is already in
              // this group element.
            } else {
              // calculate new ratings with the dragged picture.
              // see http://davidwalsh.name/javascript-clone-array
              var groupClone = groups.sorted[index].slice(0);
              groupClone.push(picture);
              var meanRating = Stats.meanRating(groupClone);
              var stdevRating = Stats.stdevRating(groupClone);
              _setStatsForGroup(index, meanRating, stdevRating);
            }
        } else {
          // calculate ratings of all other groups
          // (in case picture has been dragged out of div);
          var group = groups.sorted[index];
          var meanRating = Stats.meanRating(group);
          var stdevRating = Stats.stdevRating(group);
          _setStatsForGroup(index, meanRating, stdevRating);
        }
      });
    }

    var draggableOptions = {
      scroll: true,
      refreshPositions: true,
      opacity: 0.35,
      helper: 'clone',
      // drag: handleDragEvent
    };

    $(".pic-container").draggable(draggableOptions);

    $( ".group").droppable({
      accept: '.pic-container',
      activeClass: 'active',
      hoverClass: 'hover',
      tolerance: 'pointer',
      drop: function(event, ui) {
        var clone = $(ui.draggable);
        $(this).find('.pic-box').append(clone);
        _moveDraggedPicture($(this), clone);
      }
    });
  }

  // Finds the Picture object that is dragged in the data structure and moves it
  // to the correct group based on the user's draggable interaction.
  //
  // Creation date: 4/15/15 - Kevin Yang
  // Modifications list:
  //
  var _moveDraggedPicture = function(toGroup, draggedPicture) {
    var toGroupNumber = toGroup.attr('data-group');
    var pictureId = draggedPicture.children('img').data('id');
    var picFound = false;

    // Picture moved from sorted to sorted/unsorted
    $.each(groups.sorted, function(index, group) {
      $.each(group, function(index, picture) {
        if (picture.id.toString() == pictureId && !picFound) {
          if (!toGroupNumber) {       // Dragged from sorted to unsorted
            groups.unsorted.push(picture);
          } else {                    // Dragged from sorted to sorted
            groups.sorted[parseInt(toGroupNumber)].push(picture);
          }

          group.splice(index, 1);
          _recalculateStats();
          picFound = true;
          return false;
        }
      });
    });

    // Picture moved from unsorted to unsorted/sorted
    if (!picFound) {
      $.each(groups.unsorted, function(index, picture) {
        if (picture.id.toString() == pictureId) {
          if (!toGroupNumber) {       // Dragged from unsorted to unsorted
            groups.unsorted.push(picture);
          } else {                    // Dragged from unsorted to sorted
            groups.sorted[parseInt(toGroupNumber)].push(picture);
          }

          groups.unsorted.splice(index, 1);
          _recalculateStats();
          return false;
        }
      });
    }
  }

  // Redisplays the new group stats of each group in the UI.
  //
  // Creation date: 4/15/15 - Kevin Yang
  // Modifications list:
  // - 4/15/15 use _setStatsForGroup helper (Tony J Huang)
  //
  var _recalculateStats = function() {
    for (var i=0; i<groups.sorted.length; i++) {
      var group = groups.sorted[i];
      var meanRatings = Stats.meanRating(group);
      var stdevRatings = Stats.stdevRating(group);

      _setStatsForGroup(i, meanRatings, stdevRatings);
    }
  }

  // Shows the Settings tab in the UI.
  //
  // Creation date: 3/20/15 - Kevin Yang
  // Modifications list:
  //
  var showSettings = function() {
    $(".groupsContainer").hide();
    $(".graphsContainer").hide();
    $(".settingsContainer").show();
  }

  // Shows the Groups tab in the UI.
  //
  // Creation date: 3/20/15 - Kevin Yang
  // Modifications list:
  //
  var showGroups = function() {
    $('[data-group]').hide();

    $(".settingsContainer").hide();
    $(".graphsContainer").hide();
    $(".groupsContainer").show();

    loadPics();
    loadDragAndDrop();
  }

  // Shows the Graph tab in the UI.
  //
  // Creation date: 3/20/15 - Kevin Yang
  // Modifications list:
  //
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

  /*
    When the Export Pictures button is clicked, we call the Export module's savePictures
    to place the pictures in folders in the directory
  */
  $('.export-pics').click(function(e) {
    Export.savePictures(groups.sorted, picturePath);
    $(".export-msg").html("Successfully exported!");

    setTimeout(function() {
      $(".export-msg").html("");
    }, 3000);
  });

  // Handler for form submission for the Settings tab.
  //
  // Creation date: 3/13/15 - David Lin
  // Modifications list:
  //
  function onInputFormSubmit() {
    var data;

    // reset form to show no errors again
    var errorState = false;
    $('#error-alert').hide();
    $('#error-alert').empty();
    $('.form-control-feedback').addClass('hide');
    $('.form-group').removeClass('has-error has-feedback');

    if(DEBUG) {
      picturePath = "/Users/Kevin/Desktop/Stimly";
      var ratingsFile = new air.File(picturePath + "/ratings.csv");
      data = Parse.getPictures(ratingsFile, picturePath);
    } else {
      errorState = Validate.nullFields();

      // if there are errors in the form, fadeIn the error bar and abort split
      if (errorState) {
        $('#error-alert').fadeIn(500);
        return;
      }

      // get the grouping parameters off of the form
      var formFields = Parse.getFormFields();
      // read pictures from the ratings file
      data = Parse.getPictures(formFields['ratingsFile'], picturePath);
    }

    pictures = data.pictures;
    label1 = data.labels[0];
    label2 = data.labels[1];


    errorState = Validate.numberFields(formFields['numGroups'], formFields['picsPerGroup'], formFields['avgRating']);

    errorState = errorState || Validate.validateNumArgs(formFields['numGroups'], formFields['picsPerGroup'], pictures);

    // if there are errors in the form, fadeIn the error bar and abort split
    if (errorState) {
      $('#error-alert').fadeIn(500);
      return;
    }

    // choose algorithm for splitting the pictures
    var splitFunc = 'gr'
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
        if (picture.rating2) {
          air.trace("filePath: " + picture.filePath
                    + ", " + label1 + ": " + picture.rating1
                    + ", " + label2 + ": " + picture.rating2);
        } else {
          air.trace("filePath: " + picture.filePath
                    + ", " + label1 + ": " + picture.rating1);
        }
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
    setTimeout(showGraphs, 500);
  } else {
    showSettings();
  }
});

// Substitutes metadata in a HTML segment by the placing '{...}'' with its value
//
// Creation date: 4/10/15 - Tony J Huang
// Modifications list:
//
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
//
// Creation date: 4/10/15 - Tony J Huang
// Modifications list:
//
function _getPictureHtml(picture) {
  var path = new air.File(picture.filePath).url;
  var imageHtml =
    '<div class="pic-container">\n' +
    '  <img src="{path}" class="pic-image" data-id="{id}">\n' +
    '  <div class="pic-info">{label1}: {rating1}</div>\n';

  if (picture.rating2) {
    imageHtml += '  <div class="pic-info">{label2}: {rating2}</div>\n';
  }

  imageHtml += '</div>\n';

  return imageHtml.supplant({
    path: path,
    rating1: picture.rating1,
    rating2: picture.rating2,
    label1: label1,
    label2: label2,
    id: picture.id
  });
}

// Adds a group of pictures to a given row element, assigns
// it an id of {index}
//
// Creation date: 4/10/15 - Tony J Huang
// Modifications list:
//
function _addGroupToRow(group, index, $parentRow) {
  var groupHtml =
    '<div class="group sorted-group" data-group="{index_0}">\n' +
    '  <div class="inner-group">\n' +
    '    <div class="pic-box"></div>\n' +
    '    <div class="stats-box">\n' +
    '      <h4 class="group-name">Group {index}</h4>\n' +
    '      <div class="stats">\n' +
    '        <div class="stats-mean">\n' +
    '          <div class="stats-mean1">' + label1 + ' μ: {mean1}</div>\n' +
    '          <div class="stats-stdev1">' + label1 + ' σ: {stdev1}</div>\n' +
    '        </div>\n' +
    '        <div class="stats-stdev">\n' +
    '          <div class="stats-mean2">' + label2 + ' μ: {mean2}</div>\n' +
    '          <div class="stats-stdev2">' + label2 + ' σ: {stdev2}</div>\n' +
    '        </div>\n' +
    '      </div>\n' +
    '  </div>\n' +
    '  </div>\n' +
    '</div>\n';

  var meanRating1 = +Stats.meanRating(group).rating1.toFixed(3);
  var meanRating2 = +Stats.meanRating(group).rating2.toFixed(3);
  var stdevRating1 = +Stats.stdevRating(group).stdev1.toFixed(3);
  var stdevRating2 = +Stats.stdevRating(group).stdev2.toFixed(3);

  //http://stackoverflow.com/a/12830454

  groupHtml = groupHtml.supplant({
    index_0: index, // 0-indexed
    index: index + 1,
    mean1: meanRating1,
    mean2: meanRating2,
    stdev1: stdevRating1,
    stdev2: stdevRating2
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
