/*
  Youtube Player with Playlist (v2.0)
  https://github.com/carloscabo/responsive-youtube-player-with-playlist
  by Carlos Cabo (@putuko)
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
    autonext: true,
    loop: true,
    mute: false
  },

  // Settings
  data: {
    // Playlist url
    ytapi: {
      playlist: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId={{RESOURCES_ID}}&key={{YOUR_API_KEY}}',
      videolist: 'https://www.googleapis.com/youtube/v3/videos?part=snippet&maxResults=50&id={{RESOURCES_ID}}&key={{YOUR_API_KEY}}'
    },
    firsttime: true
  },

  init: function(el, options) {

    if (this.api_key === null) {
      console.log("Youtube API V3 requires a valid API KEY.\nFollow the instructions at: https://developers.google.com/youtube/v3/getting-started");
      return false;
    }

    // Merge initial options
    if (typeof options !== 'undefined') {
      $.each( options, function( key, value ) {
        if (typeof this.options[key] !== 'undefined') {
          this.options[key] = value;
        }
      });
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
  },

  // Get video from data-ids
  get_videos_from: function(kind, resources_id) {
    var
      that = this,
      url  = this.data.ytapi[kind].replace('{{RESOURCES_ID}}', resources_id).replace('{{YOUR_API_KEY}}', this.api_key);

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
              vid  = null,
              tit  = item.snippet.title,
              aut  = item.snippet.channelTitle,
              thu  = item.snippet.thumbnails.default.url;
            if (typeof item.snippet.resourceId === 'undefined') {
              // ID de un vídeo
              vid = item.id;
            } else {
              // Elemento de playlist
              vid =  item.snippet.resourceId.videoId;
            }
            that.add_vid_to_playl(vid, tit, aut, thu);
          }
        });
        that.start_playl();
      }
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
    // that.ytplayer.player.pauseVideo();

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
      RYPP.get_videos_from(
        'playlist',
        RYPP.DOM.$el.attr('data-playlist')
      );
    } else if (RYPP.DOM.$el.attr('data-ids')) {
      var vl = RYPP.DOM.$el.attr('data-ids');
      // Clean spaces
      vl = ($.map(vl.split(','),$.trim)).join(',');
      RYPP.get_videos_from(
        'videolist',
        vl
      );
    } else {
      RYPP.start_playl();
    }
  },

  // When video finish
  onPlayerStateChange: function(e){

    // On video loaded?
    if(e.data === -1 && RYPP.data.firsttime) {
      if(!RYPP.options.autoplay) {
        RYPP.ytplayer.pauseVideo();
      }
      if(RYPP.options.mute) {
        RYPP.ytplayer.mute();
      }
    }

    // Play next
    var next = null;
    if(e.data === 0 && RYPP.options.autonext) {
      next = RYPP.DOM.$items.find('li.selected').next();
      if (next.length === 0 && RYPP.options.loop) {
        next = RYPP.DOM.$items.find('li').first();
      }
      next.click();
    }

    // First video
    RYPP.data.firsttime = false;
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
