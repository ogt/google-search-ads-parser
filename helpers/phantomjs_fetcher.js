var args = require('system').args;

var url = phantom.args[0];
/*
url = 'https://www.google.com/search?q=indonesia+flight+ticket&aqs=chrome..69i57.313j0j9&sourceid=chrome&ie=UTF-8';
url = 'https://www.google.com/search?q=Maya+Ubud+Resort&btnG=Search&aqs=chrome..69i57.5827j0j1&sei=ElmbUuXsBoW3rAf0v4GQDw&gbv=2'
url = 'https://www.google.com/search?q=hotel+jakarta&oq=hotel+jakarta&aqs=chrome..69i57.162j0j9&sourceid=chrome&ie=UTF-8'
url = 'https://www.google.com/search?q=intercontinental+hotel+jakarta&oq=intercontinental+hotel+jakarta&aqs=chrome..69i57.241j0j9&sourceid=chrome&ie=UTF-8'
*/

var page = require('webpage').create();

page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36";
page.settings.loadImages = false;

if (phantom.args.indexOf('mobile') != -1) {
  page.settings.userAgent = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like " +
    "Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5";
  page.viewportSize = {width: 640, height: 960};
  page.zoomFactor = 1.5;
}

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

phantom.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      //msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + 
      //  t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
    });
  }
  log(msgStack.join('\n'));
  phantom.exit(1);
};

var getResults = function () {
  
};

var getAds = function (parseSiteLinks, parseSocial, parseRating, parseReview) {
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

    parseSiteLinks(el, ad);
    parseSocial(el, ad);
    parseRating(el, ad);
    parseReview(el, ad);
    if (el.find('.ads-calltracking').length) {
      if (!ad.Extensions) ad.Extensions = {};
      ad.Extensions.CallNumber = el.find('.ads-calltracking').text();
      ad.Extensions.HasCallExtension = true;
    }

    return ad;
  });
};

var parseSiteLinks = function (el, ad) {
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
};

var parseSocial = function (el, ad) {
  if (el.find('.ads-social').length) {
    if (!ad.Extensions) ad.Extensions = {};

    var count = el.find('.ads-social').text().match(/has ([\d,]+) followers/)[1];
    count = parseInt(count.replace(/[^\d]/g, ''), 10);
    ad.Extensions.Social = {
      count: count
    };
    ad.Extensions.HasSocial = true;
  }
};

var parseRating = function (el, ad) {
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
};

var parseReview = function (el, ad) {
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
};

function savePage (page, file) {
  var h = page.evaluate(function () {
    $('script').remove();
    $(document.head).append($('<meta>').attr('charset', 'utf-8'));
    //return "<html>" + document.head.outerHTML + document.body.outerHTML + "</html>";
  });

  var content = page.content;
  content = content.replace(/url\('\/([^\/])/g, "url('https://www.google.com/$1");
  content = content.replace(/url\(\/([^\/])/g, "url(https://www.google.com/$1");
  content = content.replace(/url\("\/([^\/])/g, "url(\"https://www.google.com/$1");
  content = content.replace(/url\(\/\//g, "url(http://");
  require('fs').write(file, content, 'w');
}

page.onError = function(msg, trace) {
  console.log(msg);
  log(trace);
};

/* */
url = url.replace(/^('|")?(.+?)('|")?$/, "$2");
if (!url.match(/^https?\/\//)) {
  var relativeScriptPath = require('system').args[0];
  var fs = require('fs');
  var absoluteScriptPath = fs.absolute(relativeScriptPath);
  var absoluteScriptDir = absoluteScriptPath.substring(0, absoluteScriptPath.lastIndexOf('/'));

  url = 'file:///' + absoluteScriptDir + '/../' + url;
}
/* */

//url = 'https://www.google.com/search?q=indonesia+flight+ticket&oq=indonesia+flight+ticket&aqs=chrome..69i57j69i61l2.210j0j9&sourceid=chrome&ie=UTF-8';
//console.log(url);
page.open(url, function(status) {
  page.injectJs('./helpers/zepto.js');
  var result = {results: [], ads: []};

  result.query_string = page.evaluate(function () {
    return $('body input[type=text]').val();
  });

  result.ads = page.evaluate(getAds, parseSiteLinks, parseSocial, parseRating, parseReview);

  //if (url.match(/https?:\/\//)) savePage(page, 'test/rich_data/1.html');
  //page.render("test.png", { format: "png" });

  log(result);
  phantom.exit();
});