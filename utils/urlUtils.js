function getUrlDetails(url) {
    let urlDetails = {
        project : "",
        type : "",
        id : ""
    }

    url = url.split('/')
    position = url.indexOf('github.com')

    urlDetails.project = url[position+2]
    urlDetails.type = url[position+3]
    urlDetails.id = url[position+4]

    return urlDetails;
}

module.exports = { getUrlDetails }