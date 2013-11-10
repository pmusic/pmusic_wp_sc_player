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
             var duration = this.readyState==3 ? this.duration : this.durationEstimate;
             jQuery( '.played-time' ).width( Math.floor( ( this.position / duration ) * 450 ) );
           }
        });
      }
  };
  
  this.addPlayer = function( json ){
    var p = JSON.parse( json );
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
    p.$playButton.on('click', playPause); 
    p.$playButton.appendTo(p.$controlBox);
    
    p.$nextButton = jQuery('<div class="next">NEXT</div>');
    p.$nextButton.on('click', next );
    p.$nextButton.appendTo(p.$controlBox);

    //create track divs
    for( var c=0; c<p.tracks.length; c++ ){
      var t_html = '<div class="track notplaying" id="t' + p.tracks[c].id + '">'; 
      t_html += (c+1) + ') ';
      t_html += p.tracks[c].title;
      var duration = p.tracks[c].duration;

      t_html += ' (<span class="timeplayed"></span>'  + minSec(duration) + ')';
      t_html += '<div class="total-time"></div>';
      t_html += '</div>';
      var t = jQuery( t_html );
      t.appendTo(p.$controlBox);
    }
    
    p.$controlBox.append('<div class="footer">Sounds hosted on <a href="http://soundcloud.com/">SoundCloud</a></div>');
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
  
  var playPause = function(){
    var $this = jQuery(this);
    console.log( playlists[$this.data('playlist')] );
    console.log(current_track);
    var tid = playlists[$this.data('playlist')].tracks[current_track].tid; 
    if( $this.data('playlist') != current_playlist ){
      current_playlist = $this.data('playlist');
      current_track = 0;
    } 
    var playstate =soundManager.getSoundById(tid).playState;  
    if( playstate == 0 ){
      play();
    } else if( playstate == 1 ) {
      pause();    
    } else {
      //???
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
    soundManager.pause( playlists[current_playlist].tracks[current_track].tid );
    console.log('write ui stuff!'); 
  };
 
  /*
   * skips to the next track and plays it
   */ 
  var next = function(){
    //check if it's the last track in the playlist playing
    soundManager.stopAll();
    if( playlists[current_playlist].tracks[current_track + 1] ==  undefined ){
      // Clean up ui
    } else {
      current_track++;
      play();
    }
  };
 
  var previous = function(){
    
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