// ==UserScript==
// @name         leader movement prediction (aim bot version)
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @require      https://raw.githubusercontent.com/MI301/My-Diep.io-Scripts/refs/heads/main/libraries/DiepUtils/scriptSrc
// @license      MIT
// ==/UserScript==

//Aim bot possible improvements:
/*
- wait a little before shooting
 -> (maybe) detect leader in a certain radius (the more closer you are, the more accurate is the shot)
- calculate predicted coords inside handle_aim func
- reset "shot" periodically, instead of resetting it when leader is out of view range
 -> (maybe) do that based on your reload speed
- (maybe) enable farmbot until level 30
- visualise everything (find out how to draw with api)
*/

//get api
let api = false;
let awaitApi = setInterval(function(){
  if(typeof DiepUtils === "null"){
    return;
  }
  clearInterval(awaitApi);
  api = true;
}, 400);

//access classes from api
function define_eM(){
    const { entityManager } = window.DiepUtils;
    return entityManager;
}

function define_gM(){
    const { gameManager } = window.DiepUtils;
    return gameManager;
}

function define_ctrl(){
    const { controller } = window.DiepUtils;
    return controller;
}

function define_lb_reader(){
    const { leaderboardReader } = window.DiepUtils;
    return leaderboardReader;
}

function define_core(){
    const { core } = window.DiepUtils;
    return core;
}

//actual drawing logic
function update_leader(){
    //define classes
    let lb = define_lb_reader();
    let em = define_eM();

    //check if loaded players include leaders name & score
    let target_name = lb.getLeader().name;
    let target_score = lb.getLeader().score;
    let players = em.getPlayers();
    let l = players.length;
    let leader = {
        is_on_screen: false,
        entity: null
    }
    for(let i = 0; i < l; i++){
        if(players[i].name === target_name && players[i].score === target_score){
            //console.log("gotcha!");
            leader.is_on_screen = true;
            leader.entity = players[i];
            break
        }
    }
    return leader;
}

function draw_leader(){
    let leader = update_leader();
    if(leader.is_on_screen){
        //console.log("drawing...");
        //console.log(`x: ${leader.entity.x} y: ${leader.entity.y} radius: ${leader.entity.r}`);

        /* find a way to draw with mi300 api
        ctx.beginPath();
        ctx.fillStyle = "#FF000044";
        ctx.arc(leader.entity.x,leader.entity.y, leader.entity.r*5 ,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        */

        //temporary aiming logic (until I find out how to draw
        let controller = define_ctrl();
        //uncomment line 93 and comment line 100 to use current position
        //controller.setMousePos(leader.entity.x, leader.entity.y);

        //predict movement version
        let core = define_core();
        let time = 2000; //how many milliseconds delay you want to predict (I chose 2 seconds for now)
        let predict = core.predictEntityPosition(leader.entity, time);
        //comment like 100 and uncomment line 93 to use prediction position
        //controller.setMousePos(predict[0], predict[1]);

        //aimbot version (destroyer)
        handle_aim(predict[0], predict[1]);
    }else{
        shot = false;
    }
}

let shot = false;

function handle_aim(x, y){
    let gm = define_gM();
    let controller = define_ctrl();

    let allowed_tanks = ['Destroyer', 'Hybrid', 'Annihilator'];
    if(allowed_tanks.includes(gm.getTank()) && !shot){
        let last_coords = controller.getMousePos();
        controller.setMousePos(x, y);
        setTimeout(() => {
            input.onKeyUp(36);
        }, 100);
        input.onKeyDown(36);
        setTimeout(() => {
            controller.setMousePos(last_coords[0], last_coords[1]);
        }, 200);
        shot = true;
    }
}

//initialise
function init(){
    window.requestAnimationFrame(init);
    if(window.lobby_ip){
        if(api && extern.doesHaveTank()){ //checks if you spawned, since some of the classes require you to be in game
            draw_leader();
            //example usage
            window.em = define_eM();
            window.gm = define_gM();
            window.ctrl = define_ctrl();
            window.lb = define_lb_reader();
            window.core = define_core();
        }
    }
}
window.requestAnimationFrame(init);