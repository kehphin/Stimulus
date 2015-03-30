/*
Author: Tony J Huang
Group: Team Stimulus
Created At: 3/15/15

Tests for the Stats module. Uses Jasmine testing framework. See
the Jasmine documentation here:

http://jasmine.github.io/
*/

// Mock Data
var emptyPictures = [];

var mockPictures = [new Picture(7, "foo")];

var mockPictures2 = [new Picture(5, "foo"), 
  new Picture(7, "bar"), 
  new Picture(9, "baz"),
  new Picture(9, "qux")];

var mockPictures3 = [
  new Picture(0, "Picture 0"),
  new Picture(1, "Picture 1"), 
  new Picture(2, "Picture 2"),
  new Picture(3, "Picture 3"),
  new Picture(4, "Picture 4"), 
  new Picture(5, "Picture 5"),
  new Picture(6, "Picture 6"),
  new Picture(7, "Picture 7"), 
  new Picture(8, "Picture 8"),
  new Picture(9, "Picture 9")
]


describe("statistics", function() {
  it("computes the median rating", function() {
    expect(Stats.medianRating(mockPictures)).toBe(7);
  });

  it("also computes the median rating", function() {
    expect(Stats.medianRating(mockPictures2)).toBe(8);
  });

  it("computes the mode rating", function() {
    expect(Stats.modeRating(mockPictures)).toBe(7);
  });

  it("also computes the mode rating", function() {
    expect(Stats.modeRating(mockPictures2)).toBe(9);
  });

  it("computes the mean rating", function() {
    expect(Stats.meanRating(mockPictures)).toBe(7);
  });

  it("also computes the mean rating", function() {
    expect(Stats.meanRating(mockPictures2)).toBe(7.5);
  });

  it("computes the standard deviation", function() {
    expect(Stats.stdevRating(mockPictures)).toBe(0);
  });

  it("also computes the standard deviation", function() {
    expect(Stats.stdevRating(mockPictures2)).toBeCloseTo(1.6583, 0.0001);
  });

});


describe("greedy split", function() {
  it("splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 9, 
      "pictures": mockPictures2, 
      "splitFunc": "gr"
    });

    var expected = [
      [new Picture(9, "baz")], 
      [new Picture(9, "qux")]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("also splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "gr"
    });

    var expected = [
      [new Picture(4, "Picture 4")],
      [new Picture(5, "Picture 5")]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("splits the data set with more pictures", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "gr"
    });

    var expected = [
      [
        new Picture(4, "Picture 4"),
        new Picture(5, "Picture 5"),
        new Picture(3, "Picture 3")
      ],
      [
        new Picture(6, "Picture 6"),
        new Picture(2, "Picture 2"),
        new Picture(7, "Picture 7")
      ]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("splits the data set into 3 groups", function() {
    var splitPictures = Stats.split({
      "numGroups": 3, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "gr"
    });

    var expected = [
      [
        new Picture(4, "Picture 4"),
        new Picture(5, "Picture 5"),
        new Picture(3, "Picture 3")
      ],
      [
        new Picture(6, "Picture 6"),
        new Picture(2, "Picture 2"),
        new Picture(7, "Picture 7")
      ],
      [
        new Picture(1, "Picture 1"),
        new Picture(8, "Picture 8"),
        new Picture(0, "Picture 0")
      ]
    ];

    expect(splitPictures).toEqual(expected);
  });
});


describe("round robin split", function() {
  it("splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 9, 
      "pictures": mockPictures2, 
      "splitFunc": "rr"
    });

    var expected = [
      [new Picture(9, "baz")], 
      [new Picture(9, "qux")]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("also splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    var expected = [
      [new Picture(4, "Picture 4")],
      [new Picture(5, "Picture 5")]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("splits the data set with more pictures", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    var expected = [
      [
        new Picture(4, "Picture 4"),
        new Picture(3, "Picture 3"),
        new Picture(2, "Picture 2")
      ],
      [
        new Picture(5, "Picture 5"),
        new Picture(6, "Picture 6"),
        new Picture(7, "Picture 7")
      ]
    ];

    expect(splitPictures).toEqual(expected);
  });

  it("splits the data set into 3 groups", function() {
    var splitPictures = Stats.split({
      "numGroups": 3, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    var expected = [
      [
        new Picture(4, "Picture 4"),
        new Picture(6, "Picture 6"),
        new Picture(1, "Picture 1")
      ],
      [
        new Picture(5, "Picture 5"),
        new Picture(2, "Picture 2"),
        new Picture(8, "Picture 8")
      ],
      [
        new Picture(3, "Picture 3"),
        new Picture(7, "Picture 7"),
        new Picture(0, "Picture 0")
      ]
    ];

    expect(splitPictures).toEqual(expected);
  });
});


describe("random split", function() {
  it("splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 9, 
      "pictures": mockPictures2, 
      "splitFunc": "rr"
    });

    expect(splitPictures.length).toBe(2);
    _.each(splitPictures, function(group) {
      expect(group.length).toBe(1);
    });
  });

  it("also splits the data set", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 1, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    expect(splitPictures.length).toBe(2);
    _.each(splitPictures, function(group) {
      expect(group.length).toBe(1);
    });
  });

  it("splits the data set with more pictures", function() {
    var splitPictures = Stats.split({
      "numGroups": 2, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    expect(splitPictures.length).toBe(2);
    _.each(splitPictures, function(group) {
      expect(group.length).toBe(3);
    });
  });

  it("splits the data set into 3 groups", function() {
    var splitPictures = Stats.split({
      "numGroups": 3, 
      "numPictures": 3, 
      "targetRating": 4.5, 
      "pictures": mockPictures3, 
      "splitFunc": "rr"
    });

    expect(splitPictures.length).toBe(3);
    _.each(splitPictures, function(group) {
      expect(group.length).toBe(3);
    });
  });
});














