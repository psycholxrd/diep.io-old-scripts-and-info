// ==UserScript==
// @name         Diep.io+ (GUI update + Tank lines)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  autorespawn(auto ad watcher with 2min timer), leader arrow + minimap arrow, FOV & diepUnits & windowScaling() calculator, Factory controls overlay, bullet distance (FOR EVERY BULLET SPEED BUILD) of 75% tanks, copy party link, leave game, no privacy settings button, no apes.io advertisment, net_predict_movement false
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// ==/UserScript==
 
//!!!WARNING!!! Ui scale has to be at 0.9x for this script to work//
let ingamescreen = document.getElementById("in-game-screen");
 
//GUI
const container = document.createElement('div');
container.style.position = 'fixed';
container.style.top = '10px';
container.style.left = '75px';
container.style.padding = '15px';
container.style.backgroundImage = 'linear-gradient(#ffffff, #79c7ff)';
container.style.color = 'white';
container.style.borderRadius = '10px';
container.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
container.style.minWidth = '200px';
container.style.zIndex = '10';
 
const title = document.createElement('h1');
title.textContent = 'Diep.io+ (hide with J)';
title.style.margin = '0 0 5px 0';
title.style.fontSize = '24px';
title.style.textAlign = 'center';
title.style.color = '#fb2a7b';
title.style.zIndex = '11';
container.appendChild(title);
 
const subtitle = document.createElement('h3');
subtitle.textContent = 'made by r!PsAw';
subtitle.style.margin = '0 0 15px 0';
subtitle.style.fontSize = '14px';
subtitle.style.textAlign = 'center';
subtitle.style.color = '#6fa8dc';
subtitle.style.zIndex = '11';
container.appendChild(subtitle);
 
const categories = ['Debug', 'Visual', 'Functional'];
const categoryButtons = {};
const categoryContainer = document.createElement('div');
categoryContainer.style.display = 'flex';
categoryContainer.style.justifyContent = 'space-between';
categoryContainer.style.marginBottom = '15px';
categoryContainer.style.zIndex = '12';
 
categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.style.flex = '1';
    button.style.padding = '8px';
    button.style.margin = '0 5px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.backgroundColor = '#0000ff';
    button.style.color = 'white';
    button.style.transition = 'background-color 0.3s';
    button.style.zIndex = '13';
 
    button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#0000ff';
    });
    button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#fb2a7b';
    });
 
    categoryContainer.appendChild(button);
    categoryButtons[category] = button;
});
 
container.appendChild(categoryContainer);
 
const contentArea = document.createElement('div');
contentArea.style.marginTop = '15px';
contentArea.style.zIndex = '12';
container.appendChild(contentArea);
 
const toggleButtons = {
    Debug: {
        'Toggle Text': false,
        'Toggle Middle Circle': false,
        'Toggle Upgrades': false
    },
    Visual: {
        'Toggle Aim Lines': false,
        'Toggle Bullet Distance': false,
        'Toggle Minimap': false,
        'Toggle Leader Angle': false
    },
    Functional: {
        'Auto Respawn': false,
        'Toggle Leave Button': false
    }
};
 
function createToggleButton(text, initialState) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.marginBottom = '10px';
    button.style.padding = '8px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.transition = 'background-color 0.3s';
    button.style.zIndex = '13'; // Increase z-index for each toggle button
    updateButtonColor(button, initialState);
 
    button.addEventListener('click', () => {
        toggleButtons[currentCategory][text] = !toggleButtons[currentCategory][text];
        updateButtonColor(button, toggleButtons[currentCategory][text]);
    });
 
    return button;
}
 
function updateButtonColor(button, state) {
    if (state) {
        button.style.backgroundColor = '#63a5d4';
        button.style.color = 'white';
    } else {
        button.style.backgroundColor = '#a11a4e';
        button.style.color = 'white';
    }
}
 
let currentCategory = '';
function showCategory(category) {
    contentArea.innerHTML = '';
    currentCategory = category;
 
    Object.keys(categoryButtons).forEach(cat => {
        if (cat === category) {
            categoryButtons[cat].style.backgroundColor = '#0000ff';
        } else {
            categoryButtons[cat].style.backgroundColor = '#fb2a7b';
        }
    });
 
    if (category === 'Functional') {
        const copyLinkButton = document.createElement('button');
        copyLinkButton.textContent = 'Copy Party Link';
        copyLinkButton.style.display = 'block';
        copyLinkButton.style.width = '100%';
        copyLinkButton.style.marginBottom = '10px';
        copyLinkButton.style.padding = '8px';
        copyLinkButton.style.cursor = 'pointer';
        copyLinkButton.style.border = 'none';
        copyLinkButton.style.borderRadius = '5px';
        copyLinkButton.style.backgroundColor = '#2196F3';
        copyLinkButton.style.color = 'white';
        copyLinkButton.style.transition = 'background-color 0.3s';
        copyLinkButton.style.zIndex = '13';
 
        copyLinkButton.addEventListener('mouseover', () => {
            copyLinkButton.style.backgroundColor = '#1E88E5';
        });
        copyLinkButton.addEventListener('mouseout', () => {
            copyLinkButton.style.backgroundColor = '#2196F3';
        });
 
        copyLinkButton.addEventListener('click', () => {
        document.getElementById("copy-party-link").click();
        });
        contentArea.appendChild(copyLinkButton);
    }
 
    Object.keys(toggleButtons[category]).forEach(text => {
        const button = createToggleButton(text, toggleButtons[category][text]);
        contentArea.appendChild(button);
    });
}
 
Object.keys(categoryButtons).forEach(category => {
    categoryButtons[category].addEventListener('click', () => showCategory(category));
});
 
document.body.appendChild(container);
//
 
let ui_scale = document.querySelector("#settings-modal > div > div:nth-child(1) > div > div:nth-child(1) > label > span")
function ui_scale_check(){
 if(ui_scale.innerHTML != "-" && ui_scale.innerHTML != null && ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
  if(ui_scale.innerHTML != "0.9x"){
   input.inGameNotification("please change your ui_scale to 0.9x in Menu -> Settings");
   console.log(ui_scale.innerHTML);
  }else{
   console.log("no alert");
  }
  clearInterval(interval_for_ui_scale);
 }
}
let interval_for_ui_scale = setInterval(ui_scale_check, 0);
 
