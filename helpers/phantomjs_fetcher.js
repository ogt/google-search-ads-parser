var args = require('system').args;

var page = require('webpage').create();

page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_0) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/32.0.1677.0 Safari/537.36";
page.settings.loadImages = false;

if (phantom.args.indexOf('mobile') != -1) {
  page.settings.userAgent = "Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_3_2 like " +
    "Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5";
  page.settings.userAgent = "Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus " +
    "One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
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



function getPageContent (page) {
  page.evaluate(function () {
    $('script').remove();
    $(document.head).append($('<meta>').attr('charset', 'utf-8'));
  });

  var content = page.content;
  content = content.replace(/url\('\/([^\/])/g, "url('https://www.google.com/$1");
  content = content.replace(/url\(\/([^\/])/g, "url(https://www.google.com/$1");
  content = content.replace(/url\("\/([^\/])/g, "url(\"https://www.google.com/$1");
  content = content.replace(/url\(\/\//g, "url(http://");

  return content;
}

page.onError = function(msg, trace) {
  console.log(msg);
  log(trace);
};

/* *\/
if (!url.match(/^https?\/\//)) {
  var relativeScriptPath = require('system').args[0];
  var fs = require('fs');
  var absoluteScriptPath = fs.absolute(relativeScriptPath);
  var absoluteScriptDir = absoluteScriptPath.substring(0, absoluteScriptPath.lastIndexOf('/'));

  url = 'file:///' + absoluteScriptDir + '/../' + url;
}
/* */

var url = phantom.args[0];
url = url.replace(/^('|")?(.+?)('|")?$/, "$2");

page.open(url, function(status) {
  page.injectJs('./helpers/zepto.js');

  page.render("test.png", { format: "png" });

  log(getPageContent(page));
  phantom.exit();
});