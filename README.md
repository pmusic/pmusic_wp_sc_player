Planetarium Music WordPress SoundCloud Player
===

A SoundCloud Player for WordPress that is designed to look cool, behave reasonably when the user does not have javascript, and load quickly, even when many players are on a single page.

You can view a  working version of the player here: [http://pmsc.planetariummusic.com](http://pmsc.planetariummusic.com).

The player was prompted by the fact that I have a bunch of SoundCloud players on some of my pages, and loading the players slowed down the overall load time of the pages by quite a bit.  

Features of this player
- Things are sped up by only contacting the soundcloud server when the user wants to listen to something.
- Aside from the album art, no images are needed by the player. All styling is done with CSS and JavaScript. As a result, theming the player only involves modifing the css (or scss) files.
- If the user does not have JavaScript enabled, she will still see the album art and a link to the SoundCloud page.

Many of the cool features of the official SoundCoud player are not implemented -- e.g., you can't comment on the track or see other users' comments, you can't see the play counts, and so on. This is partly 

This is a work in progress -- see below for planned features and work still to be done.


Installation
---
Place the contents  of `pmsc-player.zip` (found in the `build` directory) in your `wp-contet/plugins` folder. Then go to the plugins page in your WordPress admin (`wp-admin/plugins.php`). You should see the "PM SoundCloud Player" plugin in the list. Enable it. 

Now you need to configure the player. Go to the "PM SoundCloud" page in the admin. Enter your "Client ID" and "Client Secret" here. If you don't have those, they're easy to get. Log in to SoundCloud and then go to [http://soundcloud.com/you/apps](http://soundcloud.com/you/apps) to register your app.

Dependencies include:
- PHP curl library

Use
---
The player is added to articles using the shortcode `pmsc`. Tell it which playlist to play by adding the "resource" attribute. E.g. to create a player for the playlist with the id "4280637" add the following to an article:
    [pmsc resource="4280637"]

Build Instructions
---

These instructions are only for developers who want to modify the player. The instructions assume you are on a Unixy system. It shouldn't be hard to figure out how to do it on a Windowy system, though. The build process is pretty simple; it pretty much just bundles a zip for distribution.

Run the `build.sh` script from the build directory. This will create a file in the build directory called `pmsc-player.zip`. 

You need [Compass](http://compass-style.org/) if you want to build the css files. You'll only need to do this if you want to modify the stylesheet; the compiled css files are checked into git.
    
To do
---

- Allow user to skip forward/back within a track by clicking on timeline.
- Create a way to clear the player cache from the database.
- Reduce the cached json to contain only the properties needed by the player.
- Make it work for single tracks, not just playlists.

Third-party stuff used
---
- [Compass](http://compass-style.org/) 
- [SASS](http://sass-lang.com/)
- [SoundManager 2](http://www.schillmania.com/projects/soundmanager2/)

And, of course:
- [WordPress](http://wordpress.org/)
- [SoundCloud](http://soundcloud.com/)