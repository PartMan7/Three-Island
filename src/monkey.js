const WINDOW = unsafeWindow;
if (!WINDOW) return;
const OPTIONS = {
	enabled: '1',
	'show-item': '1',
	'show-tera': '1'
};
/*

Instead of using a UI, you'll have to simply edit the values in OPTIONS
Values that you can manually configure in it are:
a) enabled: set '0' for disabled, '1' for enabled
b) 'show-item': '0' for disabled, '1' for enabled
c) 'show-tera': '0' for disabled, '1' for enabled, and '2' for enabling
    only when the type is different from the original default tera type

*/

if (!OPTIONS.enabled) return;
