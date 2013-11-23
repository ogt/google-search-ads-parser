google-search-parser
====================

Parses into a json structure results and ads of a google search page

--
This module takes as input the HTML from a google search results and return a json structure of the following form
ads : [
    {
        Domain : '',
        Title : '',
        Line1 : '',
        Line2 : '',
        DisplayURL : '',
        URL : '',
        SiteLinks : [
            {
                Title : '',
                Url : ''
            }
            ...
        ],
        
        Quote : {
            Quote : '',
            Author : '',
            Url : '',
        },
        GooglePLus : {
            Displayed : true,
            Count : 100
        }
        Review
        IsTop3 : true,
        IsBottom : false

    }
]
results :
