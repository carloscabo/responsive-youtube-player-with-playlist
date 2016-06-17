Responsive YouTube Player with Playlist (RYPP)
==============================================

![Screenshot](https://raw.githubusercontent.com/carloscabo/responsive-youtube-player-with-playlist/master/screenshot.png)

**(RYPP)** Responsive YouTube Player with Playlist, title is self-explanatory ;-)

[Demo](http://htmlpreview.github.io/?http://raw.githubusercontent.com/carloscabo/responsive-youtube-player-with-playlist/master/demo.html)

## Requirements

`JQuery (1.9.1+)`

`RYPP.js`

`RYPP.css`

## IMPORTANT (1): Youtube V.3 API KEY

Since Youtube API V3.0, it's **mandatory** to create a YT API key in order to get the playlists contents programatically... there aren't other ways to do this. **The old XML Feed used in the V.01 of RYPP has been removed by Youtube and no longer exists**.

In order to create your own API Key follow these intructions:
<https://developers.google.com/youtube/v3/getting-started>
(Remember to limit its usage you you site / domain)

## IMPORTANT (2): Features disabled on mobile

Several features have been **disabled in mobile devices** as Youtube is progressively disabling them:

- **Autoplay** no longer works on mobile devices
- **Autonext** no longer works on mobile devices

## TO-DO / Known issues

1. By default playlist JSON response its limited to 50 items, so you cannot retrieve more than 50 items from a playlist.

2. Testing in IE. Right now its only tested in Chrome / Firefox. Any bug report or contribution will be great apretiated.

## Usage

Basic `HTML` element:

````html
<div class="RYPP r4-3" data-playlist="PL2591DC20C4BB4D78">
  <div class="RYPP-video">
    <div class="RYPP-video-player">
      <!-- Will be replaced -->
    </div>
  </div>
  <div class="RYPP-playlist">
    <header>
      <h2 class="_h1 RYPP-title">Playlist title</h2>
      <p class="RYPP-desc">Playlist subtitle<a href="#" target="_blank">#hashtag</a></p>
    </header>
    <div class="RYPP-items"></div>
  </div>
</div>
````

Starting `RYPP` from JS:

````javascript
$(document).ready(function() {

  \\ You need a valid API Key
  \\ In the creation process you can define in which websites
  \\ can be used, to avoid unnapropiated uses
  var api_key = 'AIzaSyA1rpTMrNjth1R6-LfLe0UG8v1946nj3Xw';

  \\ Initialize all the player in the page with default options
  $('.RYPP').rypp( api_key );
});
````

## Settings / options

Aspect ratio of the YouTube video is set by adding an additional CSS class to the `<div class="RYPP r4-3" data-playlist="PL2591DC20C4BB4D78">` container, you can use `r2-1`, `r4-3` and `r16-9` (default). Be free to define your own in the RYPP.scss stylesheet.

`data-playlist="PL2591DC20C4BB4D78"`
ID of the YouTube playlist, RYPP will automatically get its data and thumbnails and populate the list on the right with them. Take a look to `demo-playlist.htm`.

`data-ids="hWGUnrIiOoI,7nXcLBXR70M"`
Alternativelly to the playlist you can provide a list of **comma-separated ids** of the YouTube vídeos you want to add to the playlist. Take a look to `demo.htm`.

You have several parameters you can pass on RYPP start to control some basic behaviours...

````javascript

$('#RYPP-custom-player').rypp( '{{YOUR_API_KEY_HERE}}', {

  // Automatically updates PL title description
  update_title_desc: true, // Default false

  // Player starts automatically on first video
  autoplay: true, // Default

  // Player loads next video automatically
  autonext: true, // Default

  // On reach the end of the playlist, jumps to first video
  loop: true,     // Default

  // Starts the player without sound
  mute: false     // Default

});

````

## Thanks

@frostcrazy & [@Vortizhe](https://github.com/vortizhe)

## Changelog

- 2016/06/16 v2.18 Solved infinite loading on some situations
- 2016/06/08 v2.17 Fetch title / descriptions from palylist metadata
- 2016/05/18 v2.16 Disabling several mobile features causing troubles
