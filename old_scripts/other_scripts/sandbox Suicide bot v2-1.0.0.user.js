// ==UserScript==
// @name         sandbox Suicide bot v2
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

function loop() {
    window.requestAnimationFrame(loop);
    if (!window.lobby_ip || window.__common__.active_gamemode != 'sandbox') {
        return;
    }
    switch (window.__common__.screen_state) {
        case "in-game":
            document.querySelector("#sandbox-self-destruct").click();
            break
        case "awaiting-spawn":
            extern.try_spawn(document.querySelector("#spawn-nickname").value);
            break
        case "game-over":
            extern.try_spawn(document.querySelector("#spawn-nickname").value);
            break
    }
}

window.requestAnimationFrame(loop);