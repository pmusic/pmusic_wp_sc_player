<h2>SoundCloud Player</h2>
<form method="post" action="options.php">
  <?php 
  settings_fields('pmsc_player_options');
  do_settings_sections('pmsc-player'); 
  submit_button();
  ?>
</form>