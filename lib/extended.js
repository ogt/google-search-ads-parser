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
      results:      this.parseResults($),
      ads:          this.parseAds($)
    };

    return results;
  },

  parseResults: function ($) {
    return [];
  },

  parseAds: function($) {
    var _this = this;
    var bottomAds = $('#res ~ #bottomads .ads-container-list > li');
    return $('.ads-container-list > li').map(function(i, el) {
      el = $(el);
      var ad = {
        Title: el.find('h3').text(),
        URL: el.find('h3 a').attr('href'),
        DisplayURL: el.find('cite').text(),
        Line1: el.find('.ads-creative').text(),
        //Line2: el.find('.ads-creative').next().text(),
        IsTop: !bottomAds.closest('#bottomads').length,
        IsBottom: !!bottomAds.closest('#bottomads').length
      };

      ad.Domain = ad.DisplayURL.match(/^([^\/]+)/)[1];

      _this.parseSiteLinks(el, ad, $);
      _this.parseSocial(el, ad, $);
      _this.parseRating(el, ad, $);
      _this.parseReview(el, ad, $);

      if (el.find('.ads-calltracking').length) {
        if (!ad.Extensions) ad.Extensions = {};
        ad.Extensions.CallNumber = el.find('.ads-calltracking').text();
        ad.Extensions.HasCallExtension = true;
      }

      return ad;
    });
  },

  parseSiteLinks: function (el, ad, $) {
    if (el.find('.ads-slk-oneline').length) {
      if (!ad.Extensions) ad.Extensions = {};
      ad.Extensions.SiteLinks = el.find('.ads-slk-oneline a').map(function(i, link) {
        link = $(link);
        return {
          Title: link.text(),
          URL: link.attr('href')
        };
      });
      ad.Extensions.HasSiteLinks = true;
    }
  },

  parseSocial: function (el, ad, $) {
    if (el.find('.ads-social').length) {
      if (!ad.Extensions) ad.Extensions = {};

      var count = el.find('.ads-social').text().match(/has ([\d,]+) followers/)[1];
      count = parseInt(count.replace(/[^\d]/g, ''), 10);
      ad.Extensions.Social = {
        count: count
      };
      ad.Extensions.HasSocial = true;
    }
  },

  parseRating: function (el, ad, $) {
    var css = '.ads-seller-ratings-inline, .ads-seller-ratings-oneline';
    if (el.find(css).length) {
      var rating = el.find(css);
      var count = parseInt(rating.text().match(/([\d,]+)/)[1].replace(/[^\d]/g, ''), 10);

      if (!ad.Extensions) ad.Extensions = {};
      ad.Extensions.Rating = {
        rating: parseInt(rating.find('.ads-ratings-stars-filled').css('width'), 10) / 65 * 5,
        count: count
      };
      ad.Extensions.HasRatings = true;
    }
  },

  parseRating: function (el, ad, $) {
    var css = '.ads-seller-ratings-inline, .ads-seller-ratings-oneline';
    if (el.find(css).length) {
      var rating = el.find(css);
      var count = parseInt(rating.text().match(/([\d,]+)/)[1].replace(/[^\d]/g, ''), 10);

      if (!ad.Extensions) ad.Extensions = {};
      ad.Extensions.Rating = {
        rating: parseInt(rating.find('.ads-ratings-stars-filled').css('width'), 10) / 65 * 5,
        count: count
      };
      ad.Extensions.HasRatings = true;
    }
  },

  parseReview: function (el, ad, $) {
    if (el.find('.ads-apa-pad').length) {

      var content = el.find('.ads-apa-pad');
      if (!ad.Extensions) ad.Extensions = {};
      ad.Extensions.Review = {
        Quote: content.text().match(/“(.+)”/)[1],
        Author: content.find('a.ads-apa-link').text(),
        URL: content.find('a.ads-apa-link').attr('href')
      };
      ad.Extensions.HasReviews = true;
    }
  }
};

exports.extended = Parser;