/*
  Youtube Player with Playlist (v2.1)
  https://github.com/carloscabo/responsive-youtube-player-with-playlist
  by Carlos Cabo (@putuko)
*/

var RYPP = (function($, undefined) {

  function Rypp(el, api_key, options) {

    if (typeof api_key === 'undefined') {
      console.log("Youtube API V3 requires a valid API KEY.\nFollow the instructions at: https://developers.google.com/youtube/v3/getting-started");
      return false;
    } else {
      this.api_key = api_key;
    }

    // DOM Elements
    this.DOM = {};

    // Default settings
    this.options = {
      autoplay: true,
      autonext: true,
      loop: true,
      mute: false
    };

    // Settings
    this.data = {
      // Playlist url
      ytapi: {
        playlist: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId={{RESOURCES_ID}}&key={{YOUR_API_KEY}}',
        videolist: 'https://www.googleapis.com/youtube/v3/videos?part=snippet&maxResults=50&id={{RESOURCES_ID}}&key={{YOUR_API_KEY}}'
      },
      firsttime: true
    };

    // Initialize
    this.init(el, options);
  }

  // Prototype for the instance
  Rypp.prototype = {

    init: function(el, options) {

      // Merge initial options
      if (typeof options !== 'undefined') {
        $.each( options, function( key, value ) {
          if (typeof this.options[key] !== 'undefined') {
            this.options[key] = value;
          }
        });
      }

      // YT Player object
      this.ytplayer = null;

      // DOM elements
      this.DOM.$el = $(el);
      this.DOM.$playlc = $(el).find('.RYPP-playlist');
      this.DOM.$items  = $(el).find('.RYPP-items');
      this.DOM.$videoc = $(el).find('.RYPP-video');

      // Unique player ID
      this.data.player_uid = 'RYPP-vp-'+(Math.random().toString(16).substr(2,8));
      this.DOM.$el.find('.RYPP-video-player').attr('id',this.data.player_uid);

      // Link JS only once
      if (typeof YT === 'undefined') {
        var
          tag = document.createElement('script'),
          hID = document.getElementsByTagName('head')[0];
        // Add youtube API in HEAD
        // tag.src = "https://www.youtube.com/iframe_api";
        tag.src = "http://www.youtube.com/player_api";
        hID.appendChild(tag);
      }

      // Empty playlist
      this.DOM.$items.html('').append($('<ol>'));
    },

    onYouTubeIframeAPIReady: function() {
      this.populatePlaylist();
    },

    populatePlaylist: function() {
      // Now we read the video list from playlist data or from IDs...
      if (this.DOM.$el.attr('data-playlist')) {
        this.get_videos_from(
          'playlist',
          this.DOM.$el.attr('data-playlist')
        );
      } else if (this.DOM.$el.attr('data-ids')) {
        var vl = this.DOM.$el.attr('data-ids');
        // Clean spaces
        vl = ($.map(vl.split(','),$.trim)).join(',');
        this.get_videos_from(
          'videolist',
          vl
        );
      }
    },

    addAPIPlayer: function() {
      var that = this;

      this.ytplayer = new YT.Player(this.data.player_uid, {
        // height: '390',
        // width: '640',
        playerVars: {
          // controls: 0,
          // showinfo: 0 ,
          // autoplay: 0,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          wmode: 'transparent'
        },
        events: {
          'onReady': function(){
            that.onPlayerReady();
          },
          'onStateChange': function(e){
            that.onPlayerStateChange(e);
          },
          'onError': function(e) {
            console.log(e);
          }
        }
      });
    },

    // Ready to play
    onPlayerReady: function() {
      this.start_playl();
    },

    // When video finish
    onPlayerStateChange: function(e){

      if (typeof e !== 'undefined') {

        // On video loaded?
        if(e.data === -1 && this.data.firsttime) {
          if(!this.options.autoplay) {
            this.ytplayer.pauseVideo();
          }
          if(this.options.mute) {
            this.ytplayer.mute();
          }
        }

        // Play next
        var next = null;
        if(e.data === 0 && this.options.autonext) {
          next = this.DOM.$items.find('li.selected').next();
          if (next.length === 0 && this.options.loop) {
            next = this.DOM.$items.find('li').first();
          }
          next.click();
        }

        // First video
        this.data.firsttime = false;

      }

    },

    // Get video from data-ids or playlist
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
          that.addAPIPlayer();
        }
      });
    },

    // All videos are supossed to be loaded
    // lets start the playlist
    start_playl: function() {

      var
        D = this.DOM,
        vid = null,
        that = this;

      // Click on playlist elemnts
      D.$items.on('click', 'li', function(e) {
        e.preventDefault();
        D.$items.find('li').removeClass('selected');
        $(this).addClass('selected');
        vid = $(this).data('video-id');
        // Call YT API function
        that.ytplayer.loadVideoById(vid);
      });

      // Select first if none
      if (D.$items.find('li.selected').length === 0) {
        D.$items.find('li').first().click();
      }
    },

    // Add video block to playlist
    add_vid_to_playl: function(vid, tit, aut, thu) {
      var
        D  = this.DOM;
      $('<li data-video-id="'+vid+'"><p class="title">'+tit+'<small class="author"><br>'+aut+'</small></p><img src="'+thu+'" class="thumb"></li>').appendTo(D.$items.find('ol'));
    },

  }; // prototypes

  return Rypp;

}(jQuery));

// Here will be stored all the instances of RYPP in the page
var RYPP_instances = [];

// YOUTUBE API CALLBACK
function onYouTubeIframeAPIReady() {
  for (var i = RYPP_instances.length - 1; i >= 0; i--) {
    RYPP_instances[i].onYouTubeIframeAPIReady();
  }
}

// JQuery hook
$.fn.rypp = function(options) {
  return this.each(function() {
    RYPP_instances.push(new RYPP(this, options));
  });
};
