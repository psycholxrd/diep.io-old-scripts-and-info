// ==UserScript==
// @name         Sandbox Auto Level Up
// @namespace    http://tampermonkey.net/
// @version      2024-10-10
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

function lvl_up(){
    if(input.doesHaveTank() > 0){
        document.querySelector("#sandbox-max-level").click();
    }
}
setInterval(lvl_up, 0);