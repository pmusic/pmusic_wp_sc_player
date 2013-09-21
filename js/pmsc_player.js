/**
 * 
 * @param string json
 * @param string client_id
 */
PMSCPlayer = function( client_id ){
  
  var client_id = client_id;
  var playlists = new Array();  
  var currently_playing = null;
  soundManager.setup( {
      url: '/wp-content/plugins/pmsc-player/swf',
      preferFlash: false
  });
 
  soundManager.onready(function(){
    console.log('playlists:');
    console.log(playlists);
    //create sounds
    for( var x in playlists ){
     
    }
  });

  /* 
   * Only load once soundmanager.ready has fired.
   * @param object
   */
  var loadPlayList = function(pid){
    for( var y = 0; y < playlists[pid].tracks.length; y++ ){  
        soundManager.createSound({
          id: 'p' + String( playlists[pid].tracks[y].id ),
          url: playlists[pid].tracks[y].stream_url + '?client_id=' + client_id,
          onfinish: function(){console.log('TODO: move to next track');},
          onplay: function(){console.log('id' + this.id + ' is playing');}
        });
      }
  };

  this.addPlayer = function( json ){
    var p = JSON.parse( json );
    var pid = 'p' + String(p.id); 
    playlists[pid] = p;
   
    soundManager.onready(function(){loadPlayList(pid);});

    // set up player
    
    p.$player = jQuery('#pmsc-' + p.id);
    p.$controlBox = jQuery('<div class="controlbox"></div>');
    p.$controlBox.appendTo(playlists[pid].$player);
    
    p.$playButton = jQuery('<div data-playlist="' + pid + '" class="play">PLAY</div>');
    p.$playButton.on('click', playPause); 
    p.$playButton.appendTo(p.$controlBox);
    
    //create track divs
    for( var c=0; c<p.tracks.length; c++ ){
      var t_html = '<div class="track notplaying" id="p' + p.tracks[c].id + '">'; 
      t_html += p.tracks[c].title;
      t_html += '</div>';
      var t = jQuery( t_html );
      t.appendTo(p.$controlBox);
    }
    

    j = jQuery('<div>test</div>'); 
    playlists[pid].$player.append(j);
    j.on('click', testFunction );
  };
  
  //test function
  var testFunction = function(){
    soundManager.onReady(function(){console.log('ran onready!');});
  };
  
  var playPause = function(){
    $this = jQuery(this);
    if( currently_playing == null ){
      console.log( $this.data('playlist') );
      
      currently_playing = 'p' + playlists[jQuery(this).data('playlist')].tracks[0].id;
    } 
    jQuery( '.track' ).removeClass( 'playing' );
    jQuery('#' + currently_playing).removeClass('notplaying').addClass('playing');
    console.log('currently_playing:' + currently_playing );
    soundManager.togglePause( currently_playing );
  };
  
  var pause = function(){
    
  };
  
  var next = function(){
    
  };
  
  var loadAndPlay = function(){
    
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