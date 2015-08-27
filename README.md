Responsive YouTube Player with Playlist
=======================================

![Screenshot](https://raw.githubusercontent.com/carloscabo/responsive-youtube-player-with-playlist/master/screenshot.png)

**(RYPP)** Responsive YouTube Player with Playlist, title is self-explanatory ;-)

[Playlist Demo](#)

[VideoId list demo](#)

## Requirements

`Jquery (1.9.1+)`
`RYPP.js`
`RYPP.css`

## IMPORTANT UPDATE: Youtube V.3 API KEY

Since Youtube API V3.0, it's **mandatory** to create a YT API key in order to get the playlists contents programatically... there aren't other ways to do this. The old XML Feed used in the V.01 of RYPP has been removed by Youtube and no longer exists.

In order to create your own API Key follow these intructions:
<https://developers.google.com/youtube/v3/getting-started>
(Remember to limit its usage you you site domain)

## TO-DO / Known issues

1. By default playlist JSON response its limited to 50 items, so you cannot retrieve more than 50 items from a playlist.

2. Actually **RYPP** supports one instance per page, that means you cannot add several **RYPP** players in the same page... sorry for the inconvenience.

3. Testing in IE. Right now its only tested in Chrome. Any bug report will be great apretiated.

## Usage

Basic `HTML` element:

````html
<div class="RYPP r4-3" data-playlist="PL2591DC20C4BB4D78">
  <div id="RYPP-video">
    <div id="RYPP-video-player">
      <!-- Will be replaced -->
    </div>
  </div>
  <div class="RYPP-playlist">
    <header>
      <h2 class="_h1">Playlist title</h2>
      <p>Playlist subtitle<a href="#" target="_blank">#hashtag</a></p>
    </header>
    <div class="RYPP-items"></div>
  </div>
</div>
````

Starting `RYPP` from JS:

````javascript
$(document).ready(function() {

  \\ Before initilize RYPP you need to set your API Key
  \\ In the creation process you can define in wich websites
  \\ can be used, to avoid unnapropiated uses
  RYPP.api_key = 'AIzaSyA1rpTMrNjth1R6-LfLe0UG8v1946nj3Xw';

  \\ Initialize the player with default options
  $('.RYPP').rypp();
});
````

## Settings / options

Aspect ratio of the YouTube video is set by adding an additional CSS class to the `<div class="RYPP r4-3" data-playlist="PL2591DC20C4BB4D78">` container, you can use `r2-1`, `r4-3` and `r16-9` (default). Be free to define your own in the RYPP.scss stylesheet.

`data-playlist="PL2591DC20C4BB4D78"`
ID of the YouTube playlist, RYPP will automatically get its data and thumbnails and populate the list on the right with them. Take a look to `demo-playlist.htm`.

`data-ids="hWGUnrIiOoI,7nXcLBXR70M"`
Alternativelly to the playlist you can provide a list of **comma-separated ids** of the YouTube vídeos you want to add to the playlist. Take a look to `demo-id-list.htm`.

You have several parameters you can pass on RYPP start to control some basic behaviours...

````javascript

$('.RYPP').rypp({

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

