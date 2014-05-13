var url = 'http://gdata.youtube.com/feeds/api/videos/{{vid}}?v=2&alt=json';

function getVideo(vid){
    var u = url.replace('{{vid}}', vid);
    return $.getJSON( u ).then(function(res){
         return {video:vid,result:res.entry};
    });
}
var promises = ['ozj2-bnTL3s','EAZ4Tlt8MQ4',"doesn'texist"].map(getVideo);

some(promises).then(function(results){
  for(var i = 0; i < results.length; i++) {
    console.log(results[i]); // log
  }
});


// get a hook on when all of the promises resolve, some fulfill
function some(promises){
  var d = $.Deferred(), results = [];
  var remaining = promises.length;
  for(var i = 0; i < promises.length; i++){
    promises[i].then(function(res){
      results.push(res); // on success, add to results
    }).always(function(res){
      remaining--; // always mark as finished
      if(!remaining) {
        d.resolve(results);
        console.log('Done!');
      }
    })
  }
  return d.promise(); // return a promise
}
