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

global $wpdb;
require_once( 'pmsc-config.php' );

/**
 * 
 * TODO create way to invalidate cache.
 */
class PMSCPlayer {

  function  __construct() {
    add_action('admin_init', array($this, 'admin_init'));
    add_action('admin_menu', array($this, 'plugin_menu'));
		add_action('wp_print_footer_scripts', array($this, 'player_javascript'));
    add_shortcode('pmsc', array($this, 'pmsc_print'));
    add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
   register_activation_hook( __FILE__, array($this, 'db_init'));
  }
  
  function enqueue_scripts(){
    wp_register_script('pmsc_player', plugins_url('js/pmsc_player.js', __FILE__));
    if( WP_DEBUG ){
      wp_register_script('soundmanager2', plugins_url('js/soundmanager2.js', __FILE__));
    } else {
      wp_register_script('soundmanager2', plugins_url('js/soundmanager2-nodebug-jsmin.js', __FILE__));
    }
    wp_register_style('pmsc_player', plugins_url('css/pmsc_player.css', __FILE__));
    wp_register_style('pmsc_player_icons', plugins_url('css/icons.css', __FILE__));
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
      
      return $this->big_player($playlist);
      
    } else {
      //TODO add more helpful note.
      return 'Not a valid ressource';
    }
  }
  /**
   * Returns the json for the playlist. Also handles cacheing 
   *
   * @param resource string -- id of the soundcloud playlist
   * @return string json. FALSE if couldn't fetch json.
   */
  function get_playlist($resource){
    global $wpdb; 

		$playlist_sql = $wpdb->prepare('SELECT json from ' . PMSC_PLAYER_DB . ' WHERE id=%d', $resource );
		
    $result = $wpdb->get_row( $playlist_sql );
  
  
    if( $result === null ){ 
      $url = 'http://api.soundcloud.com/playlists/' . $resource . '.json?client_id=' . $this->client_id;
      $ch = curl_init($url);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
      $json = curl_exec($ch); 
      curl_close($ch);

			if( $json === false ){
				trigger_error( 'Couldn\t fetch playlist info from soundcloud.', E_USER_ERROR );
				return;
			}

			//todo: trim json.	
  
      // store result in database
      $wpdb->insert( PMSC_PLAYER_DB, array( 'id' => $resource, 'json' => $json ), array( '%d', '%s' ) );
      
      return $json;
    } else {
      return $result->json;
    }
  }

  function big_player($json_pl){
    $pl = json_decode($json_pl);  
    
		wp_enqueue_script('jquery');
    wp_enqueue_script('pmsc_player');
    wp_enqueue_script('soundmanager2');
    wp_enqueue_style('pmsc_player');
    wp_enqueue_style('pmsc_player_icons');

    $img_url = preg_replace('/large/', 't500x500', $pl->artwork_url);
    
    $r = <<<EOF
<div id="pmsc-$pl->id" class="pmsc-player pmsc-500" style="background-image:url('$img_url')">
	<div class="footer">		'
		<a href="$pl->permalink_url">Download<a>
		<div class="hosted">Sounds hosted on <a href="http://soundcloud.com/">SoundCloud</a></div>
	</div>
</div>
EOF;

		$this->javascript .= <<<EOF
	var json_$pl->id = $json_pl;
	pmsc_playlist_player.addPlayer(json_$pl->id);
EOF;

    return $r;
  }

	/**
	 * 
	 * @return string javascript that builds players.
	 */
	function player_javascript(){
		echo <<<EOF
<script type="text/javascript">
jQuery(document).ready(function(){  
		pmsc_playlist_player = new PMSCPlayer('{$this->client_id}'); 
		$this->javascript
});
</script>
EOF;
	}
  /**
   * create/update database table
   */
  function db_init(){
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    $sql = "CREATE TABLE " . PMSC_PLAYER_DB . "(
              id int unsigned not null,
              fetch_time timestamp,
              json text, 
              UNIQUE KEY  id (id));";
              
    dbDelta( $sql );
  }

	private $javascript;
}

$sound_cloud_player = new PMSCPlayer();
?>