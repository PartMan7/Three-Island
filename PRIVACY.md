### The data Three Island has access to

Three Island doesn't actually look at the messages sent/received by the app. This means that it does not, at any time, have access to sensitive information like your password. It instead works by looking at the HTML nodes for each room / PM, and listening for the addition of new chat messages. Due to this, Three Island technically has access to all messages you send and receive (which is required to detect nodes with PokéPaste URLs), but does not store, view, or otherwise access such messages in any way not required to validate whether or not it has a URL. This may be validated by personally going through the code, which has been supplied with multiple comments explaining what each block of code does.

Three Island does, on the other hand, have access to your Storage on Pokémon Showdown. This means that it has access to all your teams and Showdown settings. Extreme care has been taken to ensure that this has no risks of corrupting your saved data (losing your teams sucks), but it is still recommended that you take a backup of your teams anyways. Three Island will not misuse access to your storage, and will only use it for the purposes of adding new teams as directed by the end user.

Three Island similarly has access to messages on the pages you visit on Smogon, but only searches though nodes to render the PokéPaste previews.

### The data Three Island stores

Three Island stores very little data. The only data it stores is of two types:
* Data fetched from PokéPaste URLs. This data is saved in the window as cache, and is **not** shared anywhere outside your browser tab.
* Data regarding your settings - which is currently just whether you've turned it on or off. This isn't shared outside your tab, either.

That's everything - all data is stored within your browser itself and never shared with outside sources. 

### The data Three Island shares

The only data that Three Island will use/share is the anonymous user statistics as reported by the Firefox Add-ons Store or the Chrome Web Store.


Sprites used in Three Island are the intellectual property of The Pokémon Company. Three Island is not affiliated with Nintendo or Gamefreak. Three Island is not reponsible for any complications or loss of information caused by the use of Three Island.