//var PMSCPlayer = function (client_id) {
jQuery(document).ready(function () {
  /**
  * Global singleton object for managing players
  * Contains two methods: setClientId and addPlayer
  */
  pmsc_player = (function () {

    var playlists = [],
      current_playlist = 0,
      current_track = 0;

    soundManager.setup({
      url: '/wp-content/plugins/pmsc-player/swf',
      preferFlash: false
    });

    /*
    * Only load once soundmanager.ready has fired.
    * @param object
    */
    var loadPlayList = function (pid) {
      var y = 0;
      for (y; y < playlists[pid].tracks.length; y = y + 1) {
        playlists[pid].tracks[y].tid = 't' + playlists[pid].tracks[y].id;
        soundManager.createSound({
          id: 't' + String(playlists[pid].tracks[y].id),
          url: playlists[pid].tracks[y].stream_url + '?client_id=' + client_id,
          onfinish: next,
          onplay: function () { //TODO: move function creation outside of loop
              current_playlist = pid;
            },
            whileplaying: function () {
              jQuery('.playing .timeplayed').text(minSec(this.position) + '/');
              var duration = (this.readyState === 3) ? this.duration : this.durationEstimate;
              jQuery('.played-time').width(Math.floor((this.position / duration) * 450));
            }
          });
        }
    };


    /*
    * @param int time in miliseconds
    * @return string time in "min:sec" format
    */
    var minSec = function (duration) {
      var min = Math.floor(duration / 60000);
      var sec = Math.round((duration % 60000) / 1000);
      sec = (sec < 10) ? '0' + sec : sec;
      return min + ':' + sec;
    };

    /**
    * toggle play/pause
    * @param {string} pid Playlist id. Optional.
    */
    var playPause = function (pid) {

      if (pid && pid !== current_playlist) {
        //switch playlists
        current_playlist = pid;
        current_track = 0;
      }
      var tid = playlists[current_playlist].tracks[current_track].tid,
          playstate = soundManager.getSoundById(tid).playState,
          paused = soundManager.getSoundById(tid).paused;

      if (playstate === 0 || paused) {
        play();
      } else if (playstate === 1) {
        pause();
      } else {
        //???
        console.log('neither paused nor playing? Playstate:' + playstate);
      }
    };

    /*
    * starts the current track playing
    */
    var play = function () {
      var tid = playlists[current_playlist].tracks[current_track].tid;
      soundManager.play(tid);

      $track = jQuery('#pmsc-' + current_playlist + ' [data-track="' + current_track + '"]');

      jQuery('.track').removeClass('playing').addClass('notplaying');
      jQuery('.playpause').removeClass('icon-play').addClass('icon-pause');
      $track.removeClass('notplaying').addClass('playing');
      jQuery('.played-time').remove();
      //jQuery('#' + tid + ' .total-time').append(jQuery('<div class="played-time"></div>'));
      $track.children('.total-time').append(jQuery('<div class="played-time"></div>'));
    };

    /**
    * pause the playing track
    */
    var pause = function () {
      soundManager.pause(playlists[current_playlist].tracks[current_track].tid);

      jQuery('.playpause').removeClass('icon-pause').addClass('icon-play');
    };

    /**
    * skips to the next track and plays it
    */
    var next = function () {
      soundManager.stopAll();
      if (typeof playlists[current_playlist].tracks[current_track + 1] === 'undefined') { // no more tracks in playlist
        resetPlayer();
      } else {
        current_track = current_track + 1;
        play();
      }
    };

    /**
    * Go back to previous track
    */
    var previous = function () {
      soundManager.stopAll();

      if (current_track === 0) {
        resetPlayer();
      } else {
        current_track = current_track - 1;
        play();
      }
    };

    var switchTrack = function (tid) {

    };

    /**
    * resets the player to the "default" position with just the big play button.
    */
    var resetPlayer = function () {
      var player = '#pmsc-' + current_playlist;
      jQuery(player + ' .big-play').fadeIn();
      jQuery(player + ' .control-box').fadeOut();
    };

    soundManager.ontimeout(function () {
      console.log('timed out settting up soundmanager2');
    });

    return {
      setClientId : function (cid) {
        if (typeof client_id == 'undefined') {
          client_id = cid;
        } else {
          console.log('WARNING: clientid  already set');
        }
      },

      /**
      * @param object p JavaScript object retrieved from soundcloud
      */
      addPlayer:  function (p) {
        p.pid = 'p' + String(p.id);
        playlists[p.pid] = p;

        soundManager.onready(function () { loadPlayList(p.pid); });

        // set up player
        jQuery('.status').remove();

        p.$player = jQuery('#pmsc-' + p.pid);
        p.$controlBox = jQuery('<div class="control-box"></div>');
        p.$controlBox.appendTo(playlists[p.pid].$player);

        p.$bigPlayButton = jQuery('<div class="big-play icon-play"></div>');
        p.$bigPlayButton.appendTo(p.$player);
        p.$bigPlayButton.data('playlist', p.pid );
        p.$bigPlayButton.on('click', function () {
            p.$controlBox.show('up');
            p.$bigPlayButton.fadeOut();
            playPause(p.pid);
        });

        //create track divs
        for (var c = 0; c<p.tracks.length; c = c + 1){
          //var t_html = '<div class="track notplaying" id="t' + p.tracks[c].id + '">';
          var t_html = '<div class="track notplaying" data-track="' + c + '">';
          t_html += (c + 1) + ') ';
          t_html += p.tracks[c].title;
          var duration = p.tracks[c].duration;

          // controls
          t_html += ' (<span class="timeplayed"></span>'  + minSec(duration) + ')';
          t_html += '<div class="total-time"></div>';
          t_html += '</div>';
          var $t = jQuery(t_html);
          $t.appendTo(p.$controlBox);


          var $track_controls = jQuery('<div class="track-controls"></div>');

          var $play = jQuery('<div class="playpause icon-pause"></div>');
          $play.click(function () {
              playPause(p.pid);
          });
          $track_controls.append($play);

          if (c !== 0) {
            var $previous = jQuery('<div class="previous icon-arrow-up"></div>');
            $previous.on('click', previous);
            $track_controls.append($previous);
          }

          if (c < p.tracks.length - 1) {
            var $next = jQuery('<div class="next icon-arrow-down"></div>');
            $next.on('click', next);
            $track_controls.append($next);
          }

          $t.prepend($track_controls);
        }
      }
    };
  })();

});