/* global it */
/* global describe */

var assert = require("assert");
var parser = require("../index");

describe('Parser.rich()', function () {
  this.timeout(15000);

  it('should parse local file', function(done) {
    parser.rich().parseUrl('test/rich_data/1.html', function(data) {
      //console.log(data);
      var first = data.ads[0];

      // rrrrhhhrhr
      //assert.equal(first.Title, 'Fly with AirAsia - AirAsia.com');

      assert.equal(first.DisplayURL, 'www.airasia.com/');
      assert.equal(first.Domain, 'www.airasia.com');
      assert.equal(first.Line1, 'Find Lowest Fare to your Dream Destination. Book Online Now!');
      assert.equal(first.IsBottom, false);
      assert.equal(first.IsTop, true);

      var second = data.ads[1].Extensions;

      assert.equal(second.HasReviews, true);
      assert.equal(second.Review.Author, 'World Airline Awards');
      assert.equal(second.Review.Quote, 'The World’s Best Business Class');
      assert.equal(second.Review.URL, 'http://www.worldairlineawards.com/Awards_2013/jclass.htm');

      assert.equal(second.HasSiteLinks, true);
      assert.equal(second.SiteLinks.length, 3);
      assert.equal(second.SiteLinks[0].Title, 'Best Business Class');
      assert.equal(second.SiteLinks[1].Title, 'Affordable 5-Star Economy');
      assert.equal(second.SiteLinks[2].Title, 'Discover Where We Fly');
      done();
    });
  });
});
