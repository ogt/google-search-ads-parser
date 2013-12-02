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

  it('should parse serach results', function() {
    var res = parser.static.parseFile('./test/data/moto-g.html');
    assert.equal(res.results.length, 10);

    var first = res.results[0];
    assert.equal(first.Title, 'Moto G by Motorola - A Google Company');
    assert.equal(first.Type, 'plain');
    assert.equal(first.DisplayURL, 'www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html');
    assert.equal(first.Domain, 'www.motorola.com');
    assert.equal(first.CachedUrl.length > 1, true);
    assert.equal(first.URL, '/url?q=http://www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html&sa=U&ei=s7CWUo-oLseprAfNqoHoDg&ved=0CCAQFjAA&usg=AFQjCNF1GL1cZ3B_Q6UDYcQeDNkZb46TyQ');
    assert.equal(first.DirectUrl, 'http://www.motorola.com/us/consumers/moto-g/Moto-G/moto-g-pdp.html');
    assert.equal(!!first.Text.match(/Moto G is an exceptional phone at an exceptional price/), true);

    var second = res.results[1];
    assert.equal(second.Type, 'news');
  });

  it('should parse other file', function () {
    var res = parser.static.parseFile('./test/data/mentalist.html');

    [0, 1, 3, 4, 7].forEach(function(i) {
      assert.equal(res.results[i].Type, 'video');
      assert.equal(res.results[i].Text.length > 1, true);
      assert.equal(res.results[i].Domain.length > 1, true);
    });
  });

  it('should test parsing images', function() {
    var res = parser.static.parseFile('./test/data/example.html');

    var second = res.results[1];
    assert.equal(second.Title, 'Images for racoon');
    assert.equal(second.Type, 'images');
  });

  it('should parse sub links', function() {
    var res = parser.static.parseFile('./test/data/odesk.html');

    var first = res.results[0];
    //console.log(first.Extensions.Sitelinks);
    assert.equal(first.Extensions.Sitelinks.length, 6);
    assert.equal(first.Extensions.Sitelinks[0].Title, 'Log In');
    assert.equal(first.Extensions.Sitelinks[0].URL.length > 1, true);
    assert.equal(first.Extensions.Sitelinks[0].Text, "Log in and get to work. Remember me \nnext time. Forgot password? oDesk.");
    assert.equal(first.Extensions.Sitelinks[0].DirectURL, 'https://www.odesk.com/login');
  });

  it('should parse rating', function() {
    var res = parser.static.parseFile('./test/data/moto-g.html');
    var row = res.results[2];
    assert.equal(row.Extensions.Rating.stars, 5);
    assert.equal(row.Extensions.Rating.score, 10);
    assert.equal(row.Extensions.Rating.scoreOf, 10);
    assert.equal(row.Extensions.Rating.votes, 2);

    var row2 = res.results[9];
    assert.equal(row2.Extensions.Rating.stars, 5);
    assert.equal(row2.Extensions.Rating.score, 10);
    assert.equal(row2.Extensions.Rating.scoreOf, 10);
    assert.equal(row2.Extensions.Rating.reviewBy, 'Andrew Williams');
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