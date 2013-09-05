/* 
jQuery(document).ready(function(){
  alert('loaded!');
});
*/
//function fsc_playlist_player(json){
fsc_playlist_player = function(json, client_id){
  
  var playlist = JSON.parse(json);
  SC.initialize({client_id: client_id});
  var track = playlist.tracks[0].uri;
  var stream = SC.stream(track, {onpause: function(){console.log('paused');}},
      function(sound){
      console.log('got the stream');
      sound.onPosition(500, function(){console.log('30 seconds in');});
      //sound.onPause(function(){console.log('paused');});
      var playPause = function(){
        sound.togglePause();
        console.log(sound.position());
        if( sound.playState() == 0 ){
          sound.play();
        } else {
          sound.pause();
        }
      };

    
      var player = jQuery('#fsc-' + playlist.id);
      player.append('<div class="play">PLAY</div>');
      var status = jQuery('#fsc-' + playlist.id + ' .status');
      status.html("we've got javascript!");
      var playbutton = jQuery('#fsc-' + playlist.id + ' .play');
      playbutton.click(function(){playPause();});
  });
  
  };
