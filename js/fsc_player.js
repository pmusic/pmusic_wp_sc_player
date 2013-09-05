/* 
jQuery(document).ready(function(){
  alert('loaded!');
});
*/
//function fsc_playlist_player(json){
fsc_playlist_player = function(json, client_id){
  var play = function(){
     track = playlist.tracks[0].uri;
     alert(track); 
     SC.stream(track, function(sound){
       sound.play();
     });
  };
  
  var playlist = JSON.parse(json);
  //alert(playlist.title);
  var player = jQuery('#fsc-' + playlist.id);
  player.append('<div class="play">PLAY</div>');
  var status = jQuery('#fsc-' + playlist.id + ' .status');
  status.html("we've got javascript!");
  var playbutton = jQuery('#fsc-' + playlist.id + ' .play');
  playbutton.click(play);
  
  SC.initialize({client_id: client_id});
};
