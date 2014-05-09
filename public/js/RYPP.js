/*
  Youtube Player with Playlist (v0.2)
  https://github.com/carloscabo/responsive-youtube-player-with-playlist
  by
  Carlos Cabo (@putuko)
  Alenadro Menéndez (@frostcrazy)
*/

var RYPP = {

  // Settings
  settings: {
    $el: null,
    $playlc: null, // Playlist container
    $items:  null, // Items <li> container
    $videoc: null, // Video container
    $header: null, // Playlist header
    player: null,  // Youtube player
    ratio: '16:9'
  },

  init: function(el, options) {
    var
      s = this.settings,
      tag = document.createElement('script'),
      hID = document.getElementsByTagName('head')[0];

    s.$el = $(el);
    s.$playlc = s.$el.find('.RYPP-playlist');
    s.$items  = s.$playlc.find('.RYPP-items');
    s.$videoc = s.$el.find('#RYPP-video');
    s.$header = s.$playlc.find('header');

    // Add youtube API in HEAD
    tag.src = "http://www.youtube.com/player_api";
    hID.appendChild(tag);

    // Playlist is empty?
    if ($.trim(s.$items.html()) == '') {
      $('<ol>').appendTo(s.$items);
    }

    // Video placeholder on the left
    this.insert_video_placeholder();

    // Read vídeos from IDs
    // this.fill_from_IDs();

    // Read videos from playlist
    // this.fill_from_playlist();
  },

  // Inserts a image placeholder to fix responsive iframe
  insert_video_placeholder: function() {
    var
      s  = this.settings,
      du = '',
      img = '<img class="RYPP-placeholder" src="data:image/png;base64,'
      that = this;

    ratio = s.$el.data('ratio');
    if (ratio) {
      s.ratio = ratio;
    }
    switch (s.ratio) {
      case '2:1':
        du = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAABeK7cBAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=';
        break;
      case '4:3':
        du = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAADAQAAAACcj5NrAAAAAnRSTlMAAQGU/a4AAAALSURBVHgBY/gAggAIdgLRizhdSgAAAABJRU5ErkJggg==';
        break;
      default: // '16:9'
      du = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAAD0lEQVQoU2NgGAWjgAoAAAJJAAHDmDdKAAAAAElFTkSuQmCC';
        break;
    }
    img = img + du + '">';
    $(img).appendTo(s.$videoc);
    $('<iframe src="" frameborder="0" allowfullscreen></iframe>').appendTo(s.$videoc);

    this.fix_heights();

    s.$el.resize(function(e) {
      console.log('resize!');
    });
  },

  // Resizes playlist
  fix_heights: function() {
    var
      s  = this.settings, // Placeholder
      h = 0;
    s.$imph = $(s.$videoc).find('.RYPP-placeholder');
    h = s.$imph.height();
    s.$playlc.height(h);
  },

  // Add video block to playlist
  add_vid_to_playl: function(vid, tit, aut, thu) {
    $('<li data-video-id="'+vid+'"><p>'+tit+'<small><br>'+aut+'</small></p><img src="'+thu+'"></li>').appendTo(this.settings.$items.find('ol'));
      // console.log(tit);
      // console.log(aut);
      // console.log(thu);
  },

  // Get video from data-ids
  fill_from_playlist: function() {
    var
      id = this.settings.$el.data('playlist');
      url = 'http://gdata.youtube.com/feeds/api/playlists/'+id+'?v=2&alt=json&callback=?',
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
        $.each(data.feed.entry, function(idx, item) {
          // Prevent to load deleted videos
          if (item.media$group.media$content !== undefined) {
            var
              feed = item.link[1].href.split("/"),
              vid  = feed[feed.length - 2];
              tit  = item.title.$t,
              aut  = item.author[0].name.$t,
              thu  = item.media$group.media$thumbnail[0].url;
            that.add_vid_to_playl(vid, tit, aut, thu);
          }
        });
        that.start_playl();
      }
    });
  },

  // Get video from data-ids
  fill_from_IDs: function () {
    var
      that = this;
    ids = this.settings.$el.data('ids').split(',');
    $.each(ids, function(idx, val){
      that.get_ytvid_json(val);
    });
    this.start_playl();
  },

  get_ytvid_json: function (vid) {
    var
      that = this,
      json = null,
      // format = 6 to skip deleted videos
      url = 'http://gdata.youtube.com/feeds/api/videos/'+vid+'?v=2&alt=json';

    $.ajaxSetup ({cache: false});
    $.ajax( url, {
      context: this,
      dataType: 'json',
      crossDomain: true,
      error: function(){
        // Not successful
      },
      success: function(data){
        // console.log(data);
        var
          tit = data.entry.title.$t,
          aut = data.entry.author[0].name.$t,
          thu = data.entry.media$group.media$thumbnail[0].url;

        that.add_vid_to_playl(vid, tit, aut, thu);
      }
    });
    return json;
  },

  // All videos are supossed to be loaded, lest start the playlist
  start_playl: function() {

    var
      s = this.settings;

    // Click on playlist elemnts
    s.$items.find('li').on('click', function(e) {
      e.preventDefault();
      s.$items.find('li').removeClass('selected');
      $(this).addClass('selected');
      var vid = $(this).data('video-id');
      s.player.loadVideoById(vid);
    });

    // Select first if none
    if (s.$items.find('li.selected').length === 0) {
      s.$items.find('li').first().addClass('selected');
    }

    // Play first selected
    var id = s.$items.find('li.selected').data('video-id');
    s.player.loadVideoById(id);

  },

  add_API_player: function() {
    this.settings.player = new YT.Player('RYPP-video-player', {
      // height: '390',
      // width: '640',
      events: {
        'onReady': this.onPlayerReady,
        'onStateChange': this.onPlayerStateChange
      }
    });
  },

  // Ready to play
  onPlayerReady: function () {
    if (RYPP.settings.$el.attr('data-playlist')) {
      RYPP.fill_from_playlist();
    } else if (RYPP.settings.$el.attr('data-ids')) {
      RYPP.fill_from_IDs();
    } else {
      RYPP.start_playl();
    }
  },

  // When video finish
  onPlayerStateChange: function(e){
    // Play next
    var next = null;
    if(e.data === 0) {
      next = RYPP.settings.$items.find('li.selected').next();
      if (next.length == 0) {
        next = RYPP.settings.$items.find('li').first();
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

// Resize adjust
$(window).resize(function() {
  RYPP.fix_heights();
});

// JQuery hook
$.fn.rypp = function(options) {
  return this.each(function() {
    RYPP.init(this, options);
  });
};