//check scripts
let script_list = {
    minimap_leader_v1: null,
    minimap_leader_v2: null,
    fov: null,
    set_transform_debug: null,
    moveToLineTo_debug: null,
    gamemode_detect : null
};
 
function check_ripsaw_scripts() {
    if (ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")) {
        script_list.minimap_leader_v1 = !!window.m_arrow;
        script_list.minimap_leader_v2 = !!window.M_X;
        script_list.fov = !!window.HEAPF32;
        script_list.set_transform_debug = !!window.crx_container;
        script_list.moveToLineTo_debug = !!window.y_and_x;
        script_list.gamemode_detect = !!window.gm;
    }
}
setInterval(check_ripsaw_scripts, 500);
 
//detect gamemode
let gamemode;
function check_gamemode (){
 if(script_list.gamemode_detect){
 gamemode = window.gm;
 }else{
 let gamemode_sel_btn = document.querySelector("#gamemode-selector > div > div.selected");
   switch(gamemode_sel_btn.getAttribute("value")){
       case "ffa":
           gamemode = "ffa";
           break
       case "teams":
           gamemode = "2tdm";
           break
       case "4teams":
           gamemode = "4tdm";
           break
       case "maze":
           gamemode = "maze";
           break
      case "event":
           gamemode = "mothership";
           break
      case "sandbox":
           gamemode = "sandbox";
           break
   }
 }
}
 
setInterval(check_gamemode, 100);
 
//detect if dead or alive
let state = "idk yet";
function check_state(){
 switch(input.doesHaveTank()){
    case 0:
        state = "in menu";
        break
    case 1:
        state = "in game";
        break
 }
}
 
setInterval(check_state, 100);
//config
var two = canvas.width/window.innerWidth;
var debugboolean = false;
var script_boolean = true;
 
// Mouse coordinates
var uwuX = '0'; var uwuY = '0';
document.addEventListener('mousemove', function(e) {
   uwuX = e.clientX;
   uwuY = e.clientY;
});
 
//net_predict_movement false
(function() {
  function applySettings() {
      input.execute("net_predict_movement false");
  }
 
  function waitForGame() {
      if (window.input && input.execute) {
          applySettings();
      } else {
          setTimeout(waitForGame, 100);
      }
  }
  waitForGame();
})();
 
//annoying html elements
let ads_removed = false;
function instant_remove() {
    let privacy_btn = document.getElementById("cmpPersistentLink");
    let apes_btn = document.getElementById("apes-io-promo");
    let discord_ad = document.querySelector("#apes-io-promo > img");
    let annoying = document.querySelector("#last-updated");
    if (privacy_btn) {
        privacy_btn.remove();
    }
 
    if(annoying) {
        annoying.remove();
    }
 
    if (apes_btn) {
        apes_btn.remove();
    }
 
    if (discord_ad) {
        discord_ad.remove();
    }
 
    if (!privacy_btn && !apes_btn && !discord_ad && !annoying) {
        console.log("removed buttons, quitting...");
        clearInterval(interval);
    }
};
 
let interval = setInterval(instant_remove, 100);
 
//timer for bonus reward
const gameOverScreen = document.getElementById('game-over-screen');
const ad_btn = document.getElementById("game-over-video-ad");
var ad_btn_free = true;
 
const timerDisplay = document.createElement('h1');
timerDisplay.textContent = "Time left to collect next bonus levels: 02:00";
gameOverScreen.appendChild(timerDisplay);
 
let timer;
let totalTime = 120; // 2 minutes in seconds
 
