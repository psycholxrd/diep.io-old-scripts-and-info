// ==UserScript==
// @name         with much love
// @namespace    http://tampermonkey.net/
// @version      2025-05-07
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
//to press keys in the background
unsafeWindow.frozenHasFocus = {
    hasFocus: () => true
};
document.hasFocus = () => true;

let level = 45; //45 by default
let active = false;

function level_up() {
    window.requestAnimationFrame(level_up);
    if (!active) return;
    let your_level = win.ripsaw_api.get_your_lvl();
    if (win.ripsaw_api && your_level && your_level < level) {
        extern.onKeyDown(11);
    } else {
        extern.onKeyUp(11);
    }
}
window.requestAnimationFrame(level_up);

document.addEventListener("keydown", (e) => {
    switch (e.code) {
        case "Period":
            active = !active;
            input.inGameNotification(`script active: ${active?"Yes":"No"}`);
            break;
        case "Comma": {
            let _input = prompt("Enter a number between 1 and 45:");
            if (/^\s*(\d+)\s*$/.test(_input)) {
                let number = JSON.parse(_input);
                if (number >= 1 && number <= 45){
                    level = number;
                    input.inGameNotification(`New level was set to ${level}`);
                }else{
                    input.inGameNotification(`Something was wrong with your input`);
                }
            }
        }
        break;
    }
});