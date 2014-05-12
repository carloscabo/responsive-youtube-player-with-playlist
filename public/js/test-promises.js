var results  = {};
var promises = [];
$(document).ready(function() {
  // la magia aquí

  $.whenall = function(arr) {
    return $.when.apply($, arr).pipe(function() {
      return Array.prototype.slice.call(arguments);
    });
  };

  var
    vids = [
    'ozj2-bnTL3s',
    'EAZ4Tlt8MQ4',
    'Xn9o7cxqVoA','xxx','xxx','xxx','xxx','xxx'
  ],
  url = 'http://gdata.youtube.com/feeds/api/videos/{{vid}}?v=2&alt=json',
  promise = null;


  $.each(vids, function(idx, vid){
    var u = url.replace('{{vid}}', vids[idx]);
    $.ajaxSetup({cache: false});
    $.getJSON( u ).done(function(data) {
      promises.push(this);
      results[vid] = data.entry;
    }).fail(function(){
      //
    });
  });

  $.when.apply($, promises).then(function(){
    console.log('éxito');
    console.log(results);
  });


});