function startTimer() {
    clearInterval(timer);
    timer = setInterval(function() {
        if (totalTime <= 0) {
            clearInterval(timer);
            timerDisplay.textContent = "00:00";
        } else {
            totalTime--;
            let minutes = Math.floor(totalTime / 60);
            let seconds = totalTime % 60;
            timerDisplay.textContent =
                `Time left to collect next bonus levels: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}
 
function resetTimer() {
    if(totalTime === 0){
    clearInterval(timer);
    totalTime = 120; // Reset to 2 minutes
    timerDisplay.textContent = "02:00";
    }
}
 
ad_btn.addEventListener('click', check_ad_state);
 
function check_ad_state(){
    if(totalTime === 0){
        resetTimer();
    }else if(totalTime === 120){
        ad_btn_free = true;
        startTimer();
    }else{
        ad_btn_free = false;
    }
}
 
//autorespawn old method
 
/*
let autorespawn = false;
 
function respawn(){
 if(toggleButtons.Functional['Auto Respawn']){
  if(ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
   return;
  }else{
   if(totalTime === 120 || totalTime === 0){
    ad_btn.click();
   }else{
    let spawnbtn = document.getElementById("spawn-button");
    spawnbtn.click();
  }
  }
 }
}
 
setInterval(respawn, 1000);
*/
 
//autorespawn new method (no bonus level)
function respawn(){
 if(toggleButtons.Functional['Auto Respawn']){
    if(state === "in menu"){
     let spawnbtn = document.getElementById("spawn-button");
        spawnbtn.click();
    }
 }
}
 
setInterval(respawn, 1000);
//toggle leave game
let ingame_quit_btn = document.getElementById("quick-exit-game");
 
function check_class(){
  if(toggleButtons.Functional['Toggle Leave Button']){
   ingame_quit_btn.classList.remove("hidden");
   ingame_quit_btn.classList.add("shown");
  }else{
   ingame_quit_btn.classList.remove("shown");
   ingame_quit_btn.classList.add("hidden");
  }
}
 
setInterval(check_class, 300);
 
//find the current Level (credits to abc)
CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
    apply(fillRect, ctx, [text, x, y, ...blah]) {
        if (text.startsWith('Lvl ')) {
            currentLevel = text.split(' ')[1];
            if(text.split(' ')[3] != undefined){
              tanky = text.split(' ')[2] + text.split(' ')[3];
            }else{
              tanky = text.split(' ')[2]
            }
        }
        fillRect.call(ctx, text, x, y, ...blah);
    }
});
 
//Detect AutoFire/AutoSpin
let auto_fire = false;
let auto_spin = false;
 
function f_s(f_or_s){
    switch (f_or_s){
        case "fire":
            auto_fire = !auto_fire;
            break
        case "spin":
            auto_spin = !auto_spin;
            break
    }
}
//Diep Units & fov calculator
//NOTE: I removed spaces between tank names for this script only. Also since glider came out and diepindepth was unupdated it didn't update correctly, I fixed that.
 
/*
=============================================================================
Skid & Noob friendly calculation explained:
 
Read this in order to understand, how the position calculation works.
 
1. Canvas/window coords
When you load diep.io in a browser window, it also loads a canvas where the game is drawn.
Imagine a piece of paper where you draw things, this is canvas. If you place a pen on that piece of paper, this is html element.
Diep.io uses canvas mainly. Your window and the canvas use different coordinate systems, even tho they appear the same at first:
 
start->x
|
\/
y
 
if x is for example 3 and y is 5, you find the point of your mouse.
 
start->x...
|_________|
\/________|
y_________|
._________|
._________|
._________|
._________|
._________HERE
 
the right upper corner of your window is the x limit, called window.innerWidth
the left bottom corner of your window is the y limit, called window.innerHeight
 
canvas is the same, but multiplied by 2. So for x, it's canvas.height = window.innerHeight * 2
same goes for y, canvas.width = window.innerWidth * 2
 
This can work the other way around too. canvas.height/2 = window.innerHeight
and canvas.width/2 = window.innerWidth
 
NOTE: when you use input.mouse(x, y) you're using the canvas coordinate system.
 
2. DiepUnits
Read this first: https://github.com/ABCxFF/diepindepth/blob/main/canvas/scaling.md
if you're curious about what l and Fv means, like I was I can tell you now.
 
L stands for your Tank level, that you currently have.
Fv is the fieldFactor. You can find them here for each tank: https://github.com/ABCxFF/diepindepth/blob/main/extras/tankdefs.json
(The formula from the picture as code: const FOV = (level, fieldFactor) => (.55*fieldFactor)/Math.pow(1.01, (level-1)/2); )
 
Additions:
DiepUnits are used, to draw all entities in game in the right size. For example when you go Ranger, they appear smaller
because your entire ingame map shrinks down, so you see more without changing the size of the canvas or the window.
So if a square is 55 diepunits big and it gets visually smaller, it's still 55 diepunits big.
 
Coordinate system: x*scalingFactor, y*scalingFactor
 
IMPORTANT!!! Note that your Tank is getting additional DiepUnits with every level it grows.
This formula descritbes it's growth
53 * (1.01 ** (currentLevel - 1));
 
3. WindowScaling
Read this first: https://github.com/ABCxFF/diepindepth/blob/main/canvas/scaling.md
(you can use the function given in there, if you don't want to make your own)
 
it's used for all ui elements, like scoreboard, minimap or stats upgrades.
NOTE: It's not used for html Elements, only canvas. So the starting menu or gameover screen aren't part of it.
 
Coordinate system: x*windowScaling(), y*windowScaling()
 
4. Converting coordinate systems into each other
canvas         -> window            = a/2 -> b
window         -> canvas            = a*2 -> b
windowScaling  -> window            = ( a*windowScaling() )/2 -> b
windowScaling  -> canvas            = a*windowScaling() - > b
diepUnits      -> canvas            = a/scalingFactor -> b
diepUnits      -> window            = ( a/scalingFactor )/2 -> b
window         -> diepUnits         = ( a*scalingFactor )*2 -> b
canvas         -> diepUnits         = a*scalingFactor -> b
window         -> windowScaling()   = ( a*windowScaling() )*2 -> b
canvas         -> windowScaling()   = a*windowScaling() - > b
diepUnits      -> windowScaling()   = ( a/scalingFactor ) * fieldFactor -> b
windowScaling()-> diepUnits         = ( a/fieldFactor ) * scalingFactor -> b
 
=============================================================================
 
My todo list or fix:
 
- simulate diep.io moving and knockback physics
 
- simulate diep.io bullets
 
- figure out how to simulate mouse click events
 
- Finish bullet speed hybrid tanks
 
- Figure out physics for sniper, Ranger etc.
 
=============================================================================
 
Useful info:
 
-shape sizes:
 
tank lvl 1 size = 53 diep units
 
grid square side length = 50 diep units
square, triangle = 55 diep units
pentagon = 75 diep units
small crasher = 35 diep units
big crasher = 55 diep units
alpha pentagon = 200 diep units
 
=============================================================================
*/
var currentLevel = 0;
var lastLevel = 0;
var tanky = "";
let ripsaw_radius;
let fieldFactor = 1.0;
let found = false;
let loltank ;let lolztank;
let diepUnits = 53 * (1.01 ** (currentLevel - 1));
let FOV = (0.55 * fieldFactor) / Math.pow(1.01, (currentLevel - 1) / 2);
let scalingFactor = FOV * windowScaling();
const fieldFactors = [
    {tank: "Sniper", factor: 0.899},
    {tank: "Overseer", factor: 0.899},
    {tank: "Overlord", factor: 0.899},
    {tank: "Assassin", factor: 0.8},
    {tank: "Necromancer", factor: 0.899},
    {tank: "Hunter", factor: 0.85},
    {tank: "Stalker", factor: 0.8},
    {tank: "Ranger", factor: 0.699},
    {tank: "Manager", factor: 0.899},
    {tank: "Predator", factor: 0.85},
    {tank: "Trapper", factor: 0.899},
    {tank: "GunnerTrapper", factor: 0.899},
    {tank: "Overtrapper", factor: 0.899},
    {tank: "MegaTrapper", factor: 0.899},
    {tank: "Tri-Trapper", factor: 0.899},
    {tank: "Smasher", factor: 0.899},
    {tank: "Landmine", factor: 0.899},
    {tank: "Streamliner", factor: 0.85},
    {tank: "AutoTrapper", factor: 0.899},
    {tank: "Battleship", factor: 0.899},
    {tank: "AutoSmasher", factor: 0.899},
    {tank: "Spike", factor: 0.899},
    {tank: "Factory", factor: 0.899},
    {tank: "Skimmer", factor: 0.899},
    {tank: "Glider", factor: 0.899},
    {tank: "Rocketeer", factor: 0.899},
]
 
function windowScaling() {
  const a = canvas.height / 1080;
  const b = canvas.width / 1920;
  return b < a ? a : b;
}
 
function calculateFOV(Fv, l) {
    const numerator = 0.55 * Fv;
    const denominator = Math.pow(1.01, (l - 1) / 2);
    if(typeof window.HEAPF32 !== 'undefined' && typeof window.fov !== 'undefined' && window.fov.length > 0){
     //use this part, if you have a fov script that can share it's fov value with you
     FOV = HEAPF32[fov[0]];
    }else{
     //use this part if you have no fov script
     FOV = numerator / denominator;
    }
    return FOV;
}
 
function apply_values(FF){
        calculateFOV(FF, currentLevel);
        scalingFactor = FOV * windowScaling();
        ripsaw_radius = diepUnits * scalingFactor;
        diepUnits = 53 * (1.01 ** (currentLevel - 1));
}
 
function apply_changes(value){
    if(found){
        fieldFactor = fieldFactors[value].factor;
        loltank = tanky;
        lastLevel = currentLevel;
        apply_values(fieldFactor);
    }else{
     if(value === null){
        fieldFactor = 1.0;
        loltank = "default";
        lolztank = tanky;
        lastLevel = currentLevel;
        apply_values(fieldFactor);
     }
    }
}
 
function bruteforce_tanks(){
    for (let i = 0; i < fieldFactors.length; i++){
        if(tanky.includes(fieldFactors[i].tank)){
            found = true;
            console.log("FOUND TANK " + fieldFactors[i].tank);
            apply_changes(i);
            break;
        }else{
            found = false;
            if(i < fieldFactors.length - 1){
             console.log(`checking tank ${i}`);
            }else{
             console.log("No Tank was found, resetting to default")
             apply_changes(null);
            }
        }
    }
}
 
window.addEventListener("resize", bruteforce_tanks);
 
function check_lvl_change() {
    if(lastLevel === currentLevel){
        //console.log("level wasn't changed");
    }else{
        console.log("changed level, bruteforcing");
        bruteforce_tanks();
    }
}
 
function check_change(){
    //console.log("lastLevel: " + lastLevel + " currentLevel: " + currentLevel);
    check_lvl_change();
    if(loltank != tanky){
        if(loltank === "default"){
            if(lolztank != tanky){
                bruteforce_tanks();
            }else{
              return;
            }
        }else{
            bruteforce_tanks();
        }
    }
}
 
setInterval(check_change, 250);
 
//canvas gui
let offsetX = 0;
let offsetY = 0;
//for canvas text height and space between it
let text_startingY = 450*windowScaling();let textAdd = 25*windowScaling();
let selected_box = null;
const boxes = [
    {color: "lightblue", LUcornerX: 47, LUcornerY: 67},
    {color: "green", LUcornerX: 47+90+13, LUcornerY: 67},
    {color: "red", LUcornerX: 47, LUcornerY: 67+90+9},
    {color: "yellow", LUcornerX: 47+90+13, LUcornerY: 67+90+9},
    {color: "blue", LUcornerX: 47, LUcornerY: 67+((90+9)*2)},
    {color: "rainbow", LUcornerX: 47+90+13, LUcornerY: 67+((90+9)*2)}
]
 
const ctx = canvas.getContext('2d');
function ctx_text(fcolor, scolor, lineWidth, font, text, textX, textY){
    ctx.fillStyle = fcolor;
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    ctx.strokeStyle = scolor;
    ctx.strokeText(`${text}`, textX, textY)
    ctx.fillText(`${text}`, textX, textY)
}
 
function ctx_arc(x, y, r, sAngle, eAngle, counterclockwise, c){
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    ctx.fillStyle = c;
    ctx.fill();
}
 
function ctx_rect(x, y, a, b, c){
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, a, b);
}
 
//use this for game entities
function dot_in_diepunits(diepunits_X, diepunits_Y){
    ctx_arc(diepunits_X * scalingFactor, diepunits_Y * scalingFactor, 5, 0, 2 * Math.PI, false, "lightblue");
}
 
function circle_in_diepunits(diepunits_X, diepunits_Y, diepunits_R, c){
    ctx.beginPath();
    ctx.arc(diepunits_X * scalingFactor, diepunits_Y * scalingFactor, diepunits_R*scalingFactor, 0, 2 * Math.PI, false);
    ctx.strokeStyle = c;
    ctx.stroke();
}
 
//use this for ui elements like upgrades or scoreboard
function dot_in_diepunits_FOVless(diepunits_X, diepunits_Y){
    ctx_arc(diepunits_X * windowScaling(), diepunits_Y * windowScaling(), 5, 0, 2 * Math.PI, false, "lightblue");
}
 
function square_for_grid(x, y, a, b, color){
    ctx.beginPath();
    ctx.rect(x*windowScaling(), y*windowScaling(), a*windowScaling(), b*windowScaling());
    ctx.strokeStyle = color;
    ctx.stroke();
}
 
function draw_upgrade_grid(){
    for(let i = 0; i < boxes.length; i++){
        let start_x = (boxes[i].LUcornerX*windowScaling())/two;
        let start_y = (boxes[i].LUcornerY*windowScaling())/two;
        let end_x = ((boxes[i].LUcornerX+43*2)*windowScaling())/two;
        let end_y = ((boxes[i].LUcornerY+43*2)*windowScaling())/two;
        let temp_color = "black";
        if(uwuX > start_x && uwuY > start_y && uwuX < end_x && uwuY < end_y){
            temp_color = "red";
            selected_box = i;
        }else{
            temp_color = "black";
            selected_box = null;
        }
        square_for_grid(boxes[i].LUcornerX, boxes[i].LUcornerY, 86, 86, temp_color);
    }
    for(let i = 0; i < boxes.length; i++){
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX+43, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX+43*2, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX+43*2, boxes[i].LUcornerY+43);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX+43*2, boxes[i].LUcornerY+43*2);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY+43);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY+43*2);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX+43, boxes[i].LUcornerY+43);
    }
}
 
const gradients = ["#94b3d0", "#96b0c7", "#778daa", "#4c7299", "#52596c", "#19254e", "#2d445f", "#172631"];
const tank_group1 = ["Trapper", "Overtrapper", "MegaTrapper", "Tri-Trapper"]; //Traps only
const tank_group2 = ["Tank", "Twin", "TripleShot", "SpreadShot", "PentaShot", "TwinFlank", "TripleTwin", "QuadTank", "OctoTank", "MachineGun", "Sprayer", "Triplet", "FlankGuard"]; //constant bullets [initial speed = 0.699]
//const tank_group3 = ["GunnerTrapper", "AutoTrapper"]; //Traps AND constant bullets                     (UNFINISHED)
//const tank_group4 = []; //mix of bullets                                                               (UNFINISHED)
//const tank_group5 = ["Sniper", "Assassin", "Stalker", "Ranger"]; //sniper+ bullets                     (UNFINISHED)
const tank_group6 = ["Destroyer", "Hybrid", "Annihilator"]; //slower bullets [intitial speed = 0.699]
//const tank_group7 = ["Overseer", "Overlord", "Manager", "Necromancer"]; //infinite bullets(drones)     (UNFINISHED)
const tank_group8 = ["Factory"]; //drones with spreading abilities
const tank_group9 = ["Battleship"]; //special case
 
function draw_cirle_radius_for_tank(){
   if(tank_group1.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 485 + (52.5*i), gradients[i]);
    }
   }else if(tank_group2.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 1850 + (210*i), gradients[i]);
    }
   /*
   }else if(tank_group5.includes(tanky)){
      for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 2703 + (420*i), gradients[i]);
    }*/
   }else if(tank_group6.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 1443.21 + (146.79*i), gradients[i]);
    }
   /*
   }else if(tank_group7.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits( canvas.width/2/scalingFactor , canvas.height/2/scalingFactor, 1607 + (145*i), gradients[i]);
      circle_in_diepunits( uwuX*2/scalingFactor , uwuY*2/scalingFactor, 1607 + (145*i), gradients[i]);
    }*/
   }else if(tank_group8.includes(tanky)){
      circle_in_diepunits(uwuX*two/scalingFactor, uwuY*two/scalingFactor, 200, gradients[0]);
      circle_in_diepunits(uwuX*two/scalingFactor, uwuY*two/scalingFactor, 800, gradients[1]);
      circle_in_diepunits(uwuX*two/scalingFactor, uwuY*two/scalingFactor, 900, gradients[2]);
   }else if(tank_group9.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 1640 + (210*i), gradients[i]);
    }
   }else{
     return;
   }
 
}
 
//let's calculate the angle
var vector_l = [null, null];
var angle_l = 0;
function calc_leader(){
   if(script_list.minimap_leader_v1){
    let xc = canvas.width/2;
    let yc = canvas.height/2;
    vector_l[0] = window.l_arrow.xl - xc;
    vector_l[1] = window.l_arrow.yl - yc;
    angle_l = Math.atan2(vector_l[1], vector_l[0]) * (180 / Math.PI);
   }else if(script_list.minimap_leader_v2){
    let xc = canvas.width/2;
    let yc = canvas.height/2;
    vector_l[0] = window.L_X - xc;
    vector_l[1] = window.L_Y - yc;
    angle_l = Math.atan2(vector_l[1], vector_l[0]) * (180 / Math.PI);
   }else{
     console.log("waiting for leader script to give us values");
   }
}
 
//setInterval(calc_l, 0);
 
// Minimap logic
var minimap_elements = [
    {name: "minimap", x: 177.5, y: 177.5, width: 162.5, height: 162.5, color: "purple"},
    {name: "2tdm Blue Team", x: 177.5, y: 177.5, width: 17.5, height: 162.5, color: "blue"},
    {name: "2tdm Red Team", x: 32.5, y: 177.5, width: 17.5, height: 162.5, color: "red"},
    {name: "4tdm Blue Team", x: 177.5, y: 177.5, width: 25, height: 25, color: "blue"},
    {name: "4tdm Purple Team", x: 40, y: 177.5, width: 25, height: 25, color: "purple"},
    {name: "4tdm Green Team", x: 177.5, y: 40, width: 25, height: 25, color: "green"},
    {name: "4tdm Red Team", x: 40, y: 40, width: 25, height: 25, color: "red"},
];
 
var m_e_ctx_coords = [
    {name: "minimap", startx: null, stary: null, endx: null, endy: null},
    {name: "2tdm Blue Team", startx: null, stary: null, endx: null, endy: null},
    {name: "2tdm Red Team", startx: null, stary: null, endx: null, endy: null},
    {name: "4tdm Blue Team", startx: null, stary: null, endx: null, endy: null},
    {name: "4tdm Purple Team", startx: null, stary: null, endx: null, endy: null},
    {name: "4tdm Green Team", startx: null, stary: null, endx: null, endy: null},
    {name: "4tdm Red Team", startx: null, stary: null, endx: null, endy: null}
]
 
function draw_minimap(){
   switch(gamemode){
       case "2tdm":
           for(let i = 0; i < 3; i++){
               updateAndDrawElement(i);
           }
           break;
       case "4tdm":
           updateAndDrawElement(0);
           for(let i = 3; i < minimap_elements.length; i++){ // Draw all 4tdm elements
               updateAndDrawElement(i);
           }
           break;
   }
   if(script_list.minimap_leader_v1 || script_list.minimap_leader_v2){
       minimap_collision_check();
   }
}
 
function updateAndDrawElement(index) {
   // Update their real-time position
   m_e_ctx_coords[index].startx = canvas.width - (minimap_elements[index].x * windowScaling());
   m_e_ctx_coords[index].starty = canvas.height - (minimap_elements[index].y * windowScaling());
   m_e_ctx_coords[index].endx = m_e_ctx_coords[index].startx + minimap_elements[index].width * windowScaling();
   m_e_ctx_coords[index].endy = m_e_ctx_coords[index].starty + minimap_elements[index].height * windowScaling();
 
   // Draw the element
   ctx.beginPath();
   ctx.rect(m_e_ctx_coords[index].startx, m_e_ctx_coords[index].starty, minimap_elements[index].width * windowScaling(), minimap_elements[index].height * windowScaling());
   ctx.lineWidth = "1";
   ctx.strokeStyle = minimap_elements[index].color;
   ctx.stroke();
}
 
let position_on_minimap;
function minimap_collision_check() {
  if (script_list.minimap_leader_v1 || script_list.minimap_leader_v2) {
    let x = script_list.minimap_leader_v1 ? window.m_arrow.xl : window.M_X;
    let y = script_list.minimap_leader_v1 ? window.m_arrow.yl : window.M_Y;
 
    if (m_e_ctx_coords[0].startx < x &&
        m_e_ctx_coords[0].starty < y &&
        m_e_ctx_coords[0].endx > x &&
        m_e_ctx_coords[0].endy > y) {
 
        if (gamemode === "2tdm") {
            if (checkWithinBase(1, x, y)) position_on_minimap = "blue base";
            else if (checkWithinBase(2, x, y)) position_on_minimap = "red base";
            else position_on_minimap = "not in the base";
        } else if (gamemode === "4tdm") {
            if (checkWithinBase(3, x, y)) position_on_minimap = "blue base";
            else if (checkWithinBase(4, x, y)) position_on_minimap = "purple base";
            else if (checkWithinBase(5, x, y)) position_on_minimap = "green base";
            else if (checkWithinBase(6, x, y)) position_on_minimap = "red base";
            else position_on_minimap = "not in the base";
        }
    } else {
        position_on_minimap = "Warning! not on minimap";
    }
  }
}
 
function checkWithinBase(baseIndex, x, y) {
  return m_e_ctx_coords[baseIndex].startx < x &&
         m_e_ctx_coords[baseIndex].starty < y &&
         m_e_ctx_coords[baseIndex].endx > x &&
         m_e_ctx_coords[baseIndex].endy > y;
}
 
//let's try drawing a line to the leader
 
function apply_vector_on_minimap(){
   if(script_list.minimap_leader_v1){
    let x = window.m_arrow.xl;
    let y = window.m_arrow.yl;
    let thetaRadians = angle_l * (Math.PI / 180);
    let r = m_e_ctx_coords[0].endx-m_e_ctx_coords[0].startx;
    let x2 = x + r * Math.cos(thetaRadians);
    let y2 = y + r * Math.sin(thetaRadians);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
   }else if(script_list.minimap_leader_v2){
    let x = window.M_X;
    let y = window.M_Y;
    let thetaRadians = angle_l * (Math.PI / 180);
    let r = m_e_ctx_coords[0].endx-m_e_ctx_coords[0].startx;
    let x2 = x + r * Math.cos(thetaRadians);
    let y2 = y + r * Math.sin(thetaRadians);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
   }
}
 
 
//drawing the limit of the server (needs rework)
function draw_server_border(a, b){
          ctx.beginPath();
          ctx.rect(canvas.width/2 - (a/2*scalingFactor), canvas.height/2 - (b/2*scalingFactor), a*scalingFactor, b*scalingFactor);
          ctx.strokeStyle = "red";
          ctx.stroke();
}
 
const circle_gradients = [
  "#FF0000",// Red
  "#FF4D00",// Orange Red
  "#FF8000",// Orange
  "#FFB300",// Dark Goldenrod
  "#FFD700",// Gold
  "#FFEA00",// Yellow
  "#D6FF00",// Light Yellow Green
  "#A3FF00",// Yellow Green
  "#6CFF00",// Lime Green
  "#00FF4C",// Medium Spring Green
  "#00FF9D",// Turquoise
  "#00D6FF",// Sky Blue
  "#006CFF",// Blue
  "#0000FF"// Dark Blue
];
 
function draw_crx_events(){
    //you need either leader arrow or moveTo/lineTo script from h3llside for this part
    if(script_list.moveToLineTo_debug){
       for(let i = 0; i < window.y_and_x.length; i++){
         ctx_arc(window.y_and_x[i][0], window.y_and_x[i][1], 10, 0, 2 * Math.PI, false, circle_gradients[i]);
         ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", i, window.y_and_x[i][0], window.y_and_x[i][1]);
       }
      }else if(script_list.minimap_leader_v1){
          //ctx_arc(window.l_arrow.xm, window.l_arrow.ym, 15, 0, 2 * Math.PI, false, window.l_arrow.color);
          //ctx_arc(window.m_arrow.xm, window.m_arrow.ym, 1, 0, 2 * Math.PI, false, "yellow");
          ctx_arc(window.l_arrow.xl, window.l_arrow.yl, 5, 0, 2 * Math.PI, false, window.l_arrow.color);
          ctx_arc(window.m_arrow.xl, window.m_arrow.yl, 1, 0, 2 * Math.PI, false, "yellow");
      }
}
 
//tank aim lines
let TurretRatios = [
    {name: "Destroyer", ratio: 95/71.4, color: "red"},
    {name: "Anni", ratio: 95/96.6, color: "darkred"},
    {name: "Fighter", ratio: 80/42, color: "orange"},
    {name: "Booster", ratio: 70/42, color: "green"},
    {name: "Tank", ratio: 95/42, color: "yellow"},
    {name: "Sniper", ratio: 110/42, color: "yellow"},
    {name: "Ranger", ratio: 120/42, color: "orange"},
    {name: "Hunter", ratio: 95/56.7, color: "orange"},
    {name: "Predator", ratio: 80/71.4, color: "darkorange"},
    {name: "Mega Trapper", ratio: 60/54.6, color: "red"},
    {name: "Trapper", ratio: 60/42, color: "orange"},
    {name: "Gunner Trapper", ratio: 95/26.6, color: "yellow"},
    {name: "Predator", ratio: 95/84.8, color: "red"},
    {name: "Gunner(small)", ratio: 65/25.2, color: "lightgreen"},
    {name: "Gunner(big)", ratio: 85/25.2, color: "green"},
    {name: "Spread1", ratio: 89/29.4, color: "orange"},
    {name: "Spread2", ratio: 83/29.4, color: "orange"},
    {name: "Spread3", ratio: 71/29.4, color: "orange"},
    {name: "Spread4", ratio: 65/29.4, color: "orange"},
];
 
function drawTheThing(x, y, r, index) {
  if(toggleButtons.Visual['Toggle Aim Lines']){
    ctx.strokeStyle = TurretRatios[index].color;
    ctx.lineWidth = 5;
 
    let extendedR = 300 * scalingFactor;
 
    // Reverse the angle to switch the direction
    const reversedAngle = -angle;
 
    // Calculate the end point of the line
    const endX = x + extendedR * Math.cos(reversedAngle);
    const endY = y + extendedR * Math.sin(reversedAngle);
 
    // Draw the line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
 
    // Draw text at the end of the line
    ctx.font = "20px Arial";
    ctx.fillStyle = TurretRatios[index].color;
    ctx.strokeStyle = "black";
    ctx.strokeText(TurretRatios[index].name, endX, endY);
ctx.fillText(TurretRatios[index].name, endX, endY);
 
    ctx.beginPath();
  }
}
 
var angle, a, b, width;
let perm_cont = [];
 
CanvasRenderingContext2D.prototype.setTransform = new Proxy(CanvasRenderingContext2D.prototype.setTransform, {
    apply(target, thisArgs, args) {
        // Check if the ratio matches the specified conditions
       for(let i = 0; i < TurretRatios.length; i++){
        if (Math.abs(args[0] / args[3]).toFixed(3) == (TurretRatios[i].ratio).toFixed(3)) {
            if(TurretRatios[i].name === "bullet"){
               if(args[0] === 1&& args[1] === 0 && args[2] === 0 && args[3] === 1 && args[4] != 0 && args[5] != 0){
                if(!perm_cont.includes(thisArgs)){
                    perm_cont.push(thisArgs);
                    console.log(perm_cont);
                }
                angle = Math.atan2(args[2], args[3]) || 0;
                width = Math.hypot(args[3], args[2]);
                a = args[4] - Math.cos(angle + Math.PI / 2) * width / 2;
                b = args[5] + Math.sin(angle + Math.PI / 2) * width / 2;
                console.log(b);
                if(canvas.height/2 > b){
                 drawTheThing(a, b, Math.hypot(args[3], args[2]), i);
                }
               }
            }else{
            angle = Math.atan2(args[2], args[3]) || 0;
            width = Math.hypot(args[3], args[2]);
            a = args[4] - Math.cos(angle + Math.PI / 2) * width / 2;
            b = args[5] + Math.sin(angle + Math.PI / 2) * width / 2;
            drawTheThing(a, b, Math.hypot(args[3], args[2]), i);
            }
        }
       }
        return Reflect.apply(target, thisArgs, args);
    }
});
 
setTimeout(() => {
    let gui = () => {
       if(ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
        if(toggleButtons.Visual['Toggle Minimap']){
          draw_minimap();
        }
        if(script_list.minimap_leader_v1 || script_list.minimap_leader_v2){
         if(toggleButtons.Visual['Toggle Leader Angle']){
          calc_leader();
          apply_vector_on_minimap();
          if(!toggleButtons.Visual['Toggle Minimap']){
              input.inGameNotification("please enable Minimap as well");
          }
         }
        }
        if(script_list.set_transform_debug){
         ctx_arc(window.crx_container[2], window.crx_container[3], 50, 0, 2 * Math.PI, false, "yellow");
        }
        if(toggleButtons.Debug['Toggle Text']){
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "canvas Lvl:" + currentLevel, canvas.width/20 + 10, text_startingY + (textAdd*0));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "canvas tank: " + tanky, canvas.width/20 + 10, text_startingY + (textAdd*1));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "radius: " + ripsaw_radius, canvas.width/20 + 10, text_startingY + (textAdd*2));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "field Factor: " + fieldFactor, canvas.width/20 + 10, text_startingY + (textAdd*3));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "diep Units: " + diepUnits, canvas.width/20 + 10, text_startingY + (textAdd*4));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "Fov: " + FOV, canvas.width/20 + 10, text_startingY + (textAdd*5));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "current Tick: " + currentTick, canvas.width/20 + 10, text_startingY + (textAdd*6));
         ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "vector: " + Math.floor(vector_l[0]) + ", " + Math.floor(vector_l[1]) + "angle: " + Math.floor(angle_l), canvas.width/20 + 10, text_startingY + (textAdd*7));
         //ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + uwuX + "realY: " + uwuY + "newX: " + uwuX*windowScaling() + "newY: " + uwuY*windowScaling(), uwuX*2, uwuY*2);
 
         //points at mouse
         ctx_arc(uwuX*two, uwuY*two, 5, 0, 2 * Math.PI, false, "purple");
         /*
         circle_in_diepunits(uwuX*2/scalingFactor, uwuY*2/scalingFactor, 35, "pink");
         circle_in_diepunits(uwuX*2/scalingFactor, uwuY*2/scalingFactor, 55, "yellow");
         circle_in_diepunits(uwuX*2/scalingFactor, uwuY*2/scalingFactor, 75, "purple");
         circle_in_diepunits(uwuX*2/scalingFactor, uwuY*2/scalingFactor, 200, "blue");
         */
 
         //coords at mouse
         ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + uwuX*two + "realY: " + uwuY*two, uwuX*two, uwuY*two);
        }
 
        if(currentLevel != null && tanky != null){
         if(toggleButtons.Debug['Toggle Middle Circle']){
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
          ctx.lineTo(uwuX*two, uwuY*two);
          ctx.stroke();
          ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius, 0, 2 * Math.PI, false, "darkblue");
          ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius*0.9, 0, 2 * Math.PI, false, "lightblue");
         }
          if(toggleButtons.Debug['Toggle Upgrades']){
           draw_upgrade_grid();
          }
          //draw_server_border(4000, 2250);
          draw_crx_events();
          if(toggleButtons.Visual['Toggle Bullet Distance']){
           draw_cirle_radius_for_tank();
          }
        };
       }
        window.requestAnimationFrame(gui);
    }
    gui();
    setTimeout(() => {
        gui();
    },5000);
}, 1000);
 
//game ticks finder
let clearRect_count = 0;
let fps;
CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
    apply(fillRect, ctx, [text, x, y, ...blah]) {
        if (text.endsWith('FPS')) {
            fps = text.split(' ')[0];
        }
        fillRect.call(ctx, text, x, y, ...blah);
    }
});
 
// Tick tracking
let currentTick = 0;
const tickQueue = [];
const everyTickFunctions = [];
 
function runEveryTick(callback) {
    everyTickFunctions.push(callback);
}
 
CanvasRenderingContext2D.prototype.clearRect = new Proxy(CanvasRenderingContext2D.prototype.clearRect, {
    apply(target, thisArg, argumentsList) {
        clearRect_count += 1;
        currentTick = Math.floor(clearRect_count / 6);
        processTickQueue();
        everyTickFunctions.forEach(func => func(currentTick));
        return target.apply(thisArg, argumentsList);
    }
});
 
function scheduleAfterTicks(callback, ticksToWait) {
    const executionTick = currentTick + ticksToWait;
    tickQueue.push({ callback, executionTick });
}
 
function processTickQueue() {
    while (tickQueue.length > 0 && tickQueue[0].executionTick <= currentTick) {
        const item = tickQueue.shift();
        item.callback();
    }
}
 
// Function to run code for a specified number of ticks
function runForTicks(callback, totalTicks) {
    const startingTick = currentTick;
    let ticksPassed = 0;
 
    function tickHandler() {
        if (ticksPassed < totalTicks) {
            callback(ticksPassed, currentTick);
            ticksPassed++;
            scheduleAfterTicks(tickHandler, 1);
        }
    }
 
    tickHandler(); // Start the process
}
 
// Example usage:
function test() {
    console.log("Starting test at tick:", currentTick);
 
    scheduleAfterTicks(() => {
        console.log("150 ticks have passed, current tick:", currentTick);
        // Add your code here
    }, 150);
}
 
function testLoop() {
    console.log("Starting testLoop at tick:", currentTick);
    runForTicks((ticksPassed, currentTick) => {
        console.log(`Tick passed: ${ticksPassed}, Current tick: ${currentTick}`);
        // Add any other code you want to run each tick
    }, 50);
}
 
//cooldowns (unfinished)
let c_cd = "red";
let c_r = "green";
const cooldowns = [
    {Tank: "Destroyer", cooldown0: 109, cooldown1: 94, cooldown2: 81, cooldown3: 86},
]
 
//detect which slot was clicked
document.addEventListener('mousedown', checkPos)
function checkPos(e){
    console.log(currentTick);
    console.log(boxes[selected_box]);
}
 
 
//warns you about annis, destroyers
/*
function drawTheThing(x,y,r) {
    if(script_boolean){
    let a = ctx.fillStyle;
    ctx.fillStyle = "#FF000044";
    ctx.beginPath();
    ctx.arc(x,y,4*r,0,2*Math.PI);
    ctx.fill();
    ctx.fillStyle = "#FF000066";
    ctx.beginPath();
    ctx.arc(x,y,2*r,0,2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    }
}
var angle,a,b,width;
CanvasRenderingContext2D.prototype.setTransform = new Proxy(CanvasRenderingContext2D.prototype.setTransform, {
    apply(target, thisArgs, args) {
        //console.log(thisArgs)
        if (Math.abs(args[0]/args[3]).toFixed(3) == (95/71.4).toFixed(3) || Math.abs(args[0]/args[3]).toFixed(3) == (95/96.6).toFixed(3)) {
            angle = Math.atan2(args[2],args[3]) || 0;
            width = Math.hypot(args[3], args[2]);
            a = args[4]-Math.cos(angle+Math.PI/2)*width/2;
            b = args[5]+Math.sin(angle+Math.PI/2)*width/2;
            drawTheThing(a,b, Math.hypot(args[3],args[2]));
        }
        return Reflect.apply(target, thisArgs, args);
    }
});
*/
 
//physics for movement (UNFINISHED)
/*
//movement speed ingame stat
let m_s = [0, 1, 2, 3, 4, 5, 6, 7];
 
function accelarate(A_o){
    //Accelaration
    let sum = 0;
        runForTicks((ticksPassed, currentTick) => {
            console.log("sum is being calculated...");
             sum += A_o * Math.pow(0.9, ticksPassed - 1);
             offsetX = Math.floor(sum * scalingFactor);
             console.log(offsetX);
        }, 50);
    //decelerate(sum);
}
 
function decelerate(sum){
    //deceleration
    let res = 0;
        runForTicks((ticksPassed, currentTick) => {
            console.log("res is being calculated...");
             res = sum * Math.pow(0.9, ticksPassed);
             offsetX = Math.floor(res * scalingFactor);
             console.log(offsetX);
        }, 50);
}
function calculate_speed(movement_speed_stat){
    console.log("calculate_speed function called");
//use Accelaration for first 50 ticks, then deceleration until ticks hit 100, then stop moving
 
    //calculating base value, we'll need this later
    let a = (1.07**movement_speed_stat);
    let b = (1.015**(currentLevel - 1));
    let A_o = 2.55*(a/b);
    accelarate(A_o);
}
*/
 
//handle Key presses
let key_storage = [];
 
document.onkeydown = function(e) {
    if(!key_storage.includes(e.key)){
      key_storage.push(e.key);
    }
    console.log(key_storage);
    analyse_keys();
}
 
document.onkeyup = function(e) {
    if(key_storage.includes(e.key)){
      key_storage.splice(key_storage.indexOf(e.key), 1);
    }
    console.log(key_storage);
    analyse_keys();
}
 
function analyse_keys(){
    if(key_storage.includes("j")){ //J
        script_boolean = !script_boolean;
    }else if(key_storage.includes("b")){ //B
        debugboolean = !debugboolean;
    }else if(key_storage.includes("e")){ //E
        if(ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
          f_s("fire");
        }else{
          auto_fire = false;
        }
        console.log(auto_fire);
    }else if(key_storage.includes("c")){
        console.log(auto_spin);
        if(ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
          f_s("spin");
        }else{
          auto_spin = false;
        }
        console.log(auto_spin);
    }
}
// Handle key presses for moving the center (UNFINISHED)
 
/*
function return_to_center(XorY, posOrNeg){
console.log("function called with: " + XorY + posOrNeg);
    if(XorY === "x"){
        if(posOrNeg === "pos"){
            while(offsetX < 0){
                offsetX += 0.5*scalingFactor;
            }
        }else if(posOrNeg === "neg"){
            while(offsetX > 0){
                offsetX -= 0.5*scalingFactor;
            }
        }else{
            console.log("invalid posOrNeg at return_to_center();")
        }
    }else if(XorY === "y"){
        if(posOrNeg === "pos"){
            while(offsetY < 0){
                offsetY += 0.5*scalingFactor;
            }
        }else if(posOrNeg === "neg"){
            while(offsetY > 0){
                offsetY -= 0.5*scalingFactor;
            }
        }else{
            console.log("invalid posOrNeg at return_to_center();")
        }
    }else{
        console.log("invalid XorY at return_to_center();");
    }
}
 
document.onkeydown = function(e) {
    switch (e.keyCode) {
        case 87: // 'W' key
            console.log("W");
            if(offsetY >= -87.5*scalingFactor){
              offsetY -= 12.5*scalingFactor;
            }
            break
        case 83: // 'S' key
            console.log("S");
            if(offsetY <= 87.5*scalingFactor){
              offsetY += 12.5*scalingFactor;
            }
            break;
        case 68: // 'D' key
            console.log("D");
            if(offsetX <= 87.5*scalingFactor){
                offsetX += 12.5*scalingFactor;
            }
            break
        case 65: // 'A' key
            console.log("A");
            if(offsetX >= -87.5*scalingFactor){
              offsetX -= 12.5*scalingFactor;
            }
            break
    }
}
 
document.onkeyup = function(e) {
    switch (e.keyCode) {
        case 87: // 'W' key
            console.log("W unpressed");
            return_to_center("y", "pos");
            break
        case 83: // 'S' key
            console.log("S unpressed");
            return_to_center("y", "neg");
            break;
        case 68: // 'D' key
            console.log("D unpressed");
            return_to_center("x", "neg");
            break
        case 65:
            console.log("A unpressed");
            return_to_center("x", "pos");
    }
}
*/