/*
 * Contains code that creates the "pmsc_player" object, which manages the players.
 */
/*jslint browser: true, devel: true, vars: true, indent: 2 */
jQuery(document).ready(function () {
  /**
  * Global singleton object for managing players
  * Has two public methods: setClientId and addPlayer
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
          whileplaying: animateTimeBar
        });
      }
    };

    var animateTimeBar = function () {
      jQuery('.playing .timeplayed').text(minSec(this.position) + '/');
      var duration = (this.readyState === 3) ? this.duration : this.durationEstimate;
      jQuery('.played-time').width(Math.floor((this.position / duration) * 450));
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
        soundManager.stopAll();
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

      var $track = jQuery('#pmsc-' + current_playlist + ' [data-track="' + current_track + '"]');

      jQuery('.track').removeClass('playing').addClass('notplaying');
      jQuery('.playpause').removeClass('icon-play').addClass('icon-pause');
      $track.removeClass('notplaying').addClass('playing');
      jQuery('.played-time').remove();
      $track.children('.total-time').append(jQuery('<div class="played-time"></div>'));
    };

    /**
    * Called when the "pause" button is pressed
    */
    var pause = function (event) {
      soundManager.pause(playlists[current_playlist].tracks[current_track].tid);

      jQuery('.playpause').removeClass('icon-pause').addClass('icon-play');
      event.stopPropagation();
    };

    /**
    * Called when the "next" button is pressed
    */
    var next = function (event) {
      soundManager.stopAll();
      if (typeof playlists[current_playlist].tracks[current_track + 1] === 'undefined') { // no more tracks in playlist
        resetPlayers();
      } else {
        current_track = current_track + 1;
        console.log('next track: ' + current_track);
        play();
      }
      event.stopPropagation();
    };

    /**
    * Called when the "previous" button is pressed
    */
    var previous = function () {
      soundManager.stopAll();

      if (current_track === 0) {
        resetPlayers();
      } else {
        current_track = current_track - 1;
        play();
      }
      event.stopPropagation();
    };

    /**
     * Called when a track div is clicked to switch the track.
     * @returns {undefined}
     */
    var switchTrack = function (event) {
      var track = event.data.track;
      console.dir(jQuery(this).hasClass('playing'));;
      if (jQuery(this).hasClass('playing')) { //currently playing track
        return;
      }
      console.log('switch to track ' + track);
      soundManager.stopAll();
      current_track = track;
      play();
    };
    
    /**
     * Skips to a location in the track
     * @param {event} event
     * @returns {undefined}
     */
    var seek = function (event) {
      var offset = jQuery(this).parent().offset().left;
      var x = event.clientX - offset;
      var percent = x / this.clientWidth;
      console.log('x:' + x);
      console.log('percent:' + percent);
      console.dir(playlists[current_playlist].tracks[current_track].duration);
      var location = percent * playlists[current_playlist].tracks[current_track].duration;
      console.log(location);
      soundManager.setPosition(playlists[current_playlist].tracks[current_track].tid, location);
    };

    /**
     * Resets all players to the default position with the big play button
    */
    var resetPlayers = function () {
      var player = '#pmsc-' + current_playlist;
      jQuery(player + ' .big-play').fadeIn();
      jQuery(player + ' .control-box').fadeOut();
    };

    soundManager.ontimeout(function () {
      console.log('timed out settting up soundmanager2');
    });

    return {
      /**
       * Set the SoundCloud client ID
       * @param string cid
       */
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

        var trackID = '#pmsc-' + p.pid;
        p.$player = jQuery(trackID);
        p.$controlBox = jQuery('<div class="control-box"></div>');
        p.$controlBox.appendTo(playlists[p.pid].$player);

        p.$bigPlayButton = jQuery('<div class="big-play icon-play"></div>');
        p.$bigPlayButton.appendTo(p.$player);
        p.$bigPlayButton.data('playlist', p.pid );
        p.$bigPlayButton.click(function () {
            resetPlayers();
            p.$controlBox.show('up');
            p.$bigPlayButton.fadeOut();
            playPause(p.pid);
        });

        //create track divs
        for (var c = 0; c < p.tracks.length; c = c + 1){
          var $track = jQuery('<div class="track notplaying" data-track="' + c + '"></div>');
          var t_html = (c + 1) + ') '; //track number
          t_html += p.tracks[c].title; //track title
          var duration = p.tracks[c].duration; 
          t_html += ' (<span class="timeplayed"></span>'  + minSec(duration) + ')'; //track duration

          $track.append(t_html);
           
          var $timeline = jQuery('<div class="total-time"></div>');
          $timeline.click(seek);
          $track.append($timeline);

          $track.appendTo(p.$controlBox);

          $track.click({track: c}, switchTrack);


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

          $track.prepend($track_controls);
        }
      }
    };
  })();

});