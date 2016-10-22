const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

var options = {
  host: 'rarepepedirectory.com',
  path: '/json/pepelist.json'
};

callback = function(response) {
  var str = ''

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk
  })

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    fs.writeFileSync('./pepe_directory/pepelist.json', str)
    var ob = JSON.parse(str)

    for (x in ob) {
      download(x, ob[x])
    }
  })
}

http.request(options, callback).end()

var downloadQueue = []
var reqsStarted = false
function download(name, url) {
  downloadQueue.push({name, url})

  if (!reqsStarted) {
    fetchOne()
    reqsStarted = true
  }
}

function fetchOne() {
  setTimeout(function() {
    if (downloadQueue.length > 0) {
      var curDl = downloadQueue.splice(0,1)[0]
      var udl = url.parse(curDl.url)

      console.log("> Downloading '" + curDl.name + "' as a " + path.extname(udl.path))



      http.request(udl, function(response) {
        var data = new Buffer(0)

        response.on('data', function (chunk) {
          data = Buffer.concat([data, chunk])
        })

        response.on('end', function () {
          fs.writeFileSync('./pepe_directory/' + curDl.name + path.extname(udl.path), data)
          fetchOne()
        })
      }).end()
    }
  }, 100)
}