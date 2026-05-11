// ==UserScript==
// @name         My Afk Script (simple)
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  set Afk spot with Q, toggle afk with R
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @require      https://raw.githubusercontent.com/MI301/My-Diep.io-Scripts/refs/heads/main/libraries/DiepUtils
// @license      MIT
// ==/UserScript==

//get api
let api = false;
let awaitApi = setInterval(function(){
  if(typeof DiepUtils === "null"){
    return;
  }
  clearInterval(awaitApi);
  api = true;
}, 400);

//key press functions
const RAW_MAPPING = [
    "KeyA",
    "KeyB",
    "KeyC",
    "KeyD",
    "KeyE",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyI",
    "KeyJ",
    "KeyK",
    "KeyL",
    "KeyM",
    "KeyN",
    "KeyO",
    "KeyP",
    "KeyQ",
    "KeyR",
    "KeyS",
    "KeyT",
    "KeyU",
    "KeyV",
    "KeyW",
    "KeyX",
    "KeyY",
    "KeyZ",
    "ArrowUp",
    "ArrowLeft",
    "ArrowDown",
    "ArrowRight",
    "Tab",
    "Enter",
    "NumpadEnter",
    "ShiftLeft",
    "ShiftRight",
    "Space",
    "Numpad0",
    "Numpad1",
    "Numpad2",
    "Numpad3",
    "Numpad4",
    "Numpad5",
    "Numpad6",
    "Numpad7",
    "Numpad8",
    "Numpad9",
    "Digit0",
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "F2",
    "End",
    "Home",
    "Semicolon",
    "Comma",
    "NumpadComma",
    "Period",
    "Backslash",
];

function key_down(keyString) {
    const index = RAW_MAPPING.indexOf(keyString);
    if (index === -1) {
        console.error(`Invalid key string: ${keyString}`);
        return;
    }
    const result = index + 1; // Add 1 to the index as per your requirement
    input.onKeyDown(result);
}

function key_up(keyString) {
    const index = RAW_MAPPING.indexOf(keyString);
    if (index === -1) {
        console.error(`Invalid key string: ${keyString}`);
        return;
    }
    const result = index + 1; // Add 1 to the index as per your requirement
    input.onKeyUp(result);
}

//AFK logic
let afk = true;
let moving = false;
let your_pos = {x: 0, y: 0};
let goal = {x: 0, y: 0};

document.onkeydown = function(e) {
    //console.log(e.key);
    if(e.key === "q" || e.key === "Q"){
        set_goal(your_pos.x, your_pos.y);
    }else if(e.key === "r" || e.key === "R"){
        afk = !afk;
    }
};

function get_your_pos(){
    window.requestAnimationFrame(get_your_pos);
    if(api){
        const { entityManager } = window.DiepUtils;
        let you = entityManager.getPlayer();
        your_pos.x = you.wx;
        your_pos.y = you.wy;
    }
}
window.requestAnimationFrame(get_your_pos);

function set_goal(x, y){
    console.log("set_goal");
    goal.x = x;
    goal.y = y;
}

function move_to_goal() {
    //console.log(`YOU: x: ${your_pos.x} y: ${your_pos.y} GOAL x: ${goal.x} y: ${goal.y}`);
    if (afk) {
        if (your_pos.x > goal.x) {
            key_up("KeyD");
            key_down("KeyA");
        } else {
            key_up("KeyA");
            key_down("KeyD");
        }
        if (your_pos.y > goal.y) {
            key_up("KeyS");
            key_down("KeyW");
        } else {
            key_up("KeyW");
            key_down("KeyS");
        }
        moving = true;
    }else{
        if(moving){
          key_up("KeyW");
          key_up("KeyA");
          key_up("KeyS");
          key_up("KeyD");
          moving = false;
        }
    }
}
setInterval(move_to_goal, 100);