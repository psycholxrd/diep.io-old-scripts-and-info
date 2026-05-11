// ==UserScript==
// @name         Every Notification = white
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  doesn't work on deathscreen or in menu
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

let paint = "#FFFFFF"; //change this for another color

const methods = ["fillRect"];

methods.forEach(method => {
    const originalMethod = CanvasRenderingContext2D.prototype[method];
    CanvasRenderingContext2D.prototype[method] = function(...args) {
        let color = this.fillStyle;
        if (input.doesHaveTank()) {
            switch (color) {
                case "#0000ff": // AutoSpin & AutoFire
                    this.fillStyle = paint;
                    break
                case "#000000": // Other notifications
                    this.fillStyle = paint;
                    break
            }
        }
        originalMethod.apply(this, args);
    };
});