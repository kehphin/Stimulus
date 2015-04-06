/*
Author: Tony J Huang
Group: Team Stimulus
Created At: 3/1/15

This file contains information about the Picture object, which
represents a single picture that the user gives as input. 
*/

var id = 1;

var Picture = function(rating, filePath) {
    this.rating = rating;
    this.filePath = filePath;
    this.id = id;
    id++;
}

Picture.prototype.name = function() {
    return _.last(this.filePath.split("/"));
};
