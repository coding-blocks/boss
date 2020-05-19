function getUrlDetails(url) {
    let urlDetails = {
        project : "",
        type : "",
        id : ""
    }

    if(url.lastIndexOf('pull') === -1)
        urlDetails.type = "issue";
    else if(url.lastIndexOf('issues') > url.lastIndexOf('pull'))
        urlDetails.type = "issue";
    else
        urlDetails.type = "pull";

    let idPart = url.slice(url.lastIndexOf(urlDetails.type)+(urlDetails.type).length,url.length)
    urlDetails.id = idPart.match(/\d+/)[0];

    url = url.slice(0,url.lastIndexOf(urlDetails.type));
    url = url.slice(url.indexOf("github.com/coding-blocks")+24,url.length);

    urlDetails.project = url.replace(new RegExp('/', 'g'), '');

    return urlDetails;
}

module.exports = { getUrlDetails }