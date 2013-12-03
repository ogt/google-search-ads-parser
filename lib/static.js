var cheerio = require('cheerio');
var urlParser = require('url');
var querystring = require('querystring');
var fs = require('fs');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

// get direct url from search result url
var urlFromParams = function (url, key) {
  var u = urlParser.parse(url);
  return querystring.parse(u.query)[key];
};

var Parser = {

  parseFile: function (file, callback) {
    var data = fs.readFileSync(file).toString();
    var result = Parser.parseString(data);
    if (callback) callback(result);
    return result;
  },

  parseString: function (string) {
    var $ = this.$ = cheerio.load(string);

    var results = {
      query_string: $('#sbhost').val(),
      ads:          this.parseAds($)
    };

    return results;
  },

  parseAds: function ($) {
    var ads = [];
    var bottomAds = $('#res ~ #tads ol > li').toArray();
    $('#tads ol > li').each(function (i, el) {
      el = $(el);
      var ad = {
        Title: el.find('h3').text(),
        URL: el.find('h3 a').attr('href'),
        DisplayURL: el.find('cite').text(),
        Line1: el.find('cite').parent().next('span').text()
      };

      this.adPosition(bottomAds, el, ad);
      ad.Domain = ad.DisplayURL.match(/^([^\/]+)/)[1];

      ad.DirectURL = urlFromParams(ad.URL, 'adurl');
      if (ad.DirectURL.indexOf('http://pixel.everesttech.net') === 0) {
        ad.DirectURL = urlFromParams(ad.DirectURL, 'url');
      }

      ad.Extensions = {};
      this.parseAdSiteLinks(el, ad, $);
      this.parseAdSocial(el, ad, $);
      this.parseAdRating(el, ad, $);

      ads.push(ad);
    }.bind(this));

    return ads;
  },

  adPosition: function (bottomAds, el, ad) {
    ad.IsTop = bottomAds.indexOf(el[0]) == -1;
    ad.IsBottom = !ad.IsTop;
    ad.IsSide = false; // in rich version only
    ad.Position = el.prevAll().length + 1;
  },

  parseAdSiteLinks: function(el, ad, $) {
    if (el.find('table.slk td a, div.osl > a').length) {
      ad.Extensions.Sitelinks = [];
      el.find('table.slk td a, div.osl > a').each(function(i, link) {
        link = $(link);

        var siteLink = {
          Title: link.text(),
          URL: link.attr('href'),
          DirectURL: urlFromParams(link.attr('href'), 'adurl')
        };

        if (siteLink.DirectURL.indexOf('http://pixel.everesttech.net') === 0) {
          siteLink.DirectURL = urlFromParams(siteLink.DirectURL, 'url');
        }

        ad.Extensions.Sitelinks.push(siteLink);
      });
    }
    ad.Extensions.HasSiteLinks = !!ad.Extensions.Sitelinks;
  },

  parseAdSocial: function(el, ad) {
    if (el.find('div.soc').length) {
      var count = el.find('div.soc').text().match(/has ([\d,]+) followers/)[1];
      count = parseInt(count.replace(/[^\d]/g, ''), 10);
      ad.Extensions.Social = {
        count: count
      };
    }
    ad.Extensions.HasSocial = !!ad.Extensions.Social;
  },

  parseAdRating: function(el, ad) {
    if (el.find('span.star').length) {
      var rating = el.find('span.star').parent();
      var count = parseInt(rating.text().match(/([\d,]+)/)[1].replace(/[^\d]/g, ''), 10);
      var stars = parseInt(rating.find('span.star span').css('width'), 10) / 65 * 5;
      ad.Extensions.Rating = {
        rating: stars,
        count: count
      };
    }
    ad.Extensions.HasRating = !!ad.Extensions.Rating;
  }
};

exports.static = Parser;