<?php
/*
Plugin Name: PM SoundCloud Player
Plugin URI: 
Description: SoundCloud Player that is designed to load quickly, look cool, and behave reasonably when the user does not have javascript.
Version: 0.1 
Author: Alex Bundy 
Author URI: http://www.planetariummusic.com/
License: TODO 
*/
require_once( 'pmsc-config.php' );
class PMSCPlayer {
	
  function  __construct() {
    add_action('admin_init', array($this, 'admin_init'));
    add_action('admin_menu', array($this, 'plugin_menu'));
    add_shortcode('pmsc', array($this, 'pmsc_print'));
    wp_register_script('pmsc_player', plugins_url('js/pmsc_player.js', __FILE__));
    wp_register_script('sc_sdk', 'http://connect.soundcloud.com/sdk.js');
    wp_register_style('pmsc_player', plugins_url('css/pmsc_player.css', __FILE__));
    register_activation_hook( __FILE__, array($this, 'db_init'));
  }

	function plugin_menu(){
    add_options_page( 'PM Soundcloud Player', 'PM SoundCloud', 'manage_options', 'pmsc-player', array($this, 'admin_page') );		
	}

	function admin_page(){
    require('pages/admin_page.php');
	}
  
  function print_text_input( $args ){
    $options = get_option('pmsc_player_options');
    $value = $options[$args['field']];
    
    echo '<input type="text" name="pmsc_player_options[' . $args['field'] . ']" value="' . $value . '" />'; 
  } 
  
  function admin_init(){
    register_setting( 'pmsc_player_options', 'pmsc_player_options');
    add_settings_section('api', 'API', 'admin_page', 'pmsc-player');
    add_settings_field('client_id', 'Client ID', array($this, 'print_text_input'), 'pmsc-player', 'api', array('field'=>'client_id') );
    add_settings_field('client_secret', 'Client Secret', array($this, 'print_text_input'), 'pmsc-player', 'api', array('field'=>'client_secret') );
  }

  /**
   * Shortcode function; prints soundcloud player
   */
  function pmsc_print($atts){
    if($resource = $atts['resource']){ //TODO check if format is valid.
      require_once('lib/php-sc/Services/Soundcloud.php');
      
      $options = get_option('pmsc_player_options');
      $this->client_id = $options['client_id'];
      
      $playlist = $this->get_playlist($resource);
      if($playlist === false){
        return "Couldn't fetch JSON";
      }
      
      //var_dump(json_decode($playlist));
      return $this->big_player($playlist);
      
    } else {
      //TODO add more helpful note.
      return 'Not a valid ressource';
    }
  }
  /**
   * @return string json. FALSE if couldn't fetch json.
   */
  function get_playlist($resource){
    echo $url = 'http://api.soundcloud.com/playlists/' . $resource . '.json?client_id=' . $this->client_id;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $json = curl_exec($ch); 
    // TODO make sure we got a good http response
    curl_close($ch);

    return $json;
  }

  function big_player($json_pl){
    $pl = json_decode($json_pl);  
    
    wp_enqueue_script('sc_sdk');  
    wp_enqueue_script('pmsc_player');
    wp_enqueue_style('pmsc_player');

    $img_url = preg_replace('/large/', 't500x500', $pl->artwork_url);

    
    $r = '<div id="pmsc-' . $pl->id . '" class="pmsc-player pmsc-500" style="' . "background-image:url('" . $img_url . "')\">";
    //$r .= '<div class="title">' . $pl->title . '</div>';
    $r .= '<div class="status">Loading... or no javascript!</div>';
    //$r .= '<img src="' . $img_url . '">';
    $r .= '</div>';
    //$r .= "<script>fsc_playlist_player('" . $json_pl . "');</script>";
    $r .= '<script>';
    $r .= "jQuery(document).ready(function(){ pmsc_playlist_player('" . $json_pl . "', '{$this->client_id}');});";
    $r .= '</script>';
    return $r;
 
  }
  /**
   * create/update database table
   */
  function db_init(){
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    $sql = "CREATE TABLE " . PMSC_PLAYER_DB . "(
              id int unsigned not null,
              json text, 
              UNIQUE KEY  id (id));";
              
    dbDelta( $sql );
  }
}

$sound_cloud_player = new PMSCPlayer();
?>