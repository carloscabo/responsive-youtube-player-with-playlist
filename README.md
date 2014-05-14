Responsive YouTube Player with Playlist
=======================================

![Screenshot](https://raw.githubusercontent.com/carloscabo/responsive-youtube-player-with-playlist/master/screenshot.png)

**(RYPP)** Responsive YouTube Player with Playlist, title is self-explanatory ;-)

## Requirements

`Jquery (1.9.1+)`  
`RYPP.js`  
`RYPP.css`

## TO-DO / Known issues

At this moment **RYPP** supports one instance per page, that means you cannot add several **RYPP** players in the same page... sorry for the inconvenience.

Testing in IE. Right now its only tested in Chrome. Any bug report will b great apretiated.

## Usage

Basic `HTML` element:

    <div class="RYPP" data-ratio="4:3" data-playlist="PL2591DC20C4BB4D78">
      <div id="RYPP-video">
        <div id="RYPP-video-player">
          <!-- Will be replaced -->
        </div>
      </div>
      <div class="RYPP-playlist">
        <header>
          <h2 class="_h1">Playlist title</h2>
          <p>Playlist subtitle or <a href="#" target="_blank">#hashtag</a></p>
        </header>
        <div class="RYPP-items"></div>
      </div>
    </div>

Starting `RYPP` from JS:

    $(document).ready(function() {
      $('.RYPP').rypp();
    });
    
## Settings

As you can notice there are several parameters in the `HTML` element as `data-attrubutes`...

`data-ratio="4:3"`

Aspect ratio of the YouTube video, valid values are `2:1`, `4:3` and `16:9` (default).

`data-playlist="PL2591DC20C4BB4D78"`

ID of the YouTube playlist, RYPP will automatically get its data and thumbnails and populate the list on the right with them. Take a look to `demo-playlist.htm`.

`data-ids="hWGUnrIiOoI,7nXcLBXR70M"`

Alternativelly to the playlist you can provide a lista of **comma-separated ids** of the YouTube vídeos you want to add to the playlist. Take a look to `demo-id-list.htm`.

## Manual / 'hardcoded' (TO-DO!!!)

You can also _prefill_ the playlist with some _harcoded_ videos and ignore the playlists / id-list functionallity... take a look to `demo-hardcoded.htm`.

## Thanks

@frostcrazy & [@Vortizhe](https://github.com/vortizhe)

