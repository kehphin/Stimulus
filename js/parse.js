$(function() {
  var directory = new air.File();
  var picturePath = "";
  var ratingsFile;
  var pictures = [];

  $('#picture-directory').click(function(e) {
    e.preventDefault();
    directory.addEventListener(air.Event.SELECT, function(e) {
      picturePath = directory.nativePath;
      $('#picture-directory').text(picturePath);
    });
    directory.browseForDirectory("Choose the picture directory");
  });

  $('#input-form').submit(function(e) {
    e.preventDefault();
    air.trace("parsing: " + $('#ratings-file').val());
    ratingsFile = new air.File($('#ratings-file').val());
    numGroups = $('#num-groups').val();
    picsPerGroup = $('#pics-per-group').val();
    avgRating = $('#rating-per-group').val();
    air.trace("numGroups: " + numGroups + ", picsPerGroup: " + picsPerGroup + ", avgRating: " + avgRating);
    parse();
  });

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
        pictures.push({ filePath: path, rating: cols[1] });
      }
    }

    pictures.forEach(function(picture) {
      air.trace("filePath: " + picture.filePath + ", rating: " + picture.rating);
    });
  }
});