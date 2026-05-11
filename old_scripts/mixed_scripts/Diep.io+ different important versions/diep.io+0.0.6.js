// ==UserScript==
// @name         r!PsAw's Diep.io+
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description  autorespawn(auto ad watcher with 2min timer), FOV & diepUnits & windowScaling() calculator, Factory controls overlay, bullet distance (FOR EVERY BULLET SPEED BUILD) of 75% tanks, copy party link, leave game, no privacy settings button, no apes.io advertisment, net_predict_movement false
// @author       You
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// ==/UserScript==
 
//!!!WARNING!!! Ui scale has to be at 0.9x for this script to work//
 
let script_boolean = true;
// Mouse coordinates
var uwuX = '0'; var uwuY = '0';
document.addEventListener('mousemove', function(e) {
   uwuX = e.clientX;
   uwuY = e.clientY;
});
 
//net_predict_movement false
window.addEventListener("load", (event) => {
  input.execute("net_predict_movement false");
});
 
//remove privacy settings button and apes.io promo
let ads_removed = false;
function instant_remove(){
 let privacy_btn = document.getElementById("cmpPersistentLink");
 let apes_btn = document.getElementById("apes-io-promo");
   if(apes_btn != null && privacy_btn != null){
     privacy_btn.remove();
     apes_btn.remove();
       console.log("removed buttons, quitting...");
       clearInterval(interval);
   }
};
let interval = setInterval(instant_remove, 0);
 
//toggle leave game
let active = false;
let s = false;
let ingame_quit_btn = document.getElementById("quick-exit-game");
let app = document.getElementById("app");
 
function check_class(){
  if(ingame_quit_btn.classList.contains("shown")){
      active = false;
  }else if(ingame_quit_btn.classList.contains("hidden")){
      active = true;
  }
}
 
setInterval(check_class, 300);
 
var toggle_quit_btn = document.createElement('button');
toggle_quit_btn.innerHTML = `leave button active? ${active}`;
toggle_quit_btn.style.color = "white";
toggle_quit_btn.style.position = "fixed";
toggle_quit_btn.style.width = "100px";
toggle_quit_btn.style.height = "50px";
toggle_quit_btn.style.bottom = "20%";
toggle_quit_btn.style.left = "20%";
toggle_quit_btn.style.transform = "translate(-50%, 50%)";
toggle_quit_btn.style.cursor = "pointer";
toggle_quit_btn.style.zIndex = '9999';
toggle_quit_btn.onclick = function() {
   s = !s;
  toggle_quit_btn.innerHTML = `leave button active? ${active}`;
  if(s){
   ingame_quit_btn.classList.remove("hidden");
   ingame_quit_btn.classList.add("shown");
  }else{
   ingame_quit_btn.classList.remove("shown");
   ingame_quit_btn.classList.add("hidden");
  }
}
 
app.appendChild(toggle_quit_btn);
 
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
 
// Add event listeners for the buttons
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
 
//autorespawn (easy way)
let ingamescreen = document.getElementById("in-game-screen");
let autorespawn = false;
 
