// ==UserScript==
// @name         r!PsAw Bot & Mouse helper
// @namespace    http://tampermonkey.net/
// @version      0.0.5.1
// @description  aimbot, farmbot, flipfire(soon!), antiaim
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @require      https://raw.githubusercontent.com/MI301/My-Diep.io-Scripts/refs/heads/main/libraries/DiepUtils/scriptSrc
// @license      MIT
// ==/UserScript==

/*
TODO list:
(√) unpress keys, when no nearest entity
- go to center if either stuck for too long, or no closest Entity for too long
- stop detecting teammates
- stop detecting base drones
- go in straight lines instead of lightning pattern
- prioritise escaping from entities over running to nearest shape
- rework everything once diepUtils updates
*/

//auto lvl up
setInterval(function () {(input.doesHaveTank() && window.__common__.active_gamemode === "sandbox")?document.querySelector("#sandbox-max-level").click():null}, 100);

// temporary GUI
(function createGUI() {
    const guiContainer = document.createElement("div");
    guiContainer.style.position = "fixed";
    guiContainer.style.top = "10px";
    guiContainer.style.right = "10px";
    guiContainer.style.zIndex = "999999";
    guiContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    guiContainer.style.color = "white";
    guiContainer.style.padding = "10px";
    guiContainer.style.border = "2px solid white";
    guiContainer.style.borderRadius = "5px";
    guiContainer.style.fontFamily = "Arial, sans-serif";
    guiContainer.style.fontSize = "14px";

    guiContainer.innerHTML = `
    <h3 style="margin: 0 0 10px; text-align: center;">Bot Settings</h3>
    <label><input type="checkbox" id="aimbot" checked> Aimbot</label><br>
    <label><input type="checkbox" id="farmbot" checked> Farmbot</label><br>
    <label><input type="checkbox" id="respawn" checked> Bot Respawn + build & E</label><br>
    <label><input type="checkbox" id="movement" checked> Bot movement</label><br>
    <h3 style="margin: 0 0 10px; text-align: center;">Other Things</h3>
    <label><input type="checkbox" id="anti_aim"> Anti Aim</label><br>
    <label><input type="checkbox" id="freeze"> Freeze</label><br>
    <button id="closeGUI" style="margin-top: 10px; width: 100%;">Close</button>
`;


    document.body.appendChild(guiContainer);

    const checkboxes = guiContainer.querySelectorAll("input[type='checkbox']");
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            const mode = checkbox.id;
            config[mode] = checkbox.checked;
            console.log(`${mode} is now ${config[mode] ? "enabled" : "disabled"}`);
        });
    });

    document.getElementById("closeGUI").addEventListener("click", () => {
        guiContainer.style.display = "none";
    });
})();

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

//config for mouse
let coords = {
    x: 0,
    y: 0
}

let config = {
    simulateRealMouse: false, //done
    aimbot: true, //done
    farmbot: true, //done
    respawn: true, //done
    movement: true, //done
//    flipfire: false, //won't work on this one for now
    anti_aim: false, //done
    freeze: false //done
}

//anti aim
let shooting = false;

function detect_corner(){
    let w = window.innerWidth;
    let h = window.innerHeight;
    let center = {
        x: w/2,
        y: h/2
    };
    let lr, ud;
    coords.x > center.x? lr = "r": lr = "l";
    coords.y > center.y? ud = "d": ud = "u";
    return lr + ud;
}

function look_at_corner(corner){
    if(!shooting){
    let w = window.innerWidth;
    let h = window.innerHeight;
    switch(corner) {
        case "lu":
            anti_aim_at(w, h);
            break
        case "ld":
            anti_aim_at(w, 0);
            break
        case "ru":
            anti_aim_at(0, h);
            break
        case "rd":
            anti_aim_at(0, 0);
            break
    }
    }
}

//AIMBOT
let moving_keys = {
    "KeyW": false,
    "KeyA": false,
    "KeyS": false,
    "KeyD": false
};

let unpressed = {
    aim_bot: false,
    farm_bot: false
};

let aim_mode = "Aim Bot";

function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function sub_move(cond1, cond2, key1, key2){
    if(cond1 > cond2){
        if(moving_keys[key1]){
            key_up(key1);
            moving_keys[key1] = false;
        }
        if(!moving_keys[key2]){
            key_down(key2);
            moving_keys[key2] = true;
        }
    }else{
        if(moving_keys[key2]){
            key_up(key2);
            moving_keys[key2] = false;
        }
        if(!moving_keys[key1]){
            key_down(key1);
            moving_keys[key1] = true;
        }
    }
}

function handle_movement(x1, y1, x2, y2, mode){
    switch(mode){
        case "move_to":
            sub_move(x1, x2, "KeyD", "KeyA");
            sub_move(y1, y2, "KeyS", "KeyW");
            break
        case "move_from":
            sub_move(x1, x2, "KeyA", "KeyD");
            sub_move(y1, y2, "KeyW", "KeyS");
            break
    }
}

