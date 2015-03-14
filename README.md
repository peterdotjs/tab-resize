Tab-Resize
==========

[![Join the chat at https://gitter.im/peterdotjs/Tab-Resize](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/peterdotjs/Tab-Resize?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Split Screen made easy. Resize the CURRENT tab and tabs to the RIGHT into layouts on separate Windows. w/ Multi Monitor Support.

*** DEMO video *** 
http://www.youtube.com/watch?v=GFHl98nAV04

![Tab Resize Screenshot](https://raw.githubusercontent.com/peterdotjs/resources/master/tab-resize/ss4v4.png)

#Install
- Chrome Web Store: https://chrome.google.com/webstore/detail/tab-resize-split-screen-l/bkpenclhmiealbebdopglffmfdiilejc

- Opera Web Store: https://addons.opera.com/en/extensions/details/tab-resize-split-screen-layouts/?display=en

#Demo
 - http://www.youtube.com/watch?v=GFHl98nAV04

#Change Log:
--------
###2.2.7
- Added default shortcut key for "Undo Resize": "**Ctrl + Shift + Z**". Can still be changed through shortcut key menu.

###2.2.0
- Added support for shortcut keys and scaled split screen layouts.

###2.1.1
- HIGHLIGHTED TABS NOW CAN BE RESIZED (not only tabs to the right) - when 2 or more tabs are highlighted, only these tabs will be considered for resize. In Chrome, you can select multiple tabs by clicking on tabs while holding down the Ctrl (Command for Mac) key or select a range of tabs by holding down the Shift key and clicking. 

###2.1
- Added support for multiple monitors, left and right alignment, empty tab mode, drag and drop to rearrange layouts and highlighted tab mode. Fully supports Windows, Mac and Linux OS.

#What
--------
- A simple extension designed to provide ease in resizing your tabs. A set of default layouts are provided but you can add and remove from the list of layouts to fit your needs. With multiple monitor support you can move windows from one screen to the next with ease. 

#Why
-------
- Manually resizing windows is no fun.

- You have a very large monitors and have more pixels than you know what do with.

- Quick side by side comparisons.

#How it works
-------------------
- The selected/highlighted tab along with all tabs to the right of it will be considered. Whether you have more or less tabs than are needed the extension will resize only the available tabs. 

- Undo button will undo the previous layout resize. You can only perform undo once at any time.

- In 'single tab' mode, only the selected/highlighted tab will considered. Only the current window/tab will change in size, all other tabs to the right will be ignored. 

- In 'empty tab' mode, new windows with empty tabs will be created if there are not enough tabs to fill your selected layout. 

- You can select left or right alignment for your resize

- You can create your own custom layouts within reason and reset to default configurations if desired. Layouts are sorted most recently created on top right.

- Click and hold on any layout and drag to rearrange order to your liking

- Highlighted tabs now can be resized - when 2 or more tabs are highlighted, only these tabs will be considered for resize. Credit goes to F.C. for the idea. In Chrome, you can select multiple tabs by clicking on tabs while holding down the Ctrl (Command for Mac) key or select a range of tabs by holding down the Shift key and clicking.

#Additional Notes
------------------------
- Only tab/window id info is being used; browsing activity is not. Tabs and browsing activity access are bundled together.

