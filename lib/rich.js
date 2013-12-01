var childProcess = require('child_process');
var phantomjs = require('phantomjs');
var path = require('path');

var RichParser = {
  rich: true,
  //phantomjsOptions: {
  //  'load-images': 'no',
  //  'ignore-ssl-errors': 'yes'
  //},

  //userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) AppleWebKit/537.36" +
  //  " (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36",

  parseUrl: function (url, callback) {
    var binPath = phantomjs.path;

    var childArgs = [
      path.join(__dirname, '../helpers/phantomjs_fetcher.js'),
      '"' + url + '"'
    ];

    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
      /*
      console.log(err, stdout, stderr);
      stdout.split("\n").forEach(function(l) {
        console.log(l);
      })

      stderr.split("\n").forEach(function(l) {
        console.log(l);
      })
      */
      var data = JSON.parse(this.replaceNbsps(stdout));
      callback(data);
      // handle results
    }.bind(this));
  },

  replaceNbsps: function (str) {
    var re = new RegExp(String.fromCharCode(160), "g");
    return str.replace(re, " ");
  }
  
};

exports.parser = RichParser;