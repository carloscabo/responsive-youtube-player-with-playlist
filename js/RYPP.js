/*
  Youtube Player with Playlist (v2.22)
  https://github.com/carloscabo/responsive-youtube-player-with-playlist
  by Carlos Cabo (@putuko)
*/

var RYPP = (function($, undefined) {
  'use strict';

  function Rypp(el, api_key, options) {

    if (typeof api_key === 'undefined') {
      console.log("Youtube API V3 requires a valid API KEY.\nFollow the instructions at: https://developers.google.com/youtube/v3/getting-started");
      return false;
    }

    // DOM Elements container
    this.DOM = {};

    // Default settings container
    this.options = {};

    // Data / urls
    this.data = {
      // Playlist url
      ytapi: {
        playlist_info: 'https://www.googleapis.com/youtube/v3/playlists?part=snippet&id={{RESOURCES_ID}}&key={{YOUR_API_KEY}}',
        playlist: 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId={{RESOURCES_ID}}&key={{YOUR_API_KEY}}',
        pl_ID: '',
        videolist: 'https://www.googleapis.com/youtube/v3/videos?part=snippet,status&maxResults=50&id={{RESOURCES_ID}}&key={{YOUR_API_KEY}}',
      },
      temp_vl: [], // Temporary videolist
      firsttime: true,
      ismobile: (typeof window.orientation !== 'undefined'),
      ispopulated: false
    };

    // Initialize
    this.init(el, api_key, options);
  }

  // Prototype for the instance
  Rypp.prototype = {

    init: function(el, api_key, options) {

      // Api key
      this.api_key = api_key;

      // Default options
      this.options = {
        update_title_desc: false,
        autoplay: true,
        autonext: true,
        loop: true,
        mute: false,
        debug: false
      };

      // Merge initial options
      if (typeof options !== 'undefined') {
        $.extend(this.options, options);
      }

      // DOM elements
      this.DOM = {};
      this.DOM.$el = $(el);
      this.DOM.$playlc = this.DOM.$el.find('.RYPP-playlist');
      this.DOM.$items =  this.DOM.$el.find('.RYPP-items');
      this.DOM.$videoc = this.DOM.$el.find('.RYPP-video');
      this.DOM.$title  = this.DOM.$el.find('.RYPP-title');
      this.DOM.$desc   = this.DOM.$el.find('.RYPP-desc');

      // YT Player object
      this.DOM.$el[0].ytplayer = null;

      // Unique player ID
      this.data.player_uid = (Math.random().toString(16).substr(2,8));
      this.DOM.$el.attr('data-rypp',this.data.player_uid).find('.RYPP-video-player').attr('id','RYPP-vp-'+this.data.player_uid).attr('name','RYPP-vp-'+this.data.player_uid);
      if (this.options.debug) console.log('Unique ID: RYPP-vp-'+this.data.player_uid);

      // Link JS only once
      if (typeof window.YT === 'undefined') {
        var
          tag = document.createElement('script'),
          hID = document.getElementsByTagName('head')[0];
        // Add youtube API in HEAD
        // tag.src = "https://www.youtube.com/iframe_api";
        tag.src = 'https://www.youtube.com/iframe_api?version=3';
        hID.appendChild(tag);
      } else {
        this.addAPIPlayer();
      }

    },

    onYTIframeAPIReadyCallback: function() {
      this.addAPIPlayer();
    },

    updateTitleDesc: function() {
      var
        that = this,
        resources_id = this.DOM.$el.attr('data-playlist'),
        url  = this.data.ytapi.playlist_info.replace('{{RESOURCES_ID}}', resources_id).replace('{{YOUR_API_KEY}}', this.api_key);

      $.ajaxSetup ({cache: false});
      $.ajax(url, {
        context: this,
        dataType: 'json',
        crossDomain: true,
        error: function(){
          // Not successful
        },
        success: function(data){
          // console.log(data);
          this.DOM.$title.html( data.items[0].snippet.title );
          this.DOM.$desc.html( data.items[0].snippet.description );
        }
      });
    },

    populatePlaylist: function() {

      if( this.options.update_title_desc ) {
        if (this.options.debug) console.log(this.data.player_uid+': Updating playlist title / desc');
        this.updateTitleDesc();
      }

      // Empty playlist
      if (this.options.debug) console.log(this.data.player_uid+': Populating playlist');
      this.DOM.$items.html('').append($('<ol>'));

      // Now we read the video list from playlist data or from IDs...
      if (this.DOM.$el.attr('data-playlist')) {
        this.data.pl_ID = this.DOM.$el.attr('data-playlist');
        this.getVideosFrom(
          'playlist',
          this.data.pl_ID
        );
      } else if (this.DOM.$el.attr('data-ids')) {
        var vl = this.DOM.$el.attr('data-ids');
        // Clean spaces
        vl = ($.map(vl.split(','),$.trim)).join(',');
        this.getVideosFrom(
          'videolist',
          vl
        );
      }
    },

    addAPIPlayer: function() {
      var that = this;

      window.YTConfig = { 'host': 'https://www.youtube.com' };
      this.DOM.$el[0].ytplayer = new YT.Player('RYPP-vp-'+that.data.player_uid, {
        // height: '390',
        // width: '640',
        playerVars: {
          // controls: 0,
          // showinfo: 0 ,
          // autoplay: 0,
          // html5: 1,
          enablejsapi: 1,
          rel: 0,
          modestbranding: 1,
          wmode: 'transparent'
        },
        events: {
          'onReady': function(){
            if (that.options.debug)console.log(that.data.player_uid+': ytplayer ready');
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
      if (this.options.debug) console.log(this.data.player_uid+': ytplayer ready callback');
      this.populatePlaylist();
      // this.startPlayList();
    },

    // When video finish
    onPlayerStateChange: function(e){
      var
        that = this;

      if (typeof e !== 'undefined') {

        // On video loaded?
        if(e.data === -1 && this.data.firsttime) {
          if(!this.options.autoplay && !this.data.ismobile) { // Is desktop
            this.DOM.$el[0].ytplayer.stopVideo();
            this.data.firsttime = false;
          }
          if(this.options.mute) {
            this.DOM.$el[0].ytplayer.mute();
          }
        }

        // If mobile and stored in buffer we STOP the video in mobile devices
        if(e.data === 3 && this.data.ismobile && this.data.firsttime) {
          setTimeout(function(){
            that.DOM.$el[0].ytplayer.stopVideo();
            that.data.firsttime = false;
          }, 500);
        }

        // Play next only if not mobile
        var next = null;
        if(e.data === 0 && !this.data.ismobile && this.options.autonext) {
          next = this.DOM.$items.find('li.selected').next();
          if (next.length === 0 && this.options.loop) {
            next = this.DOM.$items.find('li').first();
          }
          next.trigger('click');
        }

      }

    },


    // Get video from data-ids or playlist
    // It's impossible to know if a video in a playlist its available or currently deleted. So we do 2 request, first we get all the video IDs an then we ask for info about them.
    getVideosFrom: function(kind, resources_id, page_token) {
      var
        that = this,
        url  = this.data.ytapi[kind].replace('{{RESOURCES_ID}}', resources_id).replace('{{YOUR_API_KEY}}', this.api_key);

      if (typeof page_token !== 'undefined') {
        url += '&pageToken=' + page_token;
      }

      $.ajaxSetup ({cache: false});
      $.ajax(url, {
        context: this,
        dataType: 'json',
        crossDomain: true,
        error: function(){
          // Not successful
        },
        success: function(data){

          // We queried for a playlist
          if (data.kind === 'youtube#playlistItemListResponse') {

            var video_set = [];

            // We get the video IDs and query gain, its the only way to be sure that all the videos are available, and not were deleted :(
            $.map(data.items, function(val,idx) {
              if (typeof val.snippet.resourceId.videoId !== 'undefined') {
                // Add video to temporary list
                video_set.push( val.snippet.resourceId.videoId );
                // return val.snippet.resourceId.videoId;
              }
            });
            that.data.temp_vl.push( video_set );

            // If there are several pages we ask for next
            if (typeof data.nextPageToken !== 'undefined' && data.nextPageToken !== '') {
              that.getVideosFrom(
                'playlist',
                that.data.pl_ID,
                data.nextPageToken
              );
            } else {
              // No more pages... we process the videos
              for (var j = 0, len_pl = that.data.temp_vl.length; j < len_pl; j++) {
                video_set = that.data.temp_vl.shift();
                that.getVideosFrom('videolist', video_set.join(','));
              }
            }

          } else if (data.kind === 'youtube#videoListResponse') {

            // Videos froma  Videolist
            for (var i = 0, len = data.items.length; i < len; i++) {
              var item = data.items[i];

              // Videos without thumbnail, deleted or rejected are not included in the player!
              if (
                $.inArray(item.status.uploadStatus, ['rejected', 'deleted', 'failed']) === -1 &&
                typeof item.snippet.thumbnails !== 'undefined'
              ) {
                var
                  vid = item.id,
                  tit = item.snippet.title,
                  aut = item.snippet.channelTitle,
                  thu = item.snippet.thumbnails.default.url;
                that.addVideo2Playlist(vid, tit, aut, thu);
              }
              if ( $.isEmptyObject( that.data.temp_vl ) ) {
                this.startPlayList();
              }
            }
          }
        }
      });
    },

    // All videos are supossed to be loaded
    // lets start the playlist
    startPlayList: function() {

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
        that.DOM.$el[0].ytplayer.loadVideoById(vid);
        // If we are in mobile we must stop
        if (that.data.ismobile) {
          that.data.firsttime = true;
        }
      });

      // Select first if none
      if (D.$items.find('li.selected').length === 0) {
        if ( this.options.autoplay ) {
          D.$items.find('li').first().click();
        }
      }
    },

    // Add video block to playlist
    addVideo2Playlist: function(vid, tit, aut, thu) {
      var
        D  = this.DOM;
      $('<li data-video-id="'+vid+'"><p class="title">'+tit+'<small class="author"><br>'+aut+'</small></p><img src="'+thu+'" class="thumb"></li>').appendTo(D.$items.find('ol'));
    },

  }; // prototypes

  return Rypp;

}(jQuery));

// YOUTUBE API CALLBACK
function onYouTubeIframeAPIReady() {
  // console.log( 'Youtube API script loaded. Start players.' );
  $('[data-rypp]').each(function(idx, el) {
    $(el)[0].rypp_data_obj.onYTIframeAPIReadyCallback();
  });
}

// JQuery hook
$.fn.rypp = function(api_key, options) {
  return this.each(function() {
    // Store object in DOM element
    this.rypp_data_obj = new RYPP(this, api_key, options);
  });
};
