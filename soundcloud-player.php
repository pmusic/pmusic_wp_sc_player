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
}

$sound_cloud_player = new SoundCloudPlayer();
?>