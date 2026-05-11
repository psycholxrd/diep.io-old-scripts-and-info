// ==UserScript==
// @name         !bullets dissapear detect
// @namespace    http://tampermonkey.net/
// @version      2024-08-24
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

const ctx = canvas.getContext('2d');
let crx = CanvasRenderingContext2D.prototype;
ctx.arc = new Proxy(ctx.arc, {
    apply(f, _this, args) {
    if(_this.globalAlpha < 0.3){
        console.log(_this);
    }
    return f.apply(_this, args);
    }
});