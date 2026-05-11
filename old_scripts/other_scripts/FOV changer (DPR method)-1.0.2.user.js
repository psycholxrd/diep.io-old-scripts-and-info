// ==UserScript==
// @name         FOV changer (DPR method)
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  try to take over the world!
// @author       r!PsAw the goat
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

let dpr = 1;
let loaded = false;
var ui_scale = parseFloat(localStorage.getItem("d:ui_scale"));

function change_fov(fov) {
    dpr = fov;
    window.dpr = dpr;
    let uiScale = ui_scale / dpr;
    const OPTIMAL_SCREEN_WIDTH = 1920;
    const OPTIMAL_SCREEN_HEIGHT = 1080;
    const windowScaling = () => {
        let targetWidth = OPTIMAL_SCREEN_WIDTH;
        let targetHeight = OPTIMAL_SCREEN_HEIGHT;
        return Math.max(window.innerWidth / targetWidth, window.innerHeight / targetHeight);
    };
    const diepScale = dpr * Math.floor(uiScale * windowScaling() * 25) / 25;
    const unscaledDiep = dpr * Math.floor(windowScaling() * 25) / 25;
    extern.setScreensizeZoom(diepScale, unscaledDiep);
    extern.updateDPR(dpr);
};

window.addEventListener('keydown', function(e) {
    if (e.key === "-") {
        dpr = dpr * 0.95;
    }
    if (e.key === "+") {
        dpr = dpr * 1.05;
    }
});

window.addEventListener('resize', function(e) {
    change_fov(dpr);
});

function loop_fov() {
    if (loaded) {
        change_fov(dpr);
    }
}
setInterval(loop_fov, 250);

const touchMethods = ['onTouchMove', 'onTouchStart', 'onTouchEnd'];

function init() {
    if (window.lobby_ip) {
        loaded = true;
        touchMethods.forEach(function(method) {
            input[method] = new Proxy(input[method], {
                apply: function(definition, input_obj, args) {
                    let type = args[0];
                    let x = args[1];
                    let y = args[2];
                    let new_args = [type, x / dpr, y / dpr];
                    return Reflect.apply(definition, input_obj, new_args);
                }
            });
        });
    } else {
        setTimeout(() => {
            init();
        }, 100);
    }
}
init();