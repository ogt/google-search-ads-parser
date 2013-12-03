/* global it */
/* global describe */

var assert = require("assert");
var should = require('should');
var parser = require("../index");

describe('parser.static', function() {
  this.timeout(15000);

  it('should parse query_string', function() {
    var res = parser.static.parseFile('./test/data/example.html');
    assert.equal(res.query_string, 'racoon');
  });

  it('should parse ads', function() {
    var res = parser.static.parseFile('./test/data/moto-g.html');

    res.ads.should.have.length(2);
    res.ads[0].Position.should.be.eql(1);
    res.ads[0].IsTop.should.be.true;
    res.ads[0].IsBottom.should.be.false;

    res.ads[1].Position.should.be.eql(1);
    res.ads[1].IsTop.should.be.false
    res.ads[1].IsBottom.should.be.true
  });

  it('should parse ads extension', function() {
    var res = parser.static.parseFile('./test/data/hotel.html');

    var first = res.ads[0];
    first.Extensions.Social.should.be.eql({ count: 703749 });

    first.Extensions.Rating.should.be.eql({ count: 1400, rating: 4.538461538461538 });

    first.Extensions.Sitelinks.should.have.length(4);
    first.Extensions.Sitelinks[0].Title.should.be.eql('Hotel Reviews');

    res = parser.static.parseFile('./test/data/android.html');
    first = res.ads[0];
    first.Extensions.Sitelinks.should.have.length(4);
    first.Extensions.Sitelinks[0].Title.should.be.eql('New Samsung Galaxy');
    first.Extensions.Sitelinks[0].DirectURL.should.be.eql('http://www.lazada.co.id/beli-handphone-tablet/samsung');
  });
});