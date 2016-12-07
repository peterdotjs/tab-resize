Tab-Resize
==========

[![Join the chat at https://gitter.im/peterdotjs/Tab-Resize](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/peterdotjs/Tab-Resize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Split Screen made easy. Resize the CURRENT tab and tabs to the RIGHT into layouts on separate Windows. w/ Multi Monitor Support.

![Tab Resize Screenshot](https://raw.githubusercontent.com/peterdotjs/resources/master/tab-resize/ss4v4.png)

<br/>

#Install
-------
<a href="https://chrome.google.com/webstore/detail/tab-resize-split-screen-l/bkpenclhmiealbebdopglffmfdiilejc"><img src="https://raw.githubusercontent.com/peterdotjs/resources/master/Franksouza183-Fs-Apps-google-chrome.ico" height="100" width="100"></a><a href="https://addons.opera.com/en/extensions/details/tab-resize-split-screen-layouts/?display=en"><img src="https://raw.githubusercontent.com/peterdotjs/resources/master/opera-browser.png" height="100" width="100"></a>

<br/>

#Demo
-------
 - http://www.youtube.com/watch?v=GFHl98nAV04

<br/>

#Preface
-------
- @ everyone that's liked it, thanks a lot for the support! I'm really glad you guys found it useful. You're pretty much the motivation continuing to build and improve the extension. =) Thanks for checking it out! =)

- If you like it please rate it and if you have any feature requests, questions or bugs you file it here: 
https://github.com/peterdotjs/Tab-Resize/issues?state=open 

- This extension will not resize within the same tab **(multiple panes with only ONE url bar)**.  Other Chrome extensions with multiple panes in one tab have security limitations (i.e. you can't see any https site like Gmail or Facebook). With these types of extensions you also won't be able to access any of your favorite extensions on the individual panes. Tab Resize has <strong>none of the limitations listed previously</strong> because it splits tabs into <strong>separate windows</strong>.

<br/>

#Known Issues
-------
- There is currently a Chrome issue where the popup permissions text is incorrect. It should read: "Access your browsing activity" rather than " Read your browsing history." (https://developer.chrome.com/extensions/permission_warnings#warnings) The extension DOES NOT and CANNOT access your browsing history. I have filed the following bug against the Chrome Team: https://code.google.com/p/chromium/issues/detail?id=462287 

<br/>

#Change Log
-------
###2.3.0
- Added default shortcut keys:
- **Ctrl + Shift + Z**: Undo Last Resize 
- **Ctrl + Shift + 1**: 1x1 Resize 
- **Ctrl + Shift + 2**: 1x2 Resize 
- **Ctrl + Shift + 4**: 2x2 Resize 
- Can still be changed through shortcut key menu.

###2.2.0
- Added support for shortcut keys and scaled split screen layouts.

###2.1.1
- HIGHLIGHTED TABS NOW CAN BE RESIZED (not only tabs to the right) - when 2 or more tabs are highlighted, only these tabs will be considered for resize. In Chrome, you can select multiple tabs by clicking on tabs while holding down the Ctrl (Command for Mac) key or select a range of tabs by holding down the Shift key and clicking. 

###2.1
- Added support for multiple monitors, left and right alignment, empty tab mode, drag and drop to rearrange layouts and highlighted tab mode. Fully supports Windows, Mac and Linux OS.

<br/>

#What
-------
- A simple extension designed to provide ease in resizing your tabs. A set of default layouts are provided but you can add and remove from the list of layouts to fit your needs. With multiple monitor support you can move windows from one screen to the next with ease. 

- Has the functionality of Tab Scissors and much much more!

<br/>

#Why
-------
- Manually resizing windows is no fun.

- You have a very large monitors and have more pixels than you know what do with.

- Quick side by side comparisons.

<br/>

#How it works
-------
- The selected/highlighted tab along with all tabs to the right of it will be considered. Whether you have more or less tabs than are needed the extension will resize only the available tabs. 

- Undo button will undo the previous layout resize. You can only perform undo once at any time.

- In 'single tab' mode, only the selected/highlighted tab will considered. Only the current window/tab will change in size, all other tabs to the right will be ignored. 

- In 'empty tab' mode, new windows with empty tabs will be created if there are not enough tabs to fill your selected layout. 

- You can select left or right alignment for your resize

- You can create your own custom layouts within reason and reset to default configurations if desired. Layouts are sorted most recently created on top right.

- Click and hold on any layout and drag to rearrange order to your liking

- Highlighted tabs now can be resized - when 2 or more tabs are highlighted, only these tabs will be considered for resize. Credit goes to F.C. for the idea. In Chrome, you can select multiple tabs by clicking on tabs while holding down the Ctrl (Command for Mac) key or select a range of tabs by holding down the Shift key and clicking.

<br/>

#Additional Notes
-------
- Only tab/window id info is being used; browsing activity is not. Tabs and browsing activity access are bundled together. "tabs" permissions is one of the least invasive permissions that are available. Browsing activity you should note is NOT the same as Browsing History. "Browsing activity" means the current tabs that are open not your previously closed tabs. This permission is required because this extension needs to manipulate and move tabs around (an essential feature of this extension) If you feel uncomfortable with this basic permission please don't install it. Giving it a bad review because you don't understand or like the permissions doesn't do anything productive. All my code is open sourced on github (https://github.com/peterdotjs/Tab-Resize) so feel free to look at how I'm using this permission.

- It's good to be informed and understand the permissions of any extension you install. For more chrome permission information go here: https://developer.chrome.com/extensions/declare_permissions

- Anonymous usage tracking (# clicks on the different resize options) is used to improve the extension and user experience. You can opt out in the options menu.

<br/>

#License
---------
See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
