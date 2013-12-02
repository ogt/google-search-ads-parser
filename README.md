google-search-ads-parser
====================
[![Build Status](https://travis-ci.org/ogt/google-search-ads-parser.png)](https://travis-ci.org/ogt/google-search-ads-parser)

Parses  ads, results from the HTML of  google search page results into json.

### Usage:

```javascript
  var parser = require('google-search-ads-parser')
  parser.parseFile('./test/data/example.html');
  parser.parseFile('./test/data/moto-g.html');
    console.log(result);
  });

  // slower but ads complete data
  parser.rich().parseUrl('test/rich_data/1.html', function(data) {
    console.log(data);
  });

```

### Result format:

--
This module takes as input the HTML from a google search results and return a json structure of the following form
```
query_string : "",
ads : [
    {
        Domain : '', // e.g. ebay.com or amazon.com  (the domain portion of the display url)
        Title : '',
        Line1 : '',
        Line2 : '',  // If just one line - split by ' - ' to produce line 1 and line 2
        DisplayURL : '',
        URL : '',
        Position : 1, // position 1 means that this is ad is the very first one from top to bottom
        IsTop : true,
        IsBottom : false,
        Extensions : {  // http://cl.ly/0h0f2Y1h0d0g
            Review : {
                Quote : '',
                Author : '',
                Url : '',
            },
            Social : {
                Count : 100
            }
            Ratings : {
                Count : 999,
                Rating : 8.3
            },
            SiteLinks : [
                {
                    Title : '',
                    Url : ''
                }
                ...
            ],
            HasCallExtension : True/False
            HasSocial : True/False
            HasSiteLinks : True/False
            HasRatings : True/False
            HasReviews :True/False
         }

    },
    ...
]
```
