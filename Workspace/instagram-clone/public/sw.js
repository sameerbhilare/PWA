/*
    The scope by default always is the folder the service worker sits in. 
    So if we add it to the /js folder, the service worker will only apply to HTML pages inside that folder. 
    (Here /js is a wrong place as it will not have any html pages, but will have only .js files.)

    We typically add the service worker file in the root folder 
    so that it applied to all HTML pages in the application. E.g. /public.
*/
