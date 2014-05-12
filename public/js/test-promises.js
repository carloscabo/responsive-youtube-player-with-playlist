var
  results  = {},
  promises = [];

$(document).ready(function() {

  var
    vids = [
    'ozj2-bnTL3s',
    'EAZ4Tlt8MQ4',
    'Xn9o7cxqVoA'
    // ,'this-videoid-dont-exists'
  ],
  url = 'http://gdata.youtube.com/feeds/api/videos/{{vid}}?v=2&alt=json';

  $.each(vids, function(idx, vid){
    var
      u = url.replace('{{vid}}', vids[idx]),
      p = null;

    p = $.getJSON( u ).done(function(data) {
      results[vid] = data.entry;
    });

    promises.push(p);
  });

  $.when.apply($, promises).done(function(){
    console.log(results);
  });

});
