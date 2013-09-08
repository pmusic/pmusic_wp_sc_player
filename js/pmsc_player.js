/**
 * 
 * @param string json
 * @param string client_id
 */
pmsc_playlist_player = function(json, client_id){
  
  var playlist = JSON.parse(json);
  SC.initialize({client_id: client_id});
  var track = playlist.tracks[0].uri;
  var stream = SC.stream(
    track, 
    {
      onpause: function(){console.log('paused');},
      onplay: function(){console.log('playing');}
    },
    function(sound){
      console.log('got the stream');
    
      var player = jQuery('#pmsc-' + playlist.id);
      player.append('<div class="play">PLAY</div>');
      var status = jQuery('#pmsc-' + playlist.id + ' .status');
      status.html("we've got javascript!");
      var playbutton = jQuery('#pmsc-' + playlist.id + ' .play');
      playbutton.click(function(){sound.togglePause();});
    });
};