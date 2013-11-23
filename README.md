google-search-parser
====================

Parses into a json structure results and ads of a google search page

--
This module takes as input the HTML from a google search results and return a json structure of the following form
```
query_string : "",
ads : [
    {
        Domain : '', // e.g. ebay.com or amazon.com
        Title : '', 
        Line1 : '',
        Line2 : '',  // if just one line enter it here either wise concat
        line1and2 : 

        DisplayURL : '',
        URL : '',
        IsTop3 : true,
        IsBottom : false
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
                Stars : 5
            },
            SiteLinks : [
                {
                    Title : '',
                    Url : ''
                }
                ...
            ],
            HasCallExtension : True/False
            HasLocation : True/False
            HasMobileApp : True/False
            HasDeal : True/False
            HasSocial : True/False
            HasSiteLinks : True/False
            HasRatings : True/False
            HasReviews :True/False
         }   

    },
    ...
]
results : [
    {
        Domain : 
        Title
        URL
        Text
        Extensions : {
           PublishedBy : { // http://cl.ly/1D3J0F262o2E
               Photo :
               Who :
               Date :
               Followers :
           }
           Sitelinks : [   // http://cl.ly/3l0H1U390R0b
               {
                   Title
                   URL
                   Text
               }
               ..
               
           ]
        }
        
    }
    ...
]
```
