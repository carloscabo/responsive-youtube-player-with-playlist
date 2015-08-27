/*
  Youtube Player with Playlist (v2.0)
  https://github.com/carloscabo/responsive-youtube-player-with-playlist
  by
  Carlos Cabo (@putuko)
  Alejandro Menéndez (@frostcrazy)
*/

var RYPP = {

  // API Key
  api_key:  null,

  // YT Player object
  ytplayer: null,

  // DOM Elements
  DOM: {
    $el:      null,
    $playlc:  null, // Playlist container
    $items:   null, // Items <li> container
    $videoc:  null, // Video container
    $header:  null, // Playlist header
  },

  // Setting
  options: {
    autoplay: true,
    autonext: true
  },

  // Settings
  data: {
    // Playlist url
    ytplurl: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId={{PLAYLIST_ID}}&key={{YOUR_API_KEY}}',
    promises: null
  },

  init: function(el, options) {

    if (this.api_key === null) {
      console.log("Youtube API V3 requires a valid API KEY.\nFollow the instructions at: https://developers.google.com/youtube/v3/getting-started");
      return false;
    }

    var
      dat = this.data,
      D   = this.DOM,
      tag = document.createElement('script'),
      hID = document.getElementsByTagName('head')[0];

    D.$el = $(el);
    D.$playlc = D.$el.find('.RYPP-playlist');
    D.$items  = D.$playlc.find('.RYPP-items');
    D.$videoc = D.$el.find('#RYPP-video');
    D.$header = D.$playlc.find('header');

    // Add youtube API in HEAD
    // tag.src = "https://www.youtube.com/iframe_api";
    tag.src = "http://www.youtube.com/player_api";
    hID.appendChild(tag);

    // Playlist is empty?
    if ($.trim(D.$items.html()) === '') {
      $('<ol>').appendTo(D.$items);
    }
  },

  // Add video block to playlist
  add_vid_to_playl: function(vid, tit, aut, thu) {
    var
      D  = this.DOM;
    $('<li data-video-id="'+vid+'"><p class="title">'+tit+'<small class="author"><br>'+aut+'</small></p><img src="'+thu+'" class="thumb"></li>').appendTo(D.$items.find('ol'));
      // console.log(tit);
      // console.log(aut);
      // console.log(thu);
  },

  // Get video from data-ids
  get_from_playlist: function() {
    var
      plid = this.DOM.$el.data('playlist'),
      url  = this.data.ytplurl.replace('{{PLAYLIST_ID}}', plid).replace('{{YOUR_API_KEY}}', this.api_key),
      that = this;
    $.ajaxSetup ({cache: false});
    $.ajax(url, {
      context: this,
      dataType: 'json',
      crossDomain: true,
      error: function(){
        // Not successful
      },
      success: function(data){

        $.each(data.items, function(idx, item) {
          // Videos without thumbnail were deleted!
          if (typeof item.snippet.thumbnails !== 'undefined') {
            var
              vid  = item.snippet.resourceId.videoId,
              tit  = item.snippet.title,
              thu  = item.snippet.thumbnails.default.url;
            that.add_vid_to_playl(vid, tit, null, thu);
          }
        });
        that.start_playl();
      }
    });
  },

  // Get video from data-ids
  get_from_IDs: function () {
    var
      dat  = this.data,
      that = this,
      idsA = dat.$el.data('ids').split(',');

    dat.promises = idsA.map(this.get_vid_json);

    this.some(dat.promises).then(function(results){
      for(var i = 0; i < results.length; i++) {
        // console.log(results[i]); // log
        if (results[i].result.media$group.media$content !== undefined) {
          var
            vid  = results[i].video;
            tit  = results[i].result.title.$t,
            aut  = results[i].result.author[0].name.$t,
            thu  = results[i].result.media$group.media$thumbnail[0].url;
          that.add_vid_to_playl(vid, tit, aut, thu);
        }
      }
    });
  },

  // get a hook on when all of the promises resolve, some fulfill
  some: function(promises){
    var
      dat = this.data,
      d   = $.Deferred(), results = [],
      remaining = s.promises.length;
    for(var i = 0; i < s.promises.length; i++){
      dat.promises[i].then(function(res){
        results.push(res); // on success, add to results
      }).always(function(res){
        remaining--; // always mark as finished
        if(!remaining) {
          d.resolve(results);
          // console.log('Done!');
          RYPP.start_playl();
        }
      });
    }
    return d.promise(); // return a promise
  },

  get_vid_json: function (vid) {
    var u = RYPP.data.ytplurl.replace('{{vid}}', vid);
    return $.getJSON( u ).then(function(res){
      return {video:vid,result:res.entry};
    });
  },

  // All videos are supossed to be loaded, lest start the playlist
  start_playl: function() {
    var
      D = this.DOM,
      vid = null,
      that = this;

    // Click on playlist elemnts
    D.$items.find('li').on('click', function(e) {
      e.preventDefault();
      D.$items.find('li').removeClass('selected');
      $(this).addClass('selected');
      vid = $(this).data('video-id');
      // Call YT API function
      that.ytplayer.loadVideoById(vid);
    });

    // Select first if none
    if (D.$items.find('li.selected').length === 0) {
      D.$items.find('li').first().addClass('selected');
    }

    // Play first selected
    vid = D.$items.find('li.selected').data('video-id');
    // Call YT API function
    that.ytplayer.loadVideoById(vid);

  },

  add_API_player: function() {
    this.ytplayer = new YT.Player('RYPP-video-player', {
      // height: '390',
      // width: '640',
      playerVars: {
        // controls: 0,
        // showinfo: 0 ,
        // modestbranding: 1,
        wmode: "transparent"
      },
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange
      }
    });
  },

  // Ready to play
  onPlayerReady: function () {
    // Now we read the video list from playlist data or from IDs...
    if (RYPP.DOM.$el.attr('data-playlist')) {
      RYPP.get_from_playlist();
    } else if (RYPP.DOM.$el.attr('data-ids')) {
      RYPP.get_from_IDs();
    } else {
      RYPP.start_playl();
    }
  },

  // When video finish
  onPlayerStateChange: function(e){
    // Play next
    var next = null;
    if(e.data === 0 && this.options.autonext) {
      next = RYPP.DOM.$items.find('li.selected').next();
      if (next.length === 0) {
        next = RYPP.DOM.$items.find('li').first();
      }
      next.click();
    }
  }

// YPWPL
};

// YOUTUBE API
function onYouTubeIframeAPIReady() {
  RYPP.add_API_player();
}

// JQuery hook
$.fn.rypp = function(options) {
  return this.each(function() {
    RYPP.init(this, options);
  });
};
