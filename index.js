var cheerio = require('cheerio');
var fs = require('fs');
var needle = require('needle');
var urlParser = require('url');
var querystring = require('querystring');

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

var Parser = {
  defaultHeaders: {
    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36"
  },

  parseFile: function (file, callback) {
    var data = fs.readFileSync(file).toString();
    var result = Parser.parseString(data);
    if (callback) callback(result);
    return result;
  },

  parseUrl: function (url, callback) {
    needle.get(url, this.defaultHeaders, function (error, response, body) {
      var result = Parser.parseString(body);
      if (callback) callback(result);
    });
  },

  parseWords: function (searchable, callback) {
    var query = {output: "search", sclient: "psy-ab", q: searchable, gbv: "1" }; //, sei: "CpyWUqHYO8ParAezgoDgDw" };
    var url = "https://www.google.com/search?" + querystring.stringify(query);
    this.parseUrl(url, callback);
  },

  parseString: function (string) {
    var $ = this.$ = cheerio.load(string);
    var result = {results: [], ads: []};

    result.query_string = $('#sbhost').val();

    $('#ires > ol > li').each(function(i, el) {
      el = $(el);

      var type = this.detectType(el);

      var row = {
        Title: el.find('h3').text(),
        DisplayURL: el.find('cite').text(),
        URL: el.find('h3 a').attr('href'),
        CachedUrl: el.find('a:contains("Cached")').attr('href'),
        SimularUrl: el.find('a:contains("Similar")').attr('href'),
        Text: this.scrapText(el, type),
        Type: type,
        Extensions: []
      };

      if (row.Type != 'images') {
        row.DirectUrl = this.urlFromParams(row.URL, 'q');
        row.Domain = urlParser.parse(row.DirectUrl).host;
      }

      if (row.Type == 'plain') this.parseSiteLinks(row, el);

      result.results.push(row);

    }.bind(this));

    return result;
  },

  // get text for search slippet
  scrapText: function (el, type) {
    if (type == 'plain') {
      var content = el.find('h3 + div > span');
      var text = content.text();
      return text.replace(/^(\d+ days? ago|\d\d? hours? ago|\d\d? \w{3,4} \d{4}) ...\s*/, '');
    }

    if (type == 'video') {
      content = el.find('cite + span');
      content.find('> span').remove();
      return content.text();
    }

    if (type == 'news') {
      var content = el.find('td > div > div > cite').parent().nextAll('div');
      return content.text();
    }
  },

  // type of result
  // plain, youtube, images, news
  detectType: function (el) {
    if (el.find('cite:contains("www.youtube.com/watch")').length || el.find('td > div > a > div').text().match(/►.*/)) {
      return 'video';
    } else if (el.find('h3 a[href^="/images?"]').length) {
      return 'images';
    } else if (el.find('a[href*="tbm=nws"]').length) {
      return 'news';
    } else {
      return 'plain';
    }
  },

  parseSiteLinks: function (row, el) {
    var table = el.find('table table');
    if (table.length) {
      var siteLinks = [];

      table.find('td:not([colspan]) > div').each(function(i, cell) {
        cell = this.$(cell);
        var link = {
          Title: cell.find('h3').text(),
          URL: cell.find('h3 a').attr('href'),
          Text: cell.find('div div').text()
        };

        link.DirectURL = this.urlFromParams(link.URL, 'q');
        siteLinks.push(link);
      }.bind(this));

      row.Extensions.Sitelinks = siteLinks;
    }
  },

  // get direct url from search result url
  urlFromParams: function (url, key) {
    var u = urlParser.parse(url);
    return querystring.parse(u.query)[key];
  },
};

for (var i in Parser) {
  exports[i] = Parser[i];
}
