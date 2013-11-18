/**
 * 
 * @param string json
 * @param string client_id
 */
PMSCPlayer = function( client_id ){
  
  var client_id = client_id;
  var playlists = new Array();  
  var current_playlist = 0;
  var current_track = 0;

  soundManager.setup( {
      url: '/wp-content/plugins/pmsc-player/swf',
      preferFlash: false
  });
 
  soundManager.onready(function(){
    console.log('ready');
  });

  /* 
   * Only load once soundmanager.ready has fired.
   * @param object
   */
  var loadPlayList = function(pid){
    var y = 0;
    for( y; y < playlists[pid].tracks.length; y++ ){  
      playlists[pid].tracks[y].tid = 't' + playlists[pid].tracks[y].id;
        soundManager.createSound({
          id: 't' + String( playlists[pid].tracks[y].id ),
          url: playlists[pid].tracks[y].stream_url + '?client_id=' + client_id,
          onfinish: next,
          onplay: function(){
              console.log('id' + this.id + ' is playing');
              current_playlist = pid;
             },
           whileplaying: function(){
             jQuery('.playing .timeplayed').text(minSec(this.position) + '/');
             var duration = (this.readyState == 3) ? this.duration : this.durationEstimate;
             jQuery( '.played-time' ).width( Math.floor( ( this.position / duration ) * 450 ) );
           }
        });
      }
  };
  
	/**
	 * 
	 * @param object playlist_data object retrieved from soundcloud
	 */
  this.addPlayer = function( playlist_data ){
		var p = playlist_data;
    p.pid = 'p' + String(p.id); 
    playlists[p.pid] = p;
   
    soundManager.onready(function(){loadPlayList(p.pid);});

    // set up player
   
    jQuery('.status').remove();
    
    p.$player = jQuery('#pmsc-' + p.id);
    p.$controlBox = jQuery('<div class="control-box"></div>');
    p.$controlBox.appendTo(playlists[p.pid].$player);
    
    p.$playButton = jQuery('<div class="play">PLAY</div>');
    p.$playButton.data('playlist', p.pid );
    p.$playButton.on('click', function(){
			playPause(p.pid);
		}); 
    p.$playButton.appendTo(p.$controlBox);
    
		/*
    p.$nextButton = jQuery('<div class="next">NEXT</div>');
    p.$nextButton.on('click', next );
    p.$nextButton.appendTo(p.$controlBox);
		*/

		p.$bigPlayButton = jQuery('<div class="big-play">PLAY</div>');
		p.$bigPlayButton.appendTo(p.$player);
    p.$bigPlayButton.data('playlist', p.pid );
		p.$bigPlayButton.on('click', function(){
			p.$controlBox.show('up');
			p.$bigPlayButton.fadeOut();
			playPause(p.pid);
		})

    //create track divs
    for( var c=0; c<p.tracks.length; c++ ){
      var t_html = '<div class="track notplaying" id="t' + p.tracks[c].id + '">'; 
      t_html += (c+1) + ') ';
      t_html += p.tracks[c].title;
      var duration = p.tracks[c].duration;

			// controls


      t_html += ' (<span class="timeplayed"></span>'  + minSec(duration) + ')';
      t_html += '<div class="total-time"></div>';
      t_html += '</div>';
      var $t = jQuery( t_html );
      $t.appendTo(p.$controlBox);


			var $track_controls = jQuery('<div class="track-controls"></div>');

			var $play = jQuery('<div class="playpause">pause</div>');
			$play.click(function(){
				playPause(p.pid);
			});
			$track_controls.append($play);

			if( c != 0 ){
				var $previous = jQuery('<div class="previous">previous</div>');
				$previous.on('click', previous);
				$track_controls.append($previous);
			}

			if( c != p.tracks.length ){
				var $next = jQuery('<div class="next">next</div>');
				$next.on('click', next);
				$track_controls.append($next);
			}
			
			$t.prepend($track_controls);

		}
			
		console.log(p);
		var $footer = jQuery('<div class="footer"></div>');
		$footer.append('<a href="' + p.permalink_url + '">Download<a>');
		$footer.append('<div class="hosted">Sounds hosted on <a href="http://soundcloud.com/">SoundCloud</a></div>');
		p.$controlBox.append($footer);
  };

  /*
   * @param int time in miliseconds
   * @return string time in "min:sec" format
   */ 
  var minSec = function(duration){
      var min = Math.floor(duration/60000); 
      var sec = Math.round((duration%60000)/1000);   
      sec = (sec < 10) ? '0' + sec : sec;
      return min + ':' + sec;
  };
  
	/**
	 * toggle play/pause
	 * @param {string} pid Playlist id. Optional.
	 */
  var playPause = function(pid){

		if( pid && pid != current_playlist ){
			console.log('switching playlists');
      current_playlist = pid;
      current_track = 0;
		}
    var tid = playlists[current_playlist].tracks[current_track].tid; 

    console.log( 'pid:' + current_playlist );
    console.log( 'current track: ' + current_track);
    console.log( 'tid: ' + tid );

    var playstate = soundManager.getSoundById(tid).playState;  
		var paused = soundManager.getSoundById(tid).paused;

    if( playstate == 0 || paused ){
			console.log('play');
      play();
    } else if( playstate == 1 ) {
			console.log('pause');
      pause();    
    } else {
      //???
			console.log('neither paused nor playing? Playstate:' + playstate);
    }
  };
 
  /*
   * starts the current track playing
   */ 
  var play = function(){
    var tid = playlists[current_playlist].tracks[current_track].tid; 
    soundManager.play( tid );

    $track = jQuery( '#' + tid );
    
    jQuery( '.track' ).removeClass( 'playing' ).addClass('notplaying');
    $track.removeClass('notplaying').addClass('playing');
    jQuery( '.played-time' ).remove();
    jQuery('#' + tid + ' .total-time').append( jQuery('<div class="played-time"></div>'));
  };

  /*
   * pause the playing track
   */ 
  var pause = function(){
		console.log('current_track:' + current_track );
    soundManager.pause( playlists[current_playlist].tracks[current_track].tid );

    console.log('pause(): TODO: write ui stuff!'); 
  };
 
  /*
   * skips to the next track and plays it
   */ 
  var next = function(){
    soundManager.stopAll();
    //check if the currently playing track is the last track in the playlist 
    if( playlists[current_playlist].tracks[current_track + 1] ==  undefined ){
      // Clean up ui
    } else {
      current_track = current_track + 1;
      play();
    }
  };
 
  var previous = function(){
    soundManager.stopAll();

		if( current_track == 0 ){
			// clean up ui
		} else {
			current_track = current_track - 1;
			play();
		}
    
  };
  // test -- create button for each track
  /*
  $tracklist = jQuery('<div id="tracklist"></div>');
  $player.append( $tracklist );
  for(var n=0; n<playlist.tracks.length; n++){
    var $track = jQuery('<div class="track" data-trackno="' + n + '">' + n + '</div>');
    $tracklist.append( $track ); 
  }
 */

/* 
  var track = playlist.tracks[0].uri + '?client_id=' + client_id;
  var streamable_uri = playlist.tracks[0].stream_url + '?client_id=' + client_id;
  
  var currentSound = null;
 soundManager.onready(function(){
    console.log('readddddy again');
    currentSound = soundManager.createSound({
      url: streamable_uri,
      autoLoad: true 
      // need to read docs to figure out best options here.
    });
    
   
  });
 */ 
  soundManager.ontimeout(function(){
    console.log('timed out settting up soundmanager2');
  });
  
};