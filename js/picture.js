/*
Author: Tony J Huang
Group: Team Stimulus
Created At: 3/1/15

This file contains information about the Picture object, which
represents a single picture that the user gives as input. 
*/

var Picture = function(rating, filePath) {
    if (!Picture.idCounter) {
      Picture.idCounter = 0;
    }

    this.rating = rating;
    this.filePath = filePath;
    this.id = Picture.idCounter++;
}

Picture.prototype.name = function() {
    return _.last(this.filePath.split("/"));
};
