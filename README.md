# Three Island

Three Island is a script/extension for Pokémon Showdown on various browsers that allows for a seamless PokéPaste experience.

It is currently a script that may be run on various browsers through Greasemonkey (on Firefox) or Tampermonkey (on Google Chrome, Microsoft Edge, Safari, and Opera Next). The final goal of Three Island is to have a working extension for Firefox and Chrome; work on this has begun!

## Features
* Simple, unobtrusive hoverable elements on all pokepast.es URLs
* PokéPaste previews without actually opening the PokéPaste
* Set details on further hovering
* Copy-with-a-click on set details
* Insta-import buttons that allow you to import a Pokepaste to your teambuidler in one click

## Installation

### Firefox Extension (preview)
The extension hasn't yet been published on the Add-on Store yet, but you can already test it out! Download the `firefox/three-island.xpi` file to your device, open Firefox, visit the [Debugging page](about:debugging) (Firefox-only), click `This Firefox`, and hit `Load Temporary Add-on`. Here, select the XPI file you just downloaded, and voíla! The extension should be running in this session.


**Note**: While using Greasemonkey and Tampermonkey, please **do not** add scripts from sources you don't trust. These scripts have higher permissions than most browser tabs, and can cause significant damage if a malicious script is run. (A file will be added soon explaining the code line-by-line if you're not sure about this script's validity.)

**Note**: Since these are just scripts, they don't update themselves. If you have an older version of the script(s) and would like to update, just copy-paste the whole thing over the old code and save.

### Greasemonkey
1. On Firefox, install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) extension.
2. Once you've added it, click on the extension, click on `New User Script`, and paste in the `greasemonkey.js` file from this repository.
3. Reload your Showdown tab.
Three Island should now be running. If you wish to disable it, click the Greasemonkey extension, click `Three Island`, and toggle off the `Enabled` field. You may need to reload the page to undo changes to loaded PokéPastes.

### Tampermonkey
1. On your browser, install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en) extension from the Google Web Store.
2. Once you've added it, click on the extension, click on `Create a new script...`, and paste in the `tampermonkey.js` file from this repository.
3. Reload your Showdown tab.
Three Island should now be running. If you wish to disable it, click the Tampermonkey extension, and click the green slider next to `Three Island`. You may need to reload the page to undo changes to loaded PokéPastes.

## Planned Features
* Automatic tier-guessing based on the Pokemon used (currently defaults to gen8 since no information is available)
* Being able to import multiple teams at the same time

For contributions, suggestions, questions, or just generic discussion, message me on Discord at PartMan#7321 or contact me on [Smogon](https://www.smogon.com/forums/members/partman.470255/)/Showdown.
