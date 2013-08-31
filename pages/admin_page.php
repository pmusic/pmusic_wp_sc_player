<h2>SoundCloud Player</h2>
<form method="post" action="options.php">
  <?php 
  settings_fields('soundcloud_player_options');
  do_settings_sections('soundcloud-player'); 
  submit_button();
  ?>
</form>