function respawn(){
 if(autorespawn){
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
 
var toggle_auto_r_btn = document.createElement('button');
toggle_auto_r_btn.innerHTML = `auto respawn active? ${autorespawn}`;
toggle_auto_r_btn.style.backgroundColor = "red";
toggle_auto_r_btn.style.color = "white";
toggle_auto_r_btn.style.position = "fixed";
toggle_auto_r_btn.style.width = "100px";
toggle_auto_r_btn.style.height = "50px";
toggle_auto_r_btn.style.bottom = "20%";
toggle_auto_r_btn.style.left = "25%";
toggle_auto_r_btn.style.transform = "translate(-50%, 50%)";
toggle_auto_r_btn.style.cursor = "pointer";
toggle_auto_r_btn.style.zIndex = '9999';
toggle_auto_r_btn.onclick = function() {
   autorespawn = !autorespawn;
   toggle_auto_r_btn.innerHTML = `auto respawn active? ${autorespawn}`;
   if(autorespawn){
       toggle_auto_r_btn.style.backgroundColor = "green";
   }else{
       toggle_auto_r_btn.style.backgroundColor = "red";
   }
}
 
app.appendChild(toggle_auto_r_btn);
 
//copy party link
var copy_p_link_btn = document.createElement('button');
copy_p_link_btn.innerHTML = `copy party link`;
copy_p_link_btn.style.color = "white";
copy_p_link_btn.style.position = "fixed";
copy_p_link_btn.style.width = "100px";
copy_p_link_btn.style.height = "50px";
copy_p_link_btn.style.bottom = "20%";
copy_p_link_btn.style.left = "30%";
copy_p_link_btn.style.transform = "translate(-50%, 50%)";
copy_p_link_btn.style.cursor = "pointer";
copy_p_link_btn.style.zIndex = '9999';
copy_p_link_btn.onclick = function() {
  document.getElementById("copy-party-link").click();
}
 
app.appendChild(copy_p_link_btn);
 
//find the current Level
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
 
- window.resize doesn't check if canvas size changes, but only if the user changes it.
 
For example opening google console changes canvas size, but user didn't change the window.
 
- press 2 keys at the same time
 
- simulate diep.io moving and knockback physics
 
- simulate diep.io bullets
 
- figure out how to simulate mouse click events
 
- add game Tick calculator, for bullets cooldown
  -> Mi300 said use 0x00 clientbound packet
 
- Finish bullet speed hybrid tanks
 
- Figure out physics for sniper, Ranger etc.
 
-
 
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
    FOV = numerator / denominator;
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
        let start_x = (boxes[i].LUcornerX*windowScaling())/2;
        let start_y = (boxes[i].LUcornerY*windowScaling())/2;
        let end_x = ((boxes[i].LUcornerX+43*2)*windowScaling())/2;
        let end_y = ((boxes[i].LUcornerY+43*2)*windowScaling())/2;
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
const tank_group1 = ["Trapper", "Overtrapper", "MegaTrapper"]; //Traps only
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
      circle_in_diepunits(uwuX*2/scalingFactor, uwuY*2/scalingFactor, 800, gradients[0]);
   }else if(tank_group9.includes(tanky)){
     for(let i = 0; i < gradients.length; i++){
      circle_in_diepunits(canvas.width/2/scalingFactor, canvas.height/2/scalingFactor, 1640 + (210*i), gradients[i]);
    }
   }else{
     return;
   }
 
}
setTimeout(() => {
    let gui = () => {
      if(script_boolean){
       if(ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")){
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "canvas Lvl:" + currentLevel, canvas.width/20 + 10, text_startingY + (textAdd*0));
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "canvas tank: " + tanky, canvas.width/20 + 10, text_startingY + (textAdd*1));
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "radius: " + ripsaw_radius, canvas.width/20 + 10, text_startingY + (textAdd*2));
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "field Factor: " + fieldFactor, canvas.width/20 + 10, text_startingY + (textAdd*3));
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "diep Units: " + diepUnits, canvas.width/20 + 10, text_startingY + (textAdd*4));
        ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "Fov: " + FOV, canvas.width/20 + 10, text_startingY + (textAdd*5));
        //ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + uwuX + "realY: " + uwuY + "newX: " + uwuX*windowScaling() + "newY: " + uwuY*windowScaling(), uwuX*2, uwuY*2);
 
         //points at mouse
         ctx_arc(uwuX*2, uwuY*2, 5, 0, 2 * Math.PI, false, "purple");
 
         //coords at mouse
         ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + uwuX*2 + "realY: " + uwuY*2, uwuX*2, uwuY*2);
 
        if(currentLevel != null && tanky != null){
          ctx.beginPath();
          ctx.moveTo(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
          ctx.lineTo(uwuX*2, uwuY*2);
          ctx.stroke();
          ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius, 0, 2 * Math.PI, false, "darkblue");
          ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius*0.9, 0, 2 * Math.PI, false, "lightblue");
          draw_cirle_radius_for_tank();
          draw_upgrade_grid();
        };
       }
      }
        window.requestAnimationFrame(gui);
    }
    gui();
    setTimeout(() => {
        gui();
    },5000);
}, 1000);
 
//detect which slot was clicked
document.addEventListener('mousedown', checkPos)
function checkPos(e){
    console.log(boxes[selected_box]);
}
 
//turn off script
document.onkeydown = function(e) {
    if(e.keyCode === 74){ //J
        script_boolean = !script_boolean;
    }
}
// Handle key presses for moving the center UNFINISHED
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