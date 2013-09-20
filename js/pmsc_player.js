/**
 * 
 * @param string json
 * @param string client_id
 */
pmsc_playlist_player = function(json, client_id){
  
  var playlist = JSON.parse(json);
  
  var $player = jQuery('#pmsc-' + playlist.id);
  // test -- create button for each track
  $tracklist = jQuery('<div id="tracklist"></div>');
  $player.append( $tracklist );
  for(var n=0; n<playlist.tracks.length; n++){
    var $track = jQuery('<div class="track" data-trackno="' + n + '">' + n + '</div>');
    $tracklist.append( $track ); 
  }
  
  var track = playlist.tracks[0].uri + '?client_id=' + client_id;
  var streamable_uri = playlist.tracks[0].stream_url + '?client_id=' + client_id;
  
  var currentSound = null;
  
  soundManager.setup( {
      url: '/wp-content/plugins/pmsc-player/swf',
      preferFlash: false
  });
  
  soundManager.onready(function(){
    console.log('readddddy again');
    currentSound = soundManager.createSound({
      url: streamable_uri,
      autoLoad: true 
      // need to read docs to figure out best options here.
    });
    
    // set up player
    $playButton = jQuery('<div class="play">PLAY</div>');
    $player.append($playButton);
    $playButton.on('click', function(){ currentSound.togglePause() }); 
    
  });
  
  soundManager.ontimeout(function(){
    console.log('timed out settting up soundmanager2');
  });
  
};