function sub_unpress(key){
    if(moving_keys[key]){
        key_up(key);
        moving_keys[key] = false;
    }
}

function unpress(){
    sub_unpress("KeyW");
    sub_unpress("KeyA");
    sub_unpress("KeyS");
    sub_unpress("KeyD");
}

//handle configs
function handle_config(){
    window.requestAnimationFrame(handle_config);
    (!config.freeze && config.simulateRealMouse)?mouse_move(coords.x, coords.y):null;
    config.aimbot?aimbot("On"):aimbot("Off");
//    config.flipfire?flipfire("On"):flipfire("Off");
    config.anti_aim?anti_aim("On"):anti_aim("Off");
    config.farmbot?farmbot("On"):farmbot("Off");
    config.respawn?respawn("On"):respawn("Off");
    config.freeze?freezeMouseMove():unfreezeMouseMove();
}
window.requestAnimationFrame(handle_config);

function respawn(toggle){
    switch (toggle) {
        case "On":
            if(!input.doesHaveTank()){
                input.try_spawn("r!PsAw Bot");
                setTimeout(() => {
                key_down("KeyE");
                setTimeout(() => {
                key_up("KeyE");
                }, 100);
                }, 500);
            }else{
                input.execute("game_stats_build 555555566666667777777444888888823");
            }
            break
        case "Off":
            break
    }
}

function aimbot(toggle){
    switch (toggle) {
        case "On":{
            if(api && !window.upgrading){
                const { entityManager } = window.DiepUtils;
                let you = entityManager.getPlayer();
                let target_player = entityManager.getClosestEntity("player");
                 //if (target_player && !config.freeze && you.color != target_player.color) {
                if (target_player && !config.freeze) {
                 mouse_move(target_player.x, target_player.y);
                 if(config.movement){
                     unpressed.aimbot=false;
                     handle_movement(you.wx, you.wy, target_player.wx, target_player.wy, "move_from");
                 }
                } else {
                 if(!unpressed.aimbot)unpress();unpressed.aimbot=true;
                 console.log("No players found");
                }
              }
            }
            break
        case "Off":
            break
    }
}

function farmbot(toggle){
    switch (toggle) {
        case "On":{
            if(api && !window.upgrading){
                const { entityManager } = window.DiepUtils;
                let you = entityManager.getPlayer();
                let target_shape = entityManager.getClosestEntity("shape");
                 if (target_shape && !config.freeze) {
                 //console.log(target_shape);
                 mouse_move(target_shape.x, target_shape.y);
                 if(config.movement){
                     unpressed.farmbot=false;
                     handle_movement(you.wx, you.wy, target_shape.wx, target_shape.wy, "move_to");
                 }
                } else {
                 if(!unpressed.farmbot)unpress();unpressed.farmbot=true;
                 console.log("No Shapes found");
                }
              }
            }
            break
        case "Off":
            break
    }
}

//won't work on this one for now
/*
function flipfire(toggle){
    switch (toggle) {
        case "On":
            //additional logic...
            break
        case "Off":
            //additional logic...
            break
    }
}
*/

//coming soon...
function anti_aim(toggle){
     switch (toggle) {
        case "On":
             if(!config.freeze){
             freezeMouseMove();
             look_at_corner(detect_corner());
             }
            break
        case "Off":
            (isFrozen && !config.freeze)?unfreezeMouseMove():null;
            break
    }
}

//actual code
let isFrozen = false;

// Intercept and freeze mousemove events
document.onmousemove = function(event) {
    coords.x = event.clientX;
    coords.y = event.clientY;
    if (isFrozen) {
        event.stopImmediatePropagation();
        //console.log("Mousemove event blocked.");
    }
};

document.onmousedown = function(event) {
    if(config.anti_aim){
        if(shooting){
           return;
        }
        shooting = true;
        event.stopImmediatePropagation;
         setTimeout(function(){
             shooting = false;
             mouse_move(coords.x, coords.y);
              click_at(coords.x, coords.y);
         }, 100);
    };
}

// Example: Freeze and unfreeze
function freezeMouseMove() {
    isFrozen = true;
    //console.log("Mousemove events are frozen.");
}

function unfreezeMouseMove() {
    isFrozen = false;
    //console.log("Mousemove events are active.");
}

function click_at(x, y){
     input.onTouchStart(-1, x, y);
    setTimeout(() => {
     input.onTouchEnd(-1, x, y);
    }, 150);
    setTimeout(() => {
    shooting = false;
    }, 500);
}

function mouse_move(x, y) {
    input.onTouchMove(-1, x, y);
}

function anti_aim_at(x, y){
    if(shooting){
       return;
    }
    mouse_move(x, y);
}