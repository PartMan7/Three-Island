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

### Chrome (and other browsers) Extension (preview)
The extension hasn't yet been published on the Chrome Web Store yet, but you can test it out! Download the `chrome/three-island.zip` file to your device and unzip it. Then navigate to the `chrome://extensions` page (tested on Chrome and Opera), enable Developer mode (if disabled), and select `Load unpacked`. Here, select the unzipped directory (the `three-island` folder) - the extension should now be running!


**Note**: While using Greasemonkey and Tampermonkey, please **do not** add scripts from sources you don't trust. These scripts have higher permissions than most browser tabs, and can cause significant damage if a malicious script is run. (Comments have been added explaining the code line-by-line if you're not sure about this script's validity.)

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

## Frequently Asked Questions

* The extension isn't working even though it's been installed!
- Did you remember to enable the extension? By default, the extension is **disabled**; you can enable it by clicking the icon and hitting the toggle. If done correctly, the slider underneath the Dhelmise icon in the popup should be blue.

* Do you plan on supporting XYZ feature?
- If you'd like to see something added, let me know! I'll investigate and see if it's worth adding / is doable.

* Does this track any of my data/teams?
- Nope; you can check out all the details in [PRIVACY.md](PRIVACY.md).

* Do you plan on monetizing this?
- Heck no, I may be a broke college student, but I ain't gonna charge for this. Have fun!

* This isn't working on the Dragonheaven client!
- Extensions only work on specific whitelisted domains. In the future, I can look into whitelisting specific domains; if you want to do this on your own you can also modify the scopes on the scripts instead of the using an extension. Do note, however, that Dragonheaven has made significant modifications to the client that are incompatible with the current script. If you wish to tweak this on your own, you're welcome to make a pull request; I'll also be looking into addressing this on my own.

* Will there be any future versions of this?
- Almost definitely; there's still a couple features that people have wanted, like a similar overlay on Smogon links. I'll be working on adding features to this as and when deemed relevant, so this won't lay stagnant.

* Can I share this with my friends?
- Heck yeah, free advertisement!

* Can I modify the code?
- Feel free! The code is provided so that you can tweak it to your heart's content. Feel free to add stuff of your own! That being said, if you're publicly releasing an extension / userscript based on Three Island, I'd like to ask you to credit the original author (PartMan7); I did put quite a bit of work into it 'o.o

* What is the other Part of PartMan?
- Okay end of the interview no more questions bye~

### Contributions
For contributions, suggestions, questions, or just generic discussion, message me on Discord at PartMan#7321 or contact me on [Smogon](https://www.smogon.com/forums/members/partman.470255/)/Showdown.
