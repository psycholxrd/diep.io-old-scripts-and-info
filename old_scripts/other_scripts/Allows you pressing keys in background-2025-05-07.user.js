// ==UserScript==
// @name         Allows you pressing keys in background
// @namespace    http://tampermonkey.net/
// @version      2025-05-07
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

//from Mi300's goofy ahh ip grabber Multibox
(function() {
  unsafeWindow.frozenHasFocus = {
    hasFocus: () => true
  };
  document.hasFocus = () => true;
})();
