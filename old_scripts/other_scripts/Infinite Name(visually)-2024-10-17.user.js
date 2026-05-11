// ==UserScript==
// @name         Infinite Name(visually)
// @namespace    http://tampermonkey.net/
// @version      2024-10-17
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

function infinite_name(){
    console.log("awaiting");
    let spawn_box = document.querySelector("#spawn-nickname");
    if(spawn_box){
    spawn_box.removeAttribute("maxlength");
    spawn_box.setAttribute("placeholder", "Infinite Name baby");
    }else{
        infinite_name();
    }
}

infinite_name();