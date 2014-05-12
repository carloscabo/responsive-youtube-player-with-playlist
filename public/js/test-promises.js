var
  results  = {},
  promises = [];

$(document).ready(function() {
  // la magia aquí

  var
    vids = [
    'ozj2-bnTL3s',
    'EAZ4Tlt8MQ4',
    'Xn9o7cxqVoA',
    'xxx',
    'xxx',
    'xxx',
    'xxx'
  ],
  url = 'http://gdata.youtube.com/feeds/api/videos/{{vid}}?v=2&alt=json';


  $.each(vids, function(idx, vid){
    var u = url.replace('{{vid}}', vids[idx]);
    promises.push($.getJSON( u ).done(function(data) {
      results[vid] = data.entry;
    }));
  });

  $.when.apply($, promises).done(function(){
    console.log(promises);
  });

});
