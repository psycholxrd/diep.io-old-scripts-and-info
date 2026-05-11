// ==UserScript==
// @name         Hunt notifier
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
win.Object.defineProperty(win.Object.prototype, "HEAPF32", {
        get: function() {
            return undefined;
        },
        set: function(newHeapF32) {
            if (!newHeapF32 || !this.HEAPU32) return;
            delete win.Object.prototype.HEAPF32;
            window.Module = this;
            window.Module.HEAPF32 = newHeapF32;
            win.Module = window.Module;
            win.aim = false;
            initialize();
        },
        configurable: true,
        enumerable: true
    });

function initialize(){
    setInterval(loop, 1000);
}

function loop(){
    if(!window.Module || !window.Module.HEAPF32 || window.Module.HEAPF32.length < 63060) return;
    if(window.Module.HEAPF32[63060] > 500000){
        //implement your own logic, for example sending a message to a Webhook
        console.log('Hunt!');
    }
}