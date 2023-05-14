# Three Island
<img src="https://img.shields.io/github/package-json/v/PartMan7/Three-Island?label=Latest"/> <img src="https://img.shields.io/github/last-commit/PartMan7/Three-Island?label=Last%20commit"/> | <img src="https://img.shields.io/amo/v/three-island?label=Firefox"/> <img src="https://img.shields.io/amo/users/three-island?label=Users"/> | <img src="https://img.shields.io/chrome-web-store/v/glhggmffomgbggeobkijjhojkjopfpho?label=Chrome"/> <img src="https://img.shields.io/chrome-web-store/users/glhggmffomgbggeobkijjhojkjopfpho?label=Users"/>

Three Island is a script/extension for Pokémon Showdown on various browsers that allows for a seamless PokéPaste experience.

## Features
* Simple, unobtrusive hoverable elements on all pokepast.es URLs
* PokéPaste previews without actually opening the PokéPaste
* Set details on further hovering
* Copy-with-a-click on set details
* Insta-import buttons that allow you to import a Pokepaste to your teambuilder in one click

## Installation

### Firefox Extension
You can install the extension from addons.mozilla.org at https://addons.mozilla.org/en-US/firefox/addon/three-island/. After installing, make sure the extension is enabled by clicking the icon on the toolbar (which should look like [this](https://media.discordapp.net/attachments/762324232948023316/1103968241832960092/image.png)), and refresh the page!

### Firefox Extension (preview)
You can also test out upcoming versions (if they exist)! Download the `dist/firefox/three_island-latest.xpi` file to your device, open Firefox, visit the Debugging page (about:debugging) (Firefox-only), click `This Firefox`, and hit `Load Temporary Add-on`. Here, select the XPI file you just downloaded, and voíla! The extension should be running in this session.

### Chrome Web Store Extension
You can install the extension from the Chrome Web Store at https://chrome.google.com/webstore/detail/three-island/glhggmffomgbggeobkijjhojkjopfpho. After installing, make sure the extension is enabled by clicking the icon on the toolbar (which should look like [this](https://media.discordapp.net/attachments/762324232948023316/1103968241832960092/image.png)), and refresh the page!

### Chrome (and other browsers) Extension (preview)
You can test out the most recent version of Three Island! Download the `dist/chrome/three_island-latest.zip` file to your device and unzip it. Then navigate to the `chrome://extensions` page (tested on Chrome and Opera), enable Developer mode (if disabled), and select `Load unpacked`. Here, select the unzipped directory (the `three_island-latest` folder) - the extension should now be running!

### Greasemonkey
1. On Firefox, install the [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) extension.
2. Once you've added it, click on the extension, click on `New User Script`, and paste in the `dist/scripts/greasemonkey.js` file from this repository.
3. Reload your Showdown tab.
Three Island should now be running. If you wish to disable it, click the Greasemonkey extension, click `Three Island`, and toggle off the `Enabled` field. You may need to reload the page to undo changes to loaded PokéPastes.

### Tampermonkey
1. On your browser, install the [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) extension from the Google Web Store.
2. Once you've added it, click on the extension, click on `Create a new script...`, and paste in the `dist/scripts/tampermonkey.js` file from this repository.
3. Reload your Showdown tab.
Three Island should now be running. If you wish to disable it, click the Tampermonkey extension, and click the green slider next to `Three Island`. You may need to reload the page to undo changes to loaded PokéPastes.


**Note**: The XPI releases are non-deterministic because ZIPs use timestamps. Use a tool like comp_zip to compare them.

**Note**: While using Greasemonkey and Tampermonkey, please **do not** add scripts from sources you don't trust. These scripts have higher permissions than most browser tabs, and can cause significant damage if a malicious script is run. (Comments have been added explaining the code line-by-line if you're not sure about this script's validity.)

**Note**: Since these last two are just scripts, they don't update themselves. If you have an older version of the script(s) and would like to update, just copy-paste the whole thing over the old code and save.

**Note**: To change Three Island settings in the Greasmonkey/Tampermonkey scripts, modify the values in the OPTIONS variable.

## Contributing
The source files for Three Island are split across `popup` (for the extension display) and `src` (for the injection scripts and actual handlers). To build the extension, run `npm build` (or `node compiler.js`). Pull requests to fix bugs or introduce relevant features are improved, as are issues with detailed explanations.

## Planned Features
* Being able to import multiple teams at the same time
* Importing from Pastebin links (and other paste services)
* Previews are to be shown for formatted text (in greentext blocks (`> link`) and italics/bold (`__link__ or **link**`)).

## Frequently Asked Questions

* The extension isn't working even though it's been installed!
- Did you remember to enable the extension? By default, the extension is **disabled**; you can enable it by clicking the icon and hitting the toggle. If done correctly, the slider underneath the Dhelmise icon in the popup should be blue.
---
* I did that, but it still isn't working!
- Did you refresh the page?
---
* Do you plan on supporting XYZ feature?
- If you'd like to see something added, let me know! I'll investigate and see if it's worth adding / is doable.
---
* Does this track any of my data/teams?
- Nope; you can check out all the details in [PRIVACY.md](PRIVACY.md).
---
* Do you plan on monetizing this?
- Heck no, I may be a broke college student, but I ain't gonna charge for this. Have fun!
---
* This isn't working on the Dragonheaven client!
- Extensions only work on specific whitelisted domains. In the future, I can look into whitelisting specific domains; if you want to do this on your own you can also modify the scopes on the scripts instead of the using an extension. Do note, however, that Dragonheaven has made significant modifications to the client that are incompatible with the current script. If you wish to tweak this on your own, you're welcome to make a pull request; I'll also be looking into addressing this on my own.
---
* Will there be any future versions of this?
- Almost definitely; there's still a couple features that people have wanted, like a similar overlay on Smogon links. I'll be working on adding features to this as and when deemed relevant, so this won't lay stagnant.
---
* Can I share this with my friends?
- Heck yeah, free advertisement!
---
* Can I modify the code?
- Feel free! The code is provided so that you can tweak it to your heart's content. Feel free to add stuff of your own! That being said, if you're publicly releasing an extension / userscript based on Three Island, I'd like to ask you to credit the original author (PartMan7); I did put quite a bit of work into it 'o.o
---
* What is the other Part of PartMan?
- Okay end of the interview no more questions bye~
-----

### Contributions
For contributions, suggestions, questions, or just generic discussion, message me on Discord at PartMan#7321 or contact me on [Smogon](https://www.smogon.com/forums/members/partman.470255/)/Showdown. You can also drop a post on the [Smogon thread for Three Island](https://www.smogon.com/forums/threads/three-island-an-extension-for-a-seamless-pokepaste-experience.3692887/).


### Changelog

### 1.4.3
* Fixed a bug with pastes not being rendered on joined rooms.

#### 1.4.2
* Previews are now shown on formatted text, including greentext, bold, and italics (and any combination thereof)!
* Moved item icons back in front of the Pokémon icons.
* Added more documentation to the code.

#### 1.4.1
* Added the option to toggle `!code` imports.
* Tweaked the UI margins.

### 1.4.0
* Added options to the popout to let users choose how they want previews to render!
* Currently supports item icons (yes/no) and Tera types (yes/no/non-default).
* Sources for `popup-firefox.js` and `popup-chrome.js` have been combined in the same file.
* Fixed a bug with copied sets having no linebreaks on Chrome.

#### 1.3.1
* Fixed a bug in imports (where if you tried to import a team, it would instead open a new tab for the Paste).

### 1.3.0
* Shows previews for the Tera type now (only if explicitly declared)!
* Tera types are now listed in the second (textual info) hover and will be copied along with the set.
* Fixed a minor error shown in console if rooms couldn't be loaded.

#### 1.2.1
* Shows previews on messages seen in chat for those with the `Show PMs in chat` option enabled.

### 1.2.0
* `!code` blocks are now supported!
* The default format for imports is now \[Gen 9\].
* Simplified the message-block parsing interface.

#### 1.1.2
Bugfixes and dev QoL stuff!
* Fixed a bug where previews weren't rendered for Poképastes that had Pokémon without moves.
* Fixed the debug and error logging to show up in the page console instead of the extension console.
* Added clarification messages to Three Island log messages to confirm their origin.
* Rewrote exportTeams to be friendlier to work with and modify.
* Extraneous recursive touch operation on Linux has been removed.
* Added an `npm run watch` script to automatically rebuild the extension while working on the code.
* Removed the UserScript headers from the extension code for both Firefox and Chrome.

#### 1.1.1
Absolutely nothing changed; I just screwed up the upload to Mozilla Add-ons... well, we're now maintaining a list of all versions from this point so _something_ technically changed?

### 1.1.0
Rewrote the entire HTML part to use HTML nodes instead of strings (which was what led to it being temporarily taken down from the Mozilla store). Also added in-page logging.

#### 1.0.3
Very minor tweaks to the code and comments. The architecture of the entire repository changed, which shouldn't affect the extension itself in any way.

#### 1.0.2
Minor bugfixes:
* Sets will no longer throw alerts for invalid hidden powers (this was awkward)
* Pastes with more than 24 sets will not be shown in their entirety; a summary will be shown with the first 24 Pokémon instead
* Fixed a small bug where light mode had white text instead of black

#### 1.0.1
Minor QoL change:
* The extension defaults to 'enabled' instead of 'disabled'

### 1.0.0
Original release!
