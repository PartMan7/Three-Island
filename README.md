# Three Island

Three Island is a script/extension for Pokémon Showdown on various browsers that allows for a seamless PokéPaste experience.

It is currently a script that may be run on various browsers through Greasemonkey (on Firefox) or Tampermonkey (on Google Chrome, Microsoft Edge, Safari, and Opera Next). The final goal of Three Island is to have a working extension for Firefox and Chrome; work on this has begun!

## Features
* Simple, unobtrusive hoverable elements on all pokepast.es URLs
* PokéPaste previews without actually opening the PokéPaste
* Insta-import buttons that allow you to import a Pokepaste in one click

## Installation

**Note**: While using Greasemonkey and Tampermonkey, please **do not** add scripts from sources you don't trust. These scripts have higher permissions than most browser tabs, and can cause significant damage if a malicious script is run. (A file will be added soon explaining the code line-by-line if you're not sure about this script's validity.)

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
* Individual set details being shown on hovering over the preview (hoverception :3)
* Individual set importing
* Automatic tier-guessing based on the Pokemon used (currently defaults to gen8 since no information is available)
* Item sprites being added to previews
* Box imports creating a new box instead of capping at 6
* Being able to import multiple teams at the same time

## Known Issues
* Teams in the chatlogs of rooms that are joined in real-time don't have their previews loaded (fix in the works)
* The preview doesn't work in battlerooms and PMs (also in progress)
* The extension doesn't exist yet (working on this too)
* The hover is in dark mode (light mode is bad) (is this even an issue?)

For contributions, questions, or just a generic chat, message me on Discord at PartMan#7321 or contact me on [Smogon](https://www.smogon.com/forums/members/partman.470255/)/Showdown.
