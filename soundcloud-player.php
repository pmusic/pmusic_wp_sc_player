<?
/*
Plugin Name: SoundCloud Player
Plugin URI: 
Description: 
Version: 0.1 
Author: Alex Bundy (alex@planetariummusic.com)
Author URI: http://www.planetariummusic.com/
License: TODO 
*/

class SoundCloudPlayer {
	
  function  __construct(){
    add_action('admin_init', array($this, 'init'));
    add_action('admin_menu', array($this, 'plugin_menu'));
    add_shortcode('sc', array($this, 'sc_print'));
    wp_register_script('fsc_player', plugins_url('js/fsc_player.js', __FILE__));
    wp_register_style('fsc_player', plugins_url('css/fsc_player.css', __FILE__));
  }

	function plugin_menu(){
    add_options_page( 'Soundcloud Player', 'Soundcloud', 'manage_options', 'soundcloud-player', array($this, 'admin_page') );		
	}

	function admin_page(){
    require('pages/admin_page.php');
	}
  
  function print_text_input( $args ){
    $options = get_option('soundcloud_player_options');
    $value = $options[$args['field']];
    
    echo '<input type="text" name="soundcloud_player_options[' . $args['field'] . ']" value="' . $value . '" />'; 
  } 
 
  
  function init(){
    register_setting( 'soundcloud_player_options', 'soundcloud_player_options');
    add_settings_section('api', 'API', 'admin_page', 'soundcloud-player');
    add_settings_field('client_id', 'Client ID', array($this, 'print_text_input'), 'soundcloud-player', 'api', array('field'=>'client_id') );
    add_settings_field('client_secret', 'Client Secret', array($this, 'print_text_input'), 'soundcloud-player', 'api', array('field'=>'client_secret') );
    
  }

  /**
   * Shortcode function; prints soundcloud player
   */
  function sc_print($atts){
    if($resource = $atts['resource']){ //TODO check if format is valid.
      require_once('lib/php-sc/Services/Soundcloud.php');
      
      $options = get_option('soundcloud_player_options');
      $this->client_id = $options['client_id'];
      
      $playlist = $this->get_playlist($resource);
      var_dump($playlist);
      return Player::big_player($playlist, $this->client_id);
      
    } else {
      //TODO add more helpful note.
      return 'Not a valid ressource';
    }
  }
  
  function get_playlist($resource){
    $url = 'http://api.soundcloud.com/playlists/' . $resource . '.json?client_id=' . $this->client_id;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $json = curl_exec($ch); 
    curl_close($ch);
    /*
    $playlist = new PlayList();
    $playlist->init_from_json($json);
     */
    return $json;
    //return json_decode($json);
  }

}
/*
class PlayList {
  function init_from_json($json){
    $playlistinfo = json_decode($json);
    $this->title = $playlistinfo->title;
    foreach($playlistinfo->tracks as $track){
      $this->tracks[] = new Track($track);
    }
    var_dump($playlistinfo);
  }
  
  public $tracks;
}

class Track {
  function __construct($decoded_json){
    $this->title = $decoded_json['title'];
  }
}
*/
class Player {
  static function big_player($json_pl, $client_id){
    $pl = json_decode($json_pl);  
      
    wp_enqueue_script('fsc_player');
    wp_enqueue_style('fsc_player');
    
    
    $r = '<div id="fsc-' . $pl->id . '" class="fsc-big">';
    $r .= '<div class="title">' . $pl->title . '</div>';
    $r .= '<div class="status">Loading... or no javascript!</div>';
    $r .= '</div>';
    //$r .= "<script>fsc_playlist_player('" . $json_pl . "');</script>";
    $r .= '<script>';
    $r .= "jQuery(document).ready(function(){ fsc_playlist_player('" . $json_pl . "', '{$client_id}');});";
    $r .= '</script>';
    return $r;
 
  }
}



$sound_cloud_player = new SoundCloudPlayer();
?>