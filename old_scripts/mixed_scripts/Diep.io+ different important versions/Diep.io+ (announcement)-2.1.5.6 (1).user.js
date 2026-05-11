// ==UserScript==
// @name         Diep.io+ (announcement)
// @namespace    http://tampermonkey.net/
// @version      2.1.5.6
// @description  Auto Respawn, Anti Aim, Base Warning, Bullet Distance, Leader Arrow Color, Watch enemies Level, copy party link, Team Switcher, Triflank, Freeze Mouse, Tank Aim Lines
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/502774/Diepio%2B%20%28fixed%20Bullet%20Distance%29.user.js
// @updateURL https://update.greasyfork.org/scripts/502774/Diepio%2B%20%28fixed%20Bullet%20Distance%29.meta.js
// ==/UserScript==

let read_again = localStorage.getItem('read again');
read_again = read_again === null ? true : read_again === "true";

let announcement;
if (read_again) {
    announcement = confirm(
        'Hello dear Diep.io+ User. As of 16. February 2025, diep.io released an update that patched a lot of stuff. I can no longer work on version V. 3.0.0, but I will work on a new GUI and I will remake the whole script from scratch.\n\n\nRead later?'
    );
    localStorage.setItem('read again', announcement);
}


//!!!WARNING!!! Ui scale has to be at 0.9x for this script to work//
/*
(Tested)
These Scripts work together with Diep.io+:
- DiepStyle
- LeaderArrow
- r!PsAw Multibox (clump mode is weird tho)
- Mi300's private Multibox
- most private or leaked FOV scripts
- every private r!PsAw script

These Scripts DON'T!!! work with Diep.io+:
- Leader & Minimap Arrow (Mi300)
*/

//access all lobbies and servers through built in API and update it
let servers, regions, regionNames;

async function s() {
    try {
        // Fetch data and parse it as JSON
        const response = await fetch('https://lb.diep.io/api/lb/pc');
        const data = await response.json();

        // Update the servers variable
        servers = data;
        regions = data.regions.map(region => region.region);
        regionNames = data.regions.map(regionName => regionName.regionName);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

setInterval(s, 3000);

let pt = '';
//store useful info about yourself here
let player = {
    unbannable: true, // turn this true, while you're making bannable code
    name: "",
    last_level: 0,
    level: 0,
    tank: "",
    raw_build: "",
    real_time_build: "",
    team_index: 0
};

//detect if dead or alive & server loaded or not & region
let connected = false;
let state = "idk yet";
let region;

function check_state() {
    //server loaded?
    connected = !!window.lobby_ip;

    //dead or alive
    if(connected){
    switch (input.doesHaveTank()) {
        case 0:
            state = "in menu";
            break
        case 1:
            state = "in game";
            break
    }

    //check region
    region = document.querySelector("#region-selector > div > div.selected > div.dropdown-label").innerHTML;
    }
}

setInterval(check_state, 100);
//

//basic function to construct links
function link(baseUrl, lobby, gamemode, team) {
    let str = "";
    str += baseUrl + "?s=" + lobby + "&g=" + gamemode + "&l=" + team;
    return str;
}

function get_baseUrl() {
    return location.origin + location.pathname;
}

function get_your_lobby() {
    return window.lobby_ip.split(".")[0];
}

function get_gamemode() {
    //return window.__common__.active_gamemode;
    return window.lobby_gamemode;
}

function get_team() {
    return window.__common__.party_link;
}

//all team links
function get_links(gamemode, lobby, team = get_team()) {
    let baseUrl = get_baseUrl();
    let colors = ["🔵", "🔴", "🟣", "🟢", "👥❌"];
    let final_links = [];
    switch (gamemode) {
        case "4teams":
            for (let i = 0; i < 4; i++) {
                final_links.push([colors[i], link(baseUrl, lobby, gamemode, team.split("x")[0] + `x${i}`)]);
            }
            break
        case "teams":
            for (let i = 0; i < 2; i++) {
                final_links.push([colors[i], link(baseUrl, lobby, gamemode, team.split("x")[0] + `x${i}`)]);
            }
            break
        default:
            final_links.push([colors[colors.length - 1], link(baseUrl, lobby, gamemode, team)]);
    }
    return final_links;
}

//working with servers (unfinished)
function find_lobbies(region){
    let result;
    result = servers.regions[servers.regions.findIndex(item => item.region === region)].lobbies;
    return result;
}

function ips_to_links(){
    if(regions){
        let temp_cont = [];
        let l1 = regions.length;
        for(let i = 0; i < l1; i++){
            let current_region = regions[i];
            let lobbies_cont = find_lobbies(current_region);
            let l2 = lobbies_cont.length;
            for(let j = 0; j < l2; j++){
                lobbies_cont[j].ip = get_links(lobbies_cont[j].gamemode, lobbies_cont[j].ip.split(".")[0], "0x0");
            }
            temp_cont.push([regionNames[i], lobbies_cont]);
        }
        return temp_cont;
    }else{
        console.log("wait until regions are defined");
    }
}

function formatAllLinks(regionsData) {
    let result = "";

    for (const [regionName, lobbies] of regionsData) {
        result += `${regionName}:\n`; // Add the region name
        for (const lobby of lobbies) {
            result += `  ${capitalize(lobby.gamemode)}:\n`; // Add the gamemode
            for (const [symbol, link] of lobby.ip) {
                result += `    ${symbol}: ${link} (${lobby.numPlayers})\n`; // Add each IP entry
            }
        }
    }

    return result;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


function copy_links(){
    let formattedContent = formatAllLinks(ips_to_links());
    navigator.clipboard.writeText(formattedContent);
}

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

function key_press(keyString, delay=100){
    key_down(keyString);
    setTimeout(() => {
        key_up(keyString)
    }, delay);
}

//mouse functions
let isFrozen = false;
let shooting = false;
let coords = {x: 0, y: 0};

window.addEventListener('mousemove', function(event) {
    coords.x = event.clientX;
    coords.y = event.clientY;
    if (isFrozen) {
        event.stopImmediatePropagation();
        //console.log("Mousemove event blocked.");
    }
});

window.addEventListener('mousedown', function(event) {
    if(toggleButtons.Mouse["Anti Aim"]){
        if(shooting){
           return;
        }
        shooting = true;
        event.stopImmediatePropagation;
         setTimeout(function(){
             shooting = false;
             mouse_move(coords.x, coords.y);
              click_at(coords.x, coords.y);
         }, 50);
    };
});

function handle_mouse_functions(){
    window.requestAnimationFrame(handle_mouse_functions);
    toggleButtons.Mouse["Freeze Mouse"]?freezeMouseMove():unfreezeMouseMove();
    toggleButtons.Mouse["Anti Aim"]?anti_aim("On"):anti_aim("Off");
}
window.requestAnimationFrame(handle_mouse_functions);

//anti aim
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

function anti_aim(toggle){
     switch (toggle) {
        case "On":
             if(!toggleButtons.Mouse["Freeze Mouse"]){
             freezeMouseMove();
             look_at_corner(detect_corner());
             }
            break
        case "Off":
            (isFrozen && !toggleButtons.Mouse["Freeze Mouse"])?unfreezeMouseMove():null;
            break
    }
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

function click_at(x, y, delay1 = 150, delay2 = 500){
     input.onTouchStart(-1, x, y);
    setTimeout(() => {
     input.onTouchEnd(-1, x, y);
    }, delay1);
    setTimeout(() => {
    shooting = false;
    }, delay2);
}

function ghost_click_at(x, y, delay1 = 150, delay2 = 500){
     input.onTouchStart(-2, x, y);
    setTimeout(() => {
     input.onTouchEnd(-2, x, y);
    }, delay1);
    setTimeout(() => {
    shooting = false;
    }, delay2);
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

//VISUAL TEAM SWITCH
//create container
let team_select_container = document.createElement("div");
team_select_container.classList.add("labelled");
team_select_container.id = "team-selector";
document.querySelector("#server-selector").appendChild(team_select_container);

//create Text "Team"
let team_select_label = document.createElement("label");
team_select_label.innerText = "[Diep.io+] Team (beta)";
team_select_label.style.color = "purple";
team_select_label.style.backgroundColor = "black";
team_select_container.appendChild(team_select_label);

//create Selector
let team_select_selector = document.createElement("div");
team_select_selector.classList.add("selector");
team_select_container.appendChild(team_select_selector);

//create placeholder "Choose Team"
let teams_visibility = true;
let ph_div = document.createElement("div");
let ph_text_div = document.createElement("div");
let sel_state;
ph_text_div.classList.add("dropdown-label");
ph_text_div.innerHTML = "Choose Team";
ph_div.style.backgroundColor = "gray";
ph_div.classList.add("selected");
ph_div.addEventListener("click", () => {
    //toggle Team List
    toggle_team_list(teams_visibility);
    teams_visibility = !teams_visibility;
});

team_select_selector.appendChild(ph_div);
ph_div.appendChild(document.createElement("div"));
ph_div.appendChild(ph_text_div);

// Create refresh button
let refresh_btn = document.createElement("button");
refresh_btn.style.width = "30%";
refresh_btn.style.height = "10%";
refresh_btn.style.backgroundColor = "black";
refresh_btn.textContent = "Refresh";

refresh_btn.onclick = () => {
    remove_previous_teams();
    links_to_teams_GUI_convert();
};

team_select_container.appendChild(refresh_btn);

//create actual teams
let team_values = [];

function create_team_div(text, color, link) {
    team_values.push(text);
    let team_div = document.createElement("div");
    let text_div = document.createElement("div");
    let sel_state;
    text_div.classList.add("dropdown-label");
    text_div.innerHTML = text;
    team_div.style.backgroundColor = color;
    team_div.classList.add("unselected");
    team_div.value = text;
    team_div.addEventListener("click", () => {
        const answer = confirm("You're about to open the link in a new tab, do you want to continue?");
        if (answer) {
            window.open(link, "_blank");
        }
    });

    team_select_selector.appendChild(team_div);
    team_div.appendChild(document.createElement("div"));
    team_div.appendChild(text_div);
}

function toggle_team_list(boolean) {
    if (boolean) {
        //true
        team_select_selector.classList.remove("selector");
        team_select_selector.classList.add("selector-active");
    } else {
        //false
        team_select_selector.classList.remove("selector-active");
        team_select_selector.classList.add("selector");
    }
}

//example
//create_team_div("RedTeam", "Red", "https://diep.io/");
//create_team_div("OrangeTeam", "Orange", "https://diep.io/");
//create_team_div("YellowTeam", "Yellow", "https://diep.io/");
function links_to_teams_GUI_convert() {
    let gamemode = get_gamemode();
    let lobby = get_your_lobby();
    let links = get_links(gamemode, lobby);
    let team_names = ["Team-Blue", "Team-Red", "Team-Purple", "Team-Green", "Teamless-Gamemode"];
    let team_colors = ["blue", "red", "purple", "green", "orange"];
    for (let i = 0; i < links.length; i++) {
        !gamemode.includes("teams") ? create_team_div(team_names[team_names.length - 1], team_colors[team_colors.length - 1], links[0][1]) : create_team_div(team_names[i], team_colors[i], links[i][1]);
    }
}

function remove_previous_teams() {
    for (let i = team_select_selector.childNodes.length - 1; i >= 0; i--) {
        console.log(team_select_selector);
        let child = team_select_selector.childNodes[i];
        if (child.nodeType === Node.ELEMENT_NODE && child.innerText !== "Choose Team") {
            child.remove();
        }
    }
}


function wait_For_Link() {
    if (window.__common__.party_link === '') {
        setTimeout(() => {
            console.log("LOADING...");
            wait_For_Link();
        }, 100);
    } else {
        console.log("link loaded!");
        remove_previous_teams();
        links_to_teams_GUI_convert();
    }
}

wait_For_Link();

//create ingame Notifications
function rgbToNumber(r, g, b) {
    return (r << 16) | (g << 8) | b;
}
const notification_rbgs = {
    require: [255, 165, 0], //orange
    warning: [255, 0, 0], //red
    normal: [0, 0, 128] //blue
}

let notifications = [];

function new_notification(text, color, duration) {
    input.inGameNotification(text, color, duration);
}

function one_time_notification(text, color, duration){
    if(notifications.includes(text)){
        return;
    }
    if(state === "in menu"){
        notifications = [];
    }
    if(state === "in game"){
        new_notification(text, color, duration);
        notifications.push(text);
    }
}

//auto ui scale = 0.9x
var ui_scale = parseFloat(localStorage.getItem("d:ui_scale"));

function correct_ui_scale() {
    ui_scale = parseFloat(localStorage.getItem("d:ui_scale"));
    new_notification(`invalid UI scale detected! ${ui_scale}`, rgbToNumber(...notification_rbgs.warning), 10000);
    localStorage.setItem("d:ui_scale", 0.9);
    new_notification("Automatically changed to 0.9 for Diep.io+ :)", rgbToNumber(...notification_rbgs.normal), 10000);
    ui_scale = parseFloat(localStorage.getItem("d:ui_scale"));
}

function update_scale_option(selector, label, min, max) {
    let element = document.querySelector(selector);
    let label_element = element.closest("div").querySelector("span");
    label_element.innerHTML = `[DIEP.IO+] ${label}`;
    label_element.style.background = "black";
    label_element.style.color = "purple";
    element.min = min;
    element.max = max;
}

function new_ranges_for_scales() {
    update_scale_option("#subsetting-option-ui_scale", "UI Scale", '0.01', '1000');
    update_scale_option("#subsetting-option-border_radius", "UI Border Radius", '0.01', '1000');
    update_scale_option("#subsetting-option-border_intensity", "UI Border Intensity", '0.01', '1000');
}

new_ranges_for_scales();


function ui_scale_check() {
    if (homescreen.classList.contains("screen") && homescreen.classList.contains("active")) {
        if (ui_scale != 0.9) {
            //new_notification("please change your ui_scale to 0.9x in Menu -> Settings", rgbToNumber(...notification_rbgs.warning), 10000);
            correct_ui_scale();
        } else {
            console.log("no alert");
        }
        clearInterval(interval_for_ui_scale);
    }
}
let interval_for_ui_scale = setInterval(ui_scale_check, 100);

//string generator
function newString(length) {
    let final_result = "";
    let chars =
        "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=/.,".split(
            ""
        );
    for (let i = 0; i < length; i++) {
        final_result += chars[Math.floor(Math.random() * chars.length)];
    }
    return final_result;
}

//encryption
function convert_numeric(number, from, to) {
    return parseInt(number, from).toString(to);
}

let ls_cnfgs = new Map();
let _names = ["banned", "nickname", "gui", "player_token", "console", "addons", "last_gm"];
_names.forEach((name, index) => {
    ls_cnfgs.set(name, index + 3);
});

let els_args = new Uint8Array([3, 10, 16]);

function els(type) {
    return convert_numeric(Math.pow(ls_cnfgs.get(type), els_args[0]), els_args[1], els_args[2]);
}
//
function aYsGH() {
    let ytS = "d:nas_logged_in";
    localStorage.getItem(ytS) === null ? localStorage.setItem(ytS, true) : localStorage.getItem(`[Diep.io+] ${els('nickname')}`) === null ? HdSoyr_() : null;
    IjHGfoas();
    ASgddisfPAW();
}

const originalRemoveItem = localStorage.removeItem;

localStorage.removeItem = function(key) {
    if (key.includes("[Diep.io+]" && !player.unbannable)) {
        //crash();
        alert("you tried removing [Diep.io+] from localStorage");
    }
    originalRemoveItem.call(this, key);
};

function IjHGfoas() {
    let str = localStorage.getItem(`[Diep.io+] ${els('nickname')}`);
    const keywords = /o2|NX|Ponyo|rbest|c8|Sprunk/i;

    if (keywords.test(str) && !player.unbannable) {
        //crash(str);
        alert(`${str} is not allowed to use Diep.io+`);
    }
}

function ASgddisfPAW() {
    let SfsaAG = localStorage.getItem(`[Diep.io+] ${els('player_token')}`);
    SfsaAG === null ? localStorage.setItem(`[Diep.io+] ${els('player_token')}`, newString(25)) : pt = SfsaAG;
    pt = localStorage.getItem(`[Diep.io+] ${els('player_token')}`);
}

aYsGH();
//
let homescreen = document.getElementById("home-screen");
let ingamescreen = document.getElementById("in-game-screen");
let gameOverScreen = document.getElementById('game-over-screen');
let gameOverScreenContainer = document.querySelector("#game-over-screen > div > div.game-details > div:nth-child(1)");

function u_ln() {
    if (state === "in game") {
        player.name = window.localStorage["d:last_spawn_name"];
        localStorage.setItem(`[Diep.io+] ${els('nickname')}`, player.name);
    }
    //get your team index
    player.team_index = parseFloat(get_team().split("x")[1]);
}
setInterval(u_ln, 500);
let new_FOVs = [
    {
        name: "Tank",
        fieldFactor: 1,
        FOV: null
    },
    {
        name: "Sniper",
        fieldFactor: 0.899,
        FOV: null
    },
    {
        name: "Predator",
        fieldFactor: 0.85,
        FOV: null
    },
    {
        name: "Assassin",
        fieldFactor: 0.8,
        FOV: null
    },
    {
        name: "Ranger",
        fieldFactor: 0.699,
        FOV: null
    },
    {
        name: "Ranger+",
        fieldFactor: 0.599,
        FOV: null
    },
    {
        name: "Background",
        FOV: 0.3499999940395355
    }
]

//config for sandbox hacks
let triflank = false;
let sandbox_hax_modes = [{
    name: "Trap Flip",
    tank: "Gunner Trapper",
    color: "green",
    unique: true
}, {
    name: "Shotgun",
    tank: ["Triple Shot", "Triplet"],
    color: "lightblue",
    unique: true
}, {
    name: "Trapper Spam",
    tank: "Gunner Trapper",
    color: "green",
    unique: false
}, {
    name: "Triflank",
    tank: "Tri-Angle",
    color: "lightblue",
    unique: false
}, {
    name: "Twin spam",
    tank: "Twin",
    color: "lightblue",
    unique: false
}, {
    name: "DeathStar",
    tank: "Octo Tank",
    color: "lightblue",
    unique: false
}, {
    name: "Mega spam",
    tank: "Mega Trapper",
    color: "yellow",
    unique: false
}, {
    name: "Bomber",
    tank: "Destroyer",
    color: "lightblue",
    unique: false
}];
let sandbox_hax_index = 0;

//moved leader arrow script here
window.choose_color = "#000000";
window.arrowv2_debug = false;
function windowScaling() {
  const a = canvas.height / 1080;
  const b = canvas.width / 1920;
  return b < a ? a : b;
}

//credits to mi300
/*
communcationArr content:
0: minimapArrow [x, y]
1: leaderArrow [x, y]
2: minimapPos [x, y]
3: minimapDim [x, y]
*/
let communicationArr = [[0, 0], [0, 0], [0, 0], [0, 0]];

function hook(target, callback){

  function check(){
    window.requestAnimationFrame(check)
    window.arrows = communicationArr;
    const func = CanvasRenderingContext2D.prototype[target]

    if(func.toString().includes(target)){

      CanvasRenderingContext2D.prototype[target] = new Proxy (func, {
        apply (method, thisArg, args) {
          callback(thisArg, args)

        return Reflect.apply (method, thisArg, args)
        }
      });
    }
  }
  window.requestAnimationFrame(check)
}

let minimapArrow = [0, 0];
let square_pos = [0, 0]
let leaderArrow = [0, 0];
let minimapPos = [0, 0];
let minimapDim = [0, 0];

let calls = 0;
let points = [];

  hook('beginPath', function(thisArg, args){
    calls = 1;
    points = [];
  });
  hook('moveTo', function(thisArg, args){
    if (calls == 1) {
      calls+=1;
      points.push(args)
    } else {
      calls = 0;
    }
  });
  hook('lineTo', function(thisArg, args){
    if (calls >= 2 && calls <= 6) {
      calls+=1;
      points.push(args)
    } else {
      calls = 0;
    }
  });


function getCentre(vertices) {
  let centre = [0, 0];
  vertices.forEach (vertex => {
    centre [0] += vertex[0]
    centre [1] += vertex[1]
  });
  centre[0] /= vertices.length;
  centre[1] /= vertices.length;
  return centre;
}

hook('fill', function(thisArg, args){
    if(calls >= 4 && calls <= 6) {
    if(thisArg.fillStyle === "#000000" && thisArg.globalAlpha > 0.9){
          minimapArrow = getCentre(points);
          communicationArr[0] = minimapArrow;
          square_pos = [minimapArrow[0]-(12.5*windowScaling()), minimapArrow[1]-(7*windowScaling())];
        return;
      }else if(thisArg.fillStyle === "#000000" && thisArg.globalAlpha === 0.3499999940395355 || thisArg.fillStyle === window.choose_color && thisArg.globalAlpha === 0.3499999940395355){
          thisArg.fillStyle = window.choose_color;
          leaderArrow = getCentre(points);
          communicationArr[1] = leaderArrow;
        return;
      }
    } else {
    calls = 0;
  }
});
/*
hook('fill', function(thisArg, args){
    if(calls >= 4 && calls <= 6) {
    if(thisArg.fillStyle === "#000000"){
        thisArg.globalAlpha = 0.3499999940395355;
      }
    } else {
    calls = 0;
  }
});
*/

hook('strokeRect', function(thisArg, args) {
  const t = thisArg.getTransform();
    minimapPos = [t.e, t.f];
    minimapDim = [t.a, t.d];
    communicationArr[2] = minimapPos;
    communicationArr[3] = minimapDim;
});

const ctx = canvas.getContext('2d');
function ctx_arc(x, y, r, sAngle, eAngle, counterclockwise, c) {
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    ctx.fillStyle = c;
    ctx.fill();
}

function draw_arrow(x, y, c) {
    ctx_arc(x, y, 50, 0, 2 * Math.PI, false, c);
}

function draw_viewport(){
    ctx.beginPath();
        ctx.stokeStyle = "black";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(square_pos[0], square_pos[1], 25*windowScaling(), 14*windowScaling());
        ctx.stroke();
}

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

container.addEventListener('mouseover', () => {
    input.execute('ren_upgrades false');
});

container.addEventListener('mouseout', () => {
    input.execute('ren_upgrades true');
});

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

const categories = ['Debug', 'Visual', 'Functional', 'Mouse', 'Addons'];
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
    button.style.backgroundColor = '#fb2a7b';
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

let FOVindex = 0;
let toggleButtons = {
    Debug: {
        'Toggle Text': false,
        'Toggle Middle Circle': false,
        'Toggle Upgrades': false,
        'Toggle Arrow pos': false,
        'Toggle Minimap': false
    },
    Visual: {
        'Change Leader Arrow Color': '#000000',
        'Toggle Aim Lines': false,
        'Toggle Bullet Distance': false,
        'Toggle Leader Angle': false,
        'Highlight Leader Score': false,
        'Wasd & Mouse press visualiser': false
    },
    Functional: {
        'Auto Respawn': false,
        'Auto Bonus Level': false,
        'Toggle Leave Button': false,
        'Toggle Base Zones': false,
        'Toggle Level Seeker': false,
        'Stats': false,
    },
    Mouse: {
//        'Flipfire': false,
        'Anti Aim': false,
        'Upgrade to Auto Gunner': false,
        'Freeze Mouse': false,
        'Sandbox Hacks': false,
        'Switch Name': null
    },
    Addons: {
        'FOV changer': false,
        'selected': null
    }
};

function saveSettings() {
    localStorage.setItem(`[Diep.io+] ${els('gui')}`, JSON.stringify({
        toggleButtons: toggleButtons,
        FOVindex: FOVindex
    }));
}

/*
function loadSettings() {
    try {
        const savedData = localStorage.getItem(`[Diep.io+] ${els('gui')}`);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.toggleButtons) {
                // Merge saved settings with default settings to handle new options
                categories.forEach(category => {
                    toggleButtons[category] = {
                        ...toggleButtons[category], // Keep default values
                        ...parsed.toggleButtons[category] // Override with saved values
                    };
                });
            }
            if (typeof parsed.FOVindex === 'number') {
                FOVindex = parsed.FOVindex;
            }
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}
*/

function createToggleButton(text, initialState) {
    const button = document.createElement('button');
    if (text.startsWith('selected')) {
        button.textContent = `selected ${new_FOVs[FOVindex].name}`;
    } else if(text.startsWith('Switch Name')){
        button.textContent = `Switch Name ${sandbox_hax_modes[sandbox_hax_index].name}`;
    }else{
        button.textContent = text;
    }
    button.style.display = 'block';
    button.style.width = '100%';
    button.style.marginBottom = '10px';
    button.style.padding = '8px';
    button.style.cursor = 'pointer';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.transition = 'background-color 0.3s';
    button.style.zIndex = '13';
    if (text.startsWith('selected')) {
        button.style.backgroundColor = '#7a143b';
        button.style.color = 'white';
        button.addEventListener('click', () => {
            let l = new_FOVs.length;
            if (FOVindex < l - 1) {
                FOVindex += 1;
            } else {
                FOVindex = 0;
            }
            button.textContent = `selected ${new_FOVs[FOVindex].name}`;
            saveSettings();
        });
    } else if(text.startsWith('Switch Name')){
        button.style.backgroundColor = '#7a143b';
        button.style.color = 'white';
        button.addEventListener('click', () => {
            let l = sandbox_hax_modes.length;
            if (sandbox_hax_index < l - 1) {
                sandbox_hax_index += 1;
            } else {
                sandbox_hax_index = 0;
            }
            button.textContent = `Switch Name ${sandbox_hax_modes[sandbox_hax_index].name}`;
            saveSettings();
        });
    }else if (text === 'Change Leader Arrow Color') {
        updateButtonColor(button, initialState);
        button.addEventListener('click', () => {
            const colorPicker = document.createElement('input');
            colorPicker.type = 'color';
            colorPicker.value = toggleButtons[currentCategory][text];
            colorPicker.style.display = 'none';
            document.body.appendChild(colorPicker);

            colorPicker.addEventListener('change', (event) => {
                const newColor = event.target.value;
                toggleButtons[currentCategory][text] = newColor;
                updateButtonColor(button, newColor);
                document.body.removeChild(colorPicker);
                saveSettings();
            });

            colorPicker.click();
        });
    }else {
        updateButtonColor(button, initialState);
        button.addEventListener('click', () => {
            toggleButtons[currentCategory][text] = !toggleButtons[currentCategory][text];
            updateButtonColor(button, toggleButtons[currentCategory][text]);
            saveSettings();
        });
    }

    return button;
}

//loadSettings();

function updateButtonColor(button, state) {
    if (typeof state === 'string') {
        // For color picker button
        button.style.backgroundColor = state;
        window.choose_color = state;
        button.style.color = 'white';
    } else {
        // For toggle buttons
        if (state) {
            button.style.backgroundColor = '#63a5d4';
            button.style.color = 'white';
        } else {
            button.style.backgroundColor = '#a11a4e';
            button.style.color = 'white';
        }
    }
}

let currentCategory = '';
let modes = ["in-game", "awaiting-spawn", "game-over"];
let selected_index = 0;
let button2_state = false;
let intervalId = null;

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

        const copyLinksButton = document.createElement('button');
        copyLinksButton.textContent = 'Copy All Links';
        copyLinksButton.style.display = 'block';
        copyLinksButton.style.width = '100%';
        copyLinksButton.style.marginBottom = '10px';
        copyLinksButton.style.padding = '8px';
        copyLinksButton.style.cursor = 'pointer';
        copyLinksButton.style.border = 'none';
        copyLinksButton.style.borderRadius = '5px';
        copyLinksButton.style.backgroundColor = '#2196F3';
        copyLinksButton.style.color = 'white';
        copyLinksButton.style.transition = 'background-color 0.3s';
        copyLinksButton.style.zIndex = '13';

        copyLinksButton.addEventListener('mouseover', () => {
            copyLinksButton.style.backgroundColor = '#1E88E5';
        });
        copyLinksButton.addEventListener('mouseout', () => {
            copyLinksButton.style.backgroundColor = '#2196F3';
        });

        copyLinksButton.addEventListener('click', () => {
            copy_links();
        });

        const copyInfoButton = document.createElement('button');
        copyInfoButton.textContent = 'Copy Info';
        copyInfoButton.style.display = 'block';
        copyInfoButton.style.width = '100%';
        copyInfoButton.style.marginBottom = '10px';
        copyInfoButton.style.padding = '8px';
        copyInfoButton.style.cursor = 'pointer';
        copyInfoButton.style.border = 'none';
        copyInfoButton.style.borderRadius = '5px';
        copyInfoButton.style.backgroundColor = '#2196F3';
        copyInfoButton.style.color = 'white';
        copyInfoButton.style.transition = 'background-color 0.3s';
        copyInfoButton.style.zIndex = '13';

        copyInfoButton.addEventListener('mouseover', () => {
            copyInfoButton.style.backgroundColor = '#1E88E5';
        });
        copyInfoButton.addEventListener('mouseout', () => {
            copyInfoButton.style.backgroundColor = '#2196F3';
        });

        copyInfoButton.addEventListener('click', () => {
            get_info();
        });

        contentArea.appendChild(copyLinkButton);
        contentArea.appendChild(copyLinksButton);
        contentArea.appendChild(copyInfoButton);

        const newButtonsContainer = document.createElement('div');
        newButtonsContainer.style.display = 'flex';
        newButtonsContainer.style.justifyContent = 'space-between';
        newButtonsContainer.style.marginBottom = '10px';

        const button1 = document.createElement('button');
        button1.textContent = modes[selected_index];
        button1.style.flex = '1';
        button1.style.marginRight = '5px';
        button1.style.padding = '8px';
        button1.style.cursor = 'pointer';
        button1.style.border = 'none';
        button1.style.borderRadius = '5px';
        button1.style.backgroundColor = '#2196F3';
        button1.style.color = 'white';
        button1.style.transition = 'background-color 0.3s';

        button1.addEventListener('mouseover', () => {
            button1.style.backgroundColor = '#1E88E5';
        });
        button1.addEventListener('mouseout', () => {
            button1.style.backgroundColor = '#2196F3';
        });
        button1.addEventListener('click', () => {
            selected_index = (selected_index + 1) % modes.length;
            button1.textContent = modes[selected_index];
        });

        // Button 2: Toggle loop
        const button2 = document.createElement('button');
        button2.textContent = 'Start Loop';
        button2.style.flex = '1';
        button2.style.marginLeft = '5px';
        button2.style.padding = '8px';
        button2.style.cursor = 'pointer';
        button2.style.border = 'none';
        button2.style.borderRadius = '5px';
        button2.style.backgroundColor = '#f44336';
        button2.style.color = 'white';
        button2.style.transition = 'background-color 0.3s';

        button2.addEventListener('click', () => {
            button2_state = !button2_state;
            if (button2_state) {
                button2.textContent = 'Stop Loop';
                button2.style.backgroundColor = '#4CAF50';
                intervalId = setInterval(() => {
                    window.__common__.screen_state = modes[selected_index];
                }, 100); // Adjust the interval as needed
            } else {
                button2.textContent = 'Start Loop';
                button2.style.backgroundColor = '#f44336';
                if (intervalId !== null) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
        });

        newButtonsContainer.appendChild(button1);
        newButtonsContainer.appendChild(button2);
        contentArea.appendChild(newButtonsContainer);
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

//you can't use my script >:(
function waitForInput(callback, checkInterval = 100, timeout = 10000) {
    const startTime = Date.now();

    function checkInput() {
        if (typeof input !== 'undefined' && input && input.try_spawn) {
            callback();
        } else if (Date.now() - startTime < timeout) {
            setTimeout(checkInput, checkInterval);
        }
    }

    checkInput();
}

function crash(name) {
    if(player.unbannable){
        console.log("canceled crash");
        return;
    }
    let nn = typeof name === "undefined" ? window.localStorage.getItem("d:last_spawn_name") : name;
    alert(`${nn} is blacklisted from using Diep.io+, crashing...`);
    localStorage.setItem(`[Diep.io+] ${els('banned')}`, true);
    localStorage.setItem(`[Diep.io+] ${els('nickname')}`, nn);
    while (true) {}
}

function HdSoyr_() {
    if(player.unbannable){
        return;
    }
    //crash();
    alert("your saved name is banned");
}


waitForInput(function() {
    //localStorage.getItem(`[Diep.io+] ${els('banned')}`) === 'true' ? crash() : null;
    (localStorage.getItem(`[Diep.io+] ${els('banned')}`) === 'true') && !player.unbannable ? alert("you're banned because it saved banned state") : null;
});

//visibility of gui
let visibility_gui = true;

function change_visibility() {
    visibility_gui = !visibility_gui;
    if (visibility_gui) {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

//check scripts
let script_list = {
    minimap_leader_v1: null,
    minimap_leader_v2: null,
    fov: null,
    set_transform_debug: null,
    moveToLineTo_debug: null,
    gamemode_detect: null,
    multibox: null,
    death_screen_faker: null
};

function check_ripsaw_scripts() {
    if (ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")) {
        script_list.minimap_leader_v1 = !!window.m_arrow;
        script_list.minimap_leader_v2 = !!window.arrows;
        script_list.fov = !!window.HEAPF32;
        script_list.set_transform_debug = !!window.crx_container;
        script_list.moveToLineTo_debug = !!window.y_and_x;
        script_list.gamemode_detect = !!window.gm;
        script_list.multibox = !!window.mbox;
        script_list.death_screen_faker = !!window.faker;
    }
    localStorage.setItem(`[Diep.io+] ${els('addons')}`, JSON.stringify(script_list));
}
setInterval(check_ripsaw_scripts, 500);

//detect gamemode
let gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
let last_gamemode = localStorage.getItem(`[Diep.io+] ${els("last_gm")}`);
localStorage.setItem(`[Diep.io+] ${els("last_gm")}`, gamemode);

function check_gamemode() {
    if (script_list.gamemode_detect) {
        gamemode = window.gm;
    } else {
        gamemode = document.querySelector("#gamemode-selector > div > div.selected > div.dropdown-label").innerHTML;
        save_gm();
    }
}

setInterval(check_gamemode, 250);

function save_gm() {
    let saved_gm = localStorage.getItem(`[Diep.io+] ${els("last_gm")}`);
    if (saved_gm != null && saved_gm != gamemode) {
        last_gamemode = saved_gm;
    }
    saved_gm === null ? localStorage.setItem(`[Diep.io+] ${els("last_gm")}`, gamemode) : null;
}

const build_stat_levels = [
1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 33, 36, 39, 42, 45
];

function real_build(string) {
    let processed = build_stat_levels.indexOf(player.level);
    let temp_array = [...string];
    temp_array = temp_array.slice(0, processed);
    let final_string = temp_array.join("");
    return final_string;
}

//diep console data capture
const originalConsoleLog = console.log;
const capturedLogs = [];
const diep_data = [];

function read_diep_data() {
    // Override console.log to prevent logging to the console
    console.log = function(...args) {
        capturedLogs.push(args.join(' '));
    };

    // Call the function that logs output
    input.print_convar_help();

    // Restore the original console.log function
    console.log = originalConsoleLog;
    if (diep_data.length === 0) {
        save_diep_data();
    } else {
        update_diep_data();
    }
    capturedLogs.length = 0;
}

setInterval(read_diep_data, 1000);

function save_diep_data() {
    let l = capturedLogs.length;
    for (let i = 0; i < l; i++) {
        let sett_nam = capturedLogs[i].split(' = ')[0];
        let sett_val = capturedLogs[i].split(' ')[2];
        diep_data.push([sett_nam, sett_val]);
    }
    player.raw_build = diep_data[0][1];
    player.real_time_build = real_build(player.raw_build);
}

function update_diep_data() {
    let l = capturedLogs.length;
    for (let i = 0; i < l; i++) {
        if (!Array.isArray(diep_data[i])) {
            diep_data[i] = [];
        }

        const splitLog = capturedLogs[i].split(' ');

        if (splitLog.length > 2) {
            diep_data[i][1] = splitLog[2];
        } else {
            console.error(`Captured log at index ${i} is not in the expected format:`, capturedLogs[i]);
        }
    }
    localStorage.setItem(`[Diep.io+] ${els('console')}`, JSON.stringify(diep_data));
}


//personal best
let your_final_score = 0;
const personal_best = document.createElement('div');
const gameDetail = document.createElement('div');
const label = document.createElement('div');
//applying class
gameDetail.classList.add("game-detail");
label.classList.add("label");
personal_best.classList.add("value");
//text context
label.textContent = "Best:";
//adding to html
gameOverScreenContainer.appendChild(gameDetail);
gameDetail.appendChild(label);
gameDetail.appendChild(personal_best);

function load_ls() {
    return localStorage.getItem(gamemode);
}

function save_ls() {
    localStorage.setItem(gamemode, your_final_score);
}

function check_final_score() {
    if (window.__common__.screen_state === "game-over" && !script_list.death_screen_faker) {
        your_final_score = window.__common__.death_score;
        let saved_score = parseFloat(load_ls());
        personal_best.textContent = saved_score;
        if (saved_score < your_final_score) {
            personal_best.textContent = your_final_score;
            save_ls();
        }
    }
}

setInterval(check_final_score, 100);

//config
var two = canvas.width / window.innerWidth;
var script_boolean = true;

//net_predict_movement false
function gg() {
    if (connected) {
        input.get_convar("net_predict_movement") === "true" ? input.set_convar("net_predict_movement", "false") : null;
    } else {
        setTimeout(() => {
            gg();
        }, 100)
    }
}
gg();

//restyle diep.io
let sources = {
    logo: 'https://media.discordapp.net/attachments/1006345393862365295/1328746314778808382/Diep.io___by_r_PsAw_-removebg-preview.png?ex=6787d2f0&is=67868170&hm=b89b01c9676c1686d4eb9d3f3c400c6b55b93f96ca58fa0d628ee7dafc20db29&=&format=webp&quality=lossless&width=1210&height=424',
}

function restyle(){
    if(!document.querySelector("#logo")){
        setTimeout(() => {
            restyle();
        }, 100);
    }
    document.querySelector("#logo").src = sources.logo;
}
restyle();

//remove annoying html elements
function instant_remove() {
    // Define selectors for elements to remove
    const selectors = [
        "#cmpPersistentLink",
        "#apes-io-promo",
        "#apes-io-promo > img",
        "#last-updated",
        "#diep-io_300x250"
    ];

    // Remove each selected element
    selectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.remove();
        }
    });

    // If all elements have been removed, clear the interval
    if (selectors.every(selector => !document.querySelector(selector))) {
        console.log("Removed all ads, quitting...");
        clearInterval(interval);
    }
}

// Set an interval to check for ads
const interval = setInterval(instant_remove, 100);

//timer for bonus reward
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
    if (totalTime === 0) {
        clearInterval(timer);
        totalTime = 120; // Reset to 2 minutes
        timerDisplay.textContent = "02:00";
    }
}

ad_btn.addEventListener('click', check_ad_state);

function check_ad_state() {
    if (totalTime === 0) {
        resetTimer();
    } else if (totalTime === 120) {
        ad_btn_free = true;
        startTimer();
    } else {
        ad_btn_free = false;
    }
}

//autorespawn

let autorespawn = false;

function respawn() {
    if (toggleButtons.Functional['Auto Respawn']) {
        if (state === "in game") {
            return;
        } else {
            if ((totalTime === 120 || totalTime === 0) && toggleButtons.Functional['Auto Bonus Level']) {
                ad_btn.click();
            } else {
                let spawnbtn = document.getElementById("spawn-button");
                spawnbtn.click();
            }
        }
    }
}

setInterval(respawn, 1000);

//toggle leave game
let ingame_quit_btn = document.getElementById("quick-exit-game");

function check_class() {
    if (toggleButtons.Functional['Toggle Leave Button']) {
        ingame_quit_btn.classList.remove("hidden");
        ingame_quit_btn.classList.add("shown");
    } else {
        ingame_quit_btn.classList.remove("shown");
        ingame_quit_btn.classList.add("hidden");
    }
}

setInterval(check_class, 300);

//score logic
let your_nameFont;
let scoreBoardFont;
let highest_score;
let highest_score_addon;
let highest_score_string;
let is_highest_score_alive;
let scores = {
    millions: 0,
    thousands: 0,
    lessThan1k: 0
};

function get_highest_score() {
    if (scores.millions > 0) {
        highest_score = scores.millions;
        highest_score_addon = "m";
    } else if (scores.thousands > 0) {
        highest_score = scores.thousands;
        highest_score_addon = "k";
    } else if (scores.lessThan1k > 0) {
        highest_score = scores.lessThan1k;
    }
}
//getting text information (credits to abc)
let fps;
let ms;
let ms_active = false;
CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
    apply(fillRect, ctx, [text, x, y, ...blah]) {
        if (text.endsWith('FPS')) {
            fps = text.split(' ')[0];
        }
        if (text.includes(' ms ')) {
            ms = text.split(' ')[0];
            ms_active = true;
        }
        fillRect.call(ctx, text, x, y, ...blah);
    }
});

CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
    apply(fillRect, ctx, [text, x, y, ...blah]) {
        const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string)
        if (text.startsWith('Lvl ')) {
            player.level = parseFloat(text.split(' ')[1]);
                console.log(`
                 1 ${text.split(' ')}
                 2 ${text.split(' ').slice(2)}
                 3 ${text.split(' ').slice(2).join(" ")}
                 4 ${text.split(' ').slice(2).join(" ").trim()}
                `);
                player.tank = text.split(' ').slice(2).join(" ").trim();
        } else if (text === player.name) {
            your_nameFont = ctx.font;
        } else if (text === " - ") {
            scoreBoardFont = ctx.font
        } else if (isNumeric(text) && ctx.font === scoreBoardFont) {
            scores.lessThan1k = parseFloat(text);
        } else if (text.includes('.') && text.includes('k') && ctx.font === scoreBoardFont) {
            if (parseFloat(text.split('k')[0]) > scores.thousands) {
                scores.thousands = parseFloat(text.split('k')[0]);
            }
        } else if (text.includes('.') && text.includes('m') && ctx.font === scoreBoardFont) {
            if (parseFloat(text.split('m')[0]) > scores.millions) {
                scores.millions = parseFloat(text.split('m')[0]);
            }
        }

        get_highest_score();
        if (highest_score != null) {
            if (highest_score_addon != null) {
                highest_score_string = `${highest_score}${highest_score_addon}`;
            } else {
                highest_score_string = `${highest_score}`;
            }
            if (text === highest_score_string && toggleButtons.Visual['Highlight Leader Score']) {
                ctx.fillStyle = "orange";
            }
        }
        fillRect.call(ctx, text, x, y, ...blah);
    }
});

//getting Info
let position_on_minimap = '';

function get_info() {
    if (!toggleButtons.Visual['Toggle Minimap']) {
        new_notification("Enabled Minimap for it to work properly. To turn it off, go to Visual -> Minimap", rgbToNumber(...notification_rbgs.normal), 5000);
        new_notification("please click again", rgbToNumber(...notification_rbgs.normal), 5000);
        toggleButtons.Visual['Toggle Minimap'] = true;
    }
    let links = get_links(get_gamemode(), get_your_lobby());
    let final_links_arr = [];
    let final_links_str = '';
    for (let i = 0; i < links.length; i++) {
        final_links_arr.push(`${links[i][0]}: ${links[i][1]}`);
    }
    for (let i = 0; i < final_links_arr.length; i++) {
        final_links_str = final_links_str + "\n" + final_links_arr[i];
    }
    if (region != null && gamemode != null && highest_score != null) {
        navigator.clipboard.writeText(`🌐Region: ${region}
🎮Mode: ${gamemode}
👑Leader: ${highest_score}${highest_score_addon}
${final_links_str}`);
        new_notification("copied!", rgbToNumber(...notification_rbgs.normal), 5000);
    }
}

/* old method
function get_info() {
    if (!toggleButtons.Visual['Toggle Minimap']) {
       new_notification("Enabled Minimap for it to work properly. To turn it off, go to Visual -> Minimap", rgbToNumber(...notification_rbgs.normal), 5000);
       new_notification("please click again", rgbToNumber(...notification_rbgs.normal), 5000);
       toggleButtons.Visual['Toggle Minimap'] = true;
    }
    let link = "https://diep.io/?p=" + window.__common__.party_link;
    let team = document.querySelector("#copy-party-link").classList[1];
    console.log(`link: ${link}
    team: ${team}
    position_on_minimap: ${position_on_minimap}
    gamemode: ${gamemode}
    Leader: ${highest_score}${highest_score_addon}`);
        switch (team){
            case "red":
                team = '🔴';
                break
            case "blue":
                team = '🔵';
                break
            case "green":
                team = '🟢';
                break
            case "purple":
                team = '🟣';
                break
        }
    if (region != null && gamemode != null && highest_score != null) {
        navigator.clipboard.writeText(`🌐Region: ${region}
🎮Mode: ${gamemode}
👑Leader: ${highest_score}${highest_score_addon}
${team}Link: ${link}`);
    }
}
*/
//display level
const pointsNeeded = new Uint16Array([
    0, 4, 13, 28, 50, 78, 113, 157, 211, 275,
    350, 437, 538, 655, 787, 938, 1109, 1301,
    1516, 1757, 2026, 2325, 2658, 3026, 3433,
    3883, 4379, 4925, 5525, 6184, 6907, 7698,
    8537, 9426, 10368, 11367, 12426, 13549,
    14739, 16000, 17337, 18754, 20256, 21849,
    23536
]);

const crx = CanvasRenderingContext2D.prototype;
crx.fillText = new Proxy(crx.fillText, {
    apply: function(f, _this, args) {
        if (scoreBoardFont != null && toggleButtons.Functional['Toggle Level Seeker']) {
            const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);
            if (_this.font != scoreBoardFont) {
                if (isNumeric(args[0])) {
                    for (let i = 0; i < 16; i++) {
                        if (parseFloat(args[0]) < pointsNeeded[i]) {
                            args[0] = `L: ${i}`;
                        }
                    }
                } else if (args[0].includes('.')) {
                    if (args[0].includes('k')) {
                        for (let i = 16; i < 45; i++) {
                            if (parseFloat(args[0].split('k')[0]) * 1000 < pointsNeeded[i]) {
                                args[0] = `L: ${i}`;
                            }
                        }
                        if (parseFloat(args[0].split('k')[0]) * 1000 > pointsNeeded[44]) {
                            args[0] = `L: 45`;
                        }
                    } else if (args[0].includes('m')) {
                        args[0] = `L: 45`;
                    }
                }
            }
        }
        f.apply(_this, args);
    }
});
crx.strokeText = new Proxy(crx.strokeText, {
    apply: function(f, _this, args) {
        if (scoreBoardFont != null && toggleButtons.Functional['Toggle Level Seeker']) {
            const isNumeric = (string) => /^[+-]?\d+(\.\d+)?$/.test(string);
            if (_this.font != scoreBoardFont) {
                if (isNumeric(args[0])) {
                    for (let i = 0; i < 16; i++) {
                        if (parseFloat(args[0]) < pointsNeeded[i]) {
                            args[0] = `L: ${i}`;
                        }
                    }
                } else if (args[0].includes('.')) {
                    if (args[0].includes('k')) {
                        for (let i = 16; i < 45; i++) {
                            if (parseFloat(args[0].split('k')[0]) * 1000 < pointsNeeded[i]) {
                                args[0] = `L: ${i}`;
                            }
                        }
                        if (parseFloat(args[0].split('k')[0]) * 1000 > pointsNeeded[44]) {
                            args[0] = `L: 45`;
                        }
                    } else if (args[0].includes('m')) {
                        args[0] = `L: 45`;
                    }
                }
            }
        }
        f.apply(_this, args);
    }
});

//Detect AutoFire/AutoSpin
let auto_fire = false;
let auto_spin = false;

function f_s(f_or_s) {
    switch (f_or_s) {
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
canvas         -> window            = a/(canvas.width/window.innerWidth) -> b
window         -> canvas            = a*(canvas.width/window.innerWidth) -> b
windowScaling  -> window            = ( a*windowScaling() )/(canvas.width/window.innerWidth) -> b
windowScaling  -> canvas            = a*windowScaling() - > b
diepUnits      -> canvas            = a/scalingFactor -> b
diepUnits      -> window            = ( a/scalingFactor )/(canvas.width/window.innerWidth) -> b
window         -> diepUnits         = ( a*scalingFactor )*(canvas.width/window.innerWidth) -> b
canvas         -> diepUnits         = a*scalingFactor -> b
window         -> windowScaling()   = ( a*windowScaling() )*(canvas.width/window.innerWidth) -> b
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

Known Bugs:

- when enabling Level Seeker and pressing L, the ms gets replaced as well

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

let ripsaw_radius;
let fieldFactor = 1.0;
let found = false;
let loltank;
let lolztank;
let diepUnits = 53 * (1.01 ** (player.level - 1));
let FOV = (0.55 * fieldFactor) / Math.pow(1.01, (player.level - 1) / 2);
let legit_FOV;
let change_FOV_request = false;
let scalingFactor = FOV * windowScaling();
const fieldFactors = [
    {
        tank: "Sniper",
        factor: 0.899
    },
    {
        tank: "Overseer",
        factor: 0.899
    },
    {
        tank: "Overlord",
        factor: 0.899
    },
    {
        tank: "Assassin",
        factor: 0.8
    },
    {
        tank: "Necromancer",
        factor: 0.899
    },
    {
        tank: "Hunter",
        factor: 0.85
    },
    {
        tank: "Stalker",
        factor: 0.8
    },
    {
        tank: "Ranger",
        factor: 0.699
    },
    {
        tank: "Manager",
        factor: 0.899
    },
    {
        tank: "Predator",
        factor: 0.85
    },
    {
        tank: "Trapper",
        factor: 0.899
    },
    {
        tank: "Gunner Trapper",
        factor: 0.899
    },
    {
        tank: "Overtrapper",
        factor: 0.899
    },
    {
        tank: "MegaTrapper",
        factor: 0.899
    },
    {
        tank: "Tri-Trapper",
        factor: 0.899
    },
    {
        tank: "Smasher",
        factor: 0.899
    },
    {
        tank: "Landmine",
        factor: 0.899
    },
    {
        tank: "Streamliner",
        factor: 0.85
    },
    {
        tank: "Auto Trapper",
        factor: 0.899
    },
    {
        tank: "Battleship",
        factor: 0.899
    },
    {
        tank: "Auto Smasher",
        factor: 0.899
    },
    {
        tank: "Spike",
        factor: 0.899
    },
    {
        tank: "Factory",
        factor: 0.899
    },
    {
        tank: "Skimmer",
        factor: 0.899
    },
    {
        tank: "Glider",
        factor: 0.899
    },
    {
        tank: "Rocketeer",
        factor: 0.899
    },
]

//let's actually implement these:
function canvas_2_window(a){
    let b = a/(canvas.width/window.innerWidth);
    return b;
}

function window_2_canvas(a){
    let b = a * (canvas.width/window.innerWidth);
    return b;
}

function windowScaling_2_window(a){
    let b = (windowScaling_2_canvas(a) ) / (canvas.width/window.innerWidth);
    return b;
}

function windowScaling_2_canvas(a){
    let b = a*windowScaling();
    return b;
}

function diepUnits_2_canvas(a){
    let b = a/scalingFactor;
    return b;
}

function diepUnits_2_window(a){
    let b = (diepUnits_2_canvas(a))/(canvas.width/window.innerWidth);
    return b;
}

function window_2_diepUnits(a){
    let b = ( canvas_2_diepUnits(a) )*(canvas.width/window.innerWidth);
    return b;
}

function canvas_2_diepUnits(a){
    let b = a * scalingFactor;
    return b;
}

function window_2_windowScaling(a){
    let b = ( canvas_2_windowScaling(a) )*(canvas.width/window.innerWidth);
    return b;
}

function canvas_2_windowScaling(a){
    let b = a*windowScaling();
    return b;
}

function diepUnits_2_windowScaling(a){
    let b = ( diepUnits_2_canvas(a) ) * fieldFactor;
    return b;
}

function windowScaling_2_diepUntis(a){
    let b = ( a/fieldFactor ) * scalingFactor;
    return b;
}
//

function check_FOV_requests() {
    if (script_list.fov) {
        if (toggleButtons.Addons['FOV changer']) {
            change_FOV_request = true;
            change_FOV(FOVindex);
        } else {
            change_FOV_request = false;
            change_FOV();
        }
    }
}

setInterval(check_FOV_requests, 500);

function calculateFOV(Fv, l) {
    let dpr = 1;
    if(window.dpr){
        dpr = window.dpr;
    }
    const numerator = 0.55 * Fv;
    const denominator = Math.pow(1.01, (l - 1) / 2);
    legit_FOV = numerator / denominator;
    window.legit_FOV = legit_FOV;
    let l1 = new_FOVs.length;
    for (let i = 0; i < l1; i++) {
        if (new_FOVs[i].name != 'Background') {
            new_FOVs[i].FOV = ((0.55 * new_FOVs[i].fieldFactor) / (Math.pow(1.01, (l - 1) / 2)));
        } else {
            new_FOVs[i].FOV = 0.3499999940395355;
        }
    }
    if (typeof window.HEAPF32 !== 'undefined' && typeof window.fov !== 'undefined' && window.fov.length > 0 && !window.legit_request) {
        //use this part, if you have a fov script that can share it's fov value with you
        FOV = HEAPF32[fov[0]] * dpr;
    } else {
        //use this part if you have no fov script
        FOV = legit_FOV * dpr;
    }
    return FOV;
}

function change_FOV(index) {
    for (const fov of window.fov) {
        if (change_FOV_request && !window.legit_request) {
            if (index === 0) {
                window.HEAPF32[fov] = new_FOVs[index].FOV;
            }
            window.HEAPF32[fov] = new_FOVs[index].FOV;
        } else {
            window.HEAPF32[fov] = legit_FOV;
        }
    }
}

function apply_values(FF) {
    calculateFOV(FF, player.level);
    scalingFactor = FOV * windowScaling();
    ripsaw_radius = diepUnits * scalingFactor;
    diepUnits = 53 * (1.01 ** (player.level - 1));
}

function apply_changes(value) {
    if (found) {
        fieldFactor = fieldFactors[value].factor;
        loltank = player.tank;
        player.last_level = player.level;
        apply_values(fieldFactor);
    } else {
        if (value === null) {
            fieldFactor = 1.0;
            loltank = "default";
            lolztank = player.tank;
            player.last_level = player.level;
            apply_values(fieldFactor);
        }
    }
}

function bruteforce_tanks() {
    let l = fieldFactors.length;
    for (let i = 0; i < l; i++) {
        if (player.tank.includes(fieldFactors[i].tank)) {
            found = true;
            //console.log("FOUND TANK " + fieldFactors[i].tank);
            apply_changes(i);
            break;
        } else {
            found = false;
            if (i < l - 1) {
                /*
                console.log(`checking tank ${i}`);
            } else {
                console.log("Tank set to default or not found")
                */
                apply_changes(null);
            }
        }
    }
}

window.addEventListener("resize", bruteforce_tanks);

function check_lvl_change() {
    if (player.last_level != player.level) {
        bruteforce_tanks();
    }
}

function check_change() {
    check_lvl_change();
    if (loltank != player.tank) {
        if (loltank === "default") {
            if (lolztank != player.tank) {
                bruteforce_tanks();
            } else {
                return;
            }
        } else {
            bruteforce_tanks();
        }
    }
}

setInterval(check_change, 250);

// search tree function
function findTankAndParent(tree, id, parent = null, grandparent = null) {
    for (const [key, value] of Object.entries(tree)) {
        const currentParent = key === "skip" ? parent : Number(key);

        // Match for direct keys
        if (Number(key) === id) {
            return { id, parent };
        }

        // Match for arrays
        if (Array.isArray(value) && value.includes(id)) {
            return { id, parent: currentParent };
        }

        // Special handling for "skip" keys
        if (key === "skip") {
            if (typeof value === "object") {
                // Recursively search within "skip" tree
                const result = findTankAndParent(value, id, parent, grandparent);
                if (result) return result;
            } else if (value === id) {
                return { id, parent: grandparent }; // Use grandparent for direct "skip" match
            }
        }

        // Nested object traversal
        if (typeof value === "object" && value !== null) {
            const result = findTankAndParent(value, id, currentParent, parent);
            if (result) {
                return result;
            }
        }
    }
    return null;
}


// TANK IDS TREE
const tanks_tree = {
    0: {
        1: {
            3: [2, 14, 42],
            4: [5, 40],
            13: [18, 48],
        },
        6: {
            15: [21, 22],
            11: [12, 17, 26, 33, 48, 52],
            19: [28, 43],
            31: [32, 33, 34, 35, 44],
        },
        7: {
            skip: 29,
            10: [25, 49, 54, 55, 56],
            20: [32, 39, 43],
        },
        8: {
            4: [5, 40],
            9: [23, 24],
            13: [18, 48],
            41: [39, 40],
        },
        skip: {
            36: [38, 50, 51],
        },
    },
};

let tank_box_nums = [
    ["Twin", 0],
    ["Sniper", 1],
    ["Machine Gun", 2],
    ["Flank Guard", 3],
    ["Smasher", 4],
    ["Triple Shot", 0],
    ["Quad Tank", 1],
    ["Twin Flank", 2],
    ["Assassin", 0],
    ["Overseer", 1],
    ["Hunter", 2],
    ["Trapper", 3],
    ["Destroyer", 0],
    ["Gunner", 1],
    ["Sprayer", 2],
    ["Tri-Angle", 0],
    ["Quad Tank", 1],
    ["Twin Flank", 2],
    ["Auto 3", 3],
    ["Landmine", 0],
    ["Auto Smasher", 1],
    ["Spike", 2],
    ["Triplet", 0],
    ["Penta Shot", 1],
    ["Spread Shot", 2],
    ["Octo Tank", 0],
    ["Auto 5", {cond:"Auto 3", num:0}, {cond: "Quad Tank", num: 1}],
    ["Triple Twin", 0],
    ["Battle Ship", 1],
    ["Ranger", 0],
    ["Stalker", 1],
    ["Overlord", 0],
    ["Necromancer", 1],
    ["Manager", 2],
    ["Overtrapper", 3],
    ["Battleship", 4],
    ["Factory", 5],
    ["Predator", 0],
    ["Streamliner", {cond: "Hunter", num:1}, {cond: "Gunner", num:2}],
    ["Tri-Trapper", 0],
    ["Gunner Trapper", 1],
    ["Overtrapper", 2],
    ["Mega Trapper", 3],
    ["Auto Trapper", 4],
    ["Hybrid", 0],
    ["Annihilator", 1],
    ["Skimmer", 2],
    ["Rocketeer", 3],
    ["Glider", 4],
    ["Auto Gunner", {cond: "Gunner", num: 0}, {cond: "Auto 3", num: 1}],
    ["Booster", 0],
    ["Fighter", 1],
    ["Landmine", 0],
    ["Auto Smasher", 1],
    ["Spike", 2],
];

function convert_id_name(type, value) {
    const tank = window.__common__.tanks.find(
        type === "id to name"
            ? (tank) => tank.id === value
            : (tank) => tank.name === value
    );

    if (!tank) {
        console.error(`Tank not found for ${type}: ${value}`);
        return null;
    }

    return type === "id to name" ? tank.name : tank.id;
}


function find_upgrade_cond(tank_name) {
    const target_id = convert_id_name("name to id", tank_name);
    if (!target_id) {
        console.error("Target ID not found");
        return null;
    }

    console.log(`Target ID for ${tank_name}: ${target_id}`);

    const tree_result = findTankAndParent(tanks_tree, target_id);
    if (!tree_result) {
        console.error(`Tank not found in tree for ID: ${target_id}`);
        return null;
    }

    const cond_id = tree_result.parent;

    const cond_name = convert_id_name("id to name", cond_id);
    if (!cond_name) {
        console.error("Condition name not found");
        return null;
    }

    return cond_name;
}

function get_full_path(Tank){
    let current_tank = Tank;
    let temp_arr = [];
    temp_arr.push(Tank);
    while(find_upgrade_cond(current_tank) != null){
        current_tank = find_upgrade_cond(current_tank);
        temp_arr.push(current_tank);
    }
    temp_arr.reverse();
    return temp_arr;
}

function auto_upgrade(Tank){
    if(player.tank === Tank){
        console.log("you are already that tank");
        return;
    }
    let temp_arr = get_full_path(Tank);
    let l = temp_arr.length;
    let bool = false;
    for(let i = 0; i < l; i++){
      if(player.tank === temp_arr[i] && i != l){
          console.log(`upgrading to ${temp_arr[i+1]}`);
          handle_tank_upgrades(temp_arr[i+1]);
          bool = true;
          break;
      }
    }
    !bool?console.warn("something went wrong"):null;
}

function handle_tank_upgrades(Tank){
    if(player.tank === Tank){
        return;
    }
    let l = tank_box_nums.length;
    let temp_arr = [];
    let cond_num = -1;
    for(let i = 0; i < l; i++){
        let target = tank_box_nums[i];
        if(target[0] === Tank){
            temp_arr = tank_box_nums[i];
            break
        }
    }
    switch(true){
        case temp_arr.length === 2:
            cond_num = temp_arr[1];
            break
        case temp_arr.length > 2:
            for(let j = 1; j < temp_arr.length; j++){
                if(player.tank === temp_arr[j].cond){
                    cond_num = temp_arr[j].num;
                }
            }
            break
        default:
            console.warn("temp_arr in illegal state, quitting...");
            return
    }
    window.upgrading = true;
    upgrade(boxes[cond_num].color);
}

let test_tank = "Auto Gunner";

function upgrade_func(){
    if(state === "in game" && player.tank != test_tank && toggleButtons.Mouse["Upgrade to Auto Gunner"]){
        auto_upgrade(test_tank);
    }else{
        window.upgrading = false;
    }
}

setInterval(upgrade_func, 100);

//canvas gui
let offsetX = 0;
let offsetY = 0;
//for canvas text height and space between it
let text_startingY = canvas_2_windowScaling(450);
let textAdd = canvas_2_windowScaling(25);
let selected_box = null;
let _bp = { //box parameters
    startX: 47,
    startY: 67,
    distX: 13,
    distY: 9,
    width: 86,
    height: 86,
    outer_xy: 2
}

let _bo = { //box offsets
    offsetX: _bp.width + (_bp.outer_xy * 2) + _bp.distX,
    offsetY: _bp.height + (_bp.outer_xy * 2) + _bp.distY
}

function step_offset(steps, offset){
    let final_offset = 0;
    switch(offset){
        case "x":
            final_offset = _bp.startX + (steps * _bo.offsetX);
            break
        case "y":
            final_offset = _bp.startY + (steps * _bo.offsetY);
            break
    }
    return final_offset;
}

const boxes = [
    {
        color: "lightblue",
        LUcornerX: _bp.startX,
        LUcornerY: _bp.startY
    },
    {
        color: "green",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY
    },
    {
        color: "red",
        LUcornerX: _bp.startX,
        LUcornerY: _bp.startY + _bo.offsetY
    },
    {
        color: "yellow",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY + _bo.offsetY
    },
    {
        color: "blue",
        LUcornerX: _bp.startX,
        LUcornerY: step_offset(2, "y")
    },
    {
        color: "rainbow",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: step_offset(2, "y")
    }
]

//new upgrading Tank logic
function upgrade_get_coords(color){
    let l = boxes.length;
    let upgrade_coords = {x: "not defined", y: "not defined"};
    for(let i = 0; i < l; i++){
        if(boxes[i].color === color){
            upgrade_coords.x = windowScaling_2_window(boxes[i].LUcornerX + (_bp.width/2));
            upgrade_coords.y = windowScaling_2_window(boxes[i].LUcornerY + (_bp.height/2));
        }
    }
    return upgrade_coords;
}

function get_invert_mouse_coords(){
    let _x = coords.x;
    let _y = coords.y;
    let center = {x: window.innerWidth/2, y: window.innerHeight/2};
    let d = {x: _x-center.x, y: _y-center.y};
    let inverted_coords = {x: center.x-d.x, y: center.y-d.y};
    return inverted_coords;
}

let inverted = false;

function invert_mouse(){
    window.requestAnimationFrame(invert_mouse);
    if(!connected){
        return;
    }
    if((toggleButtons.Mouse["Anti Aim"] || toggleButtons.Mouse["Freeze Mouse"]) && !toggleButtons.Mouse["Sandbox Hacks"]){
        return;
    }
    if(!inverted){
        mouse_move(coords.x, coords.y);
        return;
    }
    let new_coords = get_invert_mouse_coords();
    freezeMouseMove();
    mouse_move(new_coords.x, new_coords.y);
}
window.requestAnimationFrame(invert_mouse);

function handle_sandbox_checks(){
     if(toggleButtons.Mouse["Sandbox Hacks"]){
        if(gamemode != "Sandbox"){
            one_time_notification("To use sandbox hacks, switch to a sandbox server", rgbToNumber(...notification_rbgs.warning), 2500);
            return;
        }
        if(input.get_convar("ren_upgrades") != 'true'){
            input.set_convar("ren_upgrades", 'true');
            one_time_notification(`force enabled ren_upgrades for the script`, rgbToNumber(...notification_rbgs.require), 2500);
        }
        triflank = true;
        one_time_notification(`To start, upgrade to ${sandbox_hax_modes[sandbox_hax_index].tank}`, rgbToNumber(...notification_rbgs.normal), 2500);
    }else{
        triflank = false;
    }
}

function smart_shgun(){
    handle_sandbox_checks();
    if(triflank && sandbox_hax_modes[sandbox_hax_index].name === "Shotgun"){
        shotgun(sandbox_hax_index);
    }
}
setInterval(smart_shgun, 0);

function smart_trap(){
    handle_sandbox_checks();
    if(triflank && sandbox_hax_modes[sandbox_hax_index].name === "Trap Flip"){
        one_time_notification("Warning! Trap Flip uses flip fire, which might be incosistent on laggy servers", rgbToNumber(...notification_rbgs.warning), 2500);
        flip_trap1(sandbox_hax_index);
    }else{
        inverted?inverted = false: null;
    }
}

setInterval(smart_trap, 250);

function smart_triflank(){
    handle_sandbox_checks();
    if(triflank && !sandbox_hax_modes[sandbox_hax_index].unique){
        sandbox_hax_loop(sandbox_hax_index);
    }
}

setInterval(smart_triflank, 200);

function is_between(Tank){
    //USE FOR SANDBOX ONLY
    let start = find_upgrade_cond(Tank);
    let end = Tank;
    let interval = [convert_id_name("name to id", start), convert_id_name("name to id", end)];
    let ids = [];
    for(let i = interval[1]; i >= interval[0]; i--){
        let name = convert_id_name("id to name", i);
        ids.push(name);
    }
    return ids.includes(player.tank);
}

function sandbox_hax_loop(i){
    if(player.tank === find_upgrade_cond(sandbox_hax_modes[i].tank)){
        //auto_spin?null:key_press("KeyC", 100 * multiplier);
        //auto_spin = !auto_spin;
        setTimeout(() => {
        upgrade(sandbox_hax_modes[i].color, 0, 0, 0);
        }, 100);
        setTimeout(() => {
        mouse_move(coords.x, coords.y);
        }, 100);
    }else if(is_between(sandbox_hax_modes[i].tank)){
        //auto_spin?key_press("KeyC", 250 * multiplier):null;
        //auto_spin = !auto_spin;
        key_press("Backslash", 100);
    }
}

function flip_trap1(i){
    if(player.tank === find_upgrade_cond(sandbox_hax_modes[i].tank)){
        setTimeout(() => {
        inverted = true;
        }, 200);
        setTimeout(() => {
        upgrade(sandbox_hax_modes[i].color, 0, 0, 0);
        }, 250);
    }else if(is_between(sandbox_hax_modes[i].tank)){
        setTimeout(() => {
        inverted = false;
        }, 50);
        setTimeout(() => {
        key_press("Backslash");
        }, 75);
    }
}

function shotgun(i){
    console.log(sandbox_hax_modes[i].tank);
    if(player.tank === find_upgrade_cond(sandbox_hax_modes[i].tank[0]) || player.tank === find_upgrade_cond(sandbox_hax_modes[i].tank[1])){
        upgrade(sandbox_hax_modes[i].color, 0, 0, 0);
        mouse_move(coords.x, coords.y);
//    }else if(is_between(sandbox_hax_modes[i].tank[1])){
    }else if(player.tank === sandbox_hax_modes[i].tank[1]){
        key_press("Backslash", 0);
    }
}

function upgrade(color, delay = 100, cdelay1, cdelay2){
    let u_coords = upgrade_get_coords(color);
    ghost_click_at(u_coords.x, u_coords.y, cdelay1, cdelay2);
}

function ctx_text(fcolor, scolor, lineWidth, font, text, textX, textY) {
    ctx.fillStyle = fcolor;
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    ctx.strokeStyle = scolor;
    ctx.strokeText(`${text}`, textX, textY)
    ctx.fillText(`${text}`, textX, textY)
}

function ctx_rect(x, y, a, b, c) {
    ctx.beginPath();
    ctx.strokeStyle = c;
    ctx.strokeRect(x, y, a, b);
}

//use this for game entities
function dot_in_diepunits(diepunits_X, diepunits_Y) {
    ctx_arc(diepunits_X * scalingFactor, diepunits_Y * scalingFactor, 5, 0, 2 * Math.PI, false, "lightblue");
}

function circle_in_diepunits(diepunits_X, diepunits_Y, diepunits_R, c) {
    ctx.beginPath();
    ctx.arc(diepunits_X * scalingFactor, diepunits_Y * scalingFactor, diepunits_R * scalingFactor, 0, 2 * Math.PI, false);
    ctx.strokeStyle = c;
    ctx.stroke();
}

function big_half_circle(diepunits_X, diepunits_Y, diepunits_R, c) {
    let centerY = diepunits_Y * scalingFactor;
    let centerX = diepunits_X * scalingFactor;
    let angle = Math.atan2(coords.y - centerY, coords.x - centerX);
    ctx.beginPath();
    ctx.arc(centerX, centerY, diepunits_R * scalingFactor, angle - Math.PI / 2, angle + Math.PI / 2, false);
    ctx.strokeStyle = c;
    ctx.stroke();
}

function small_half_circle(diepunits_X, diepunits_Y, diepunits_R, c) {
    let centerY = diepunits_Y * scalingFactor;
    let centerX = diepunits_X * scalingFactor;
    let angle = Math.atan2(coords.y - centerY, coords.x - centerX);
    ctx.beginPath();
    ctx.arc(centerX, centerY, diepunits_R * scalingFactor, angle + Math.PI / 2, angle - Math.PI / 2, false);
    ctx.strokeStyle = c;
    ctx.stroke();
}

//use this for ui elements like upgrades or scoreboard
function dot_in_diepunits_FOVless(diepunits_X, diepunits_Y) {
    ctx_arc(canvas_2_windowScaling(diepunits_X), canvas_2_windowScaling(diepunits_Y), 5, 0, 2 * Math.PI, false, "lightblue");
}

function grid_rect(x, y, a, b, color) {
    ctx.beginPath();
    ctx.rect(canvas_2_windowScaling(x), canvas_2_windowScaling(y), canvas_2_windowScaling(a), canvas_2_windowScaling(b));
    ctx.strokeStyle = color;
    ctx.stroke();
}

function draw_upgrade_grid() {
    let box = {width: 86, height: 86}; //in windowScaling
    let l = boxes.length;
    for (let i = 0; i < l; i++) {
        let start_x = windowScaling_2_window(boxes[i].LUcornerX);
        let start_y = windowScaling_2_window(boxes[i].LUcornerY);
        let end_x = windowScaling_2_window(boxes[i].LUcornerX + box.width);
        let end_y = windowScaling_2_window(boxes[i].LUcornerY + box.height);
        let temp_color = "black";
        if (coords.x > start_x && coords.y > start_y && coords.x < end_x && coords.y < end_y) {
            temp_color = "red";
            selected_box = i;
        } else {
            temp_color = "black";
            selected_box = null;
        }
        grid_rect(boxes[i].LUcornerX, boxes[i].LUcornerY, 86, 86, temp_color);
    }
    for (let i = 0; i < l; i++) {
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX + box.width/2, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX + box.width, boxes[i].LUcornerY);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX + box.width, boxes[i].LUcornerY + box.height/2);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX + box.width, boxes[i].LUcornerY + box.height);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY + box.height/2);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX, boxes[i].LUcornerY + box.height);
        dot_in_diepunits_FOVless(boxes[i].LUcornerX + box.width, boxes[i].LUcornerY + box.height/2);
    }
}

const gradients = ["#94b3d0", "#96b0c7", "#778daa", "#4c7299", "#52596c", "#19254e", "#2d445f", "#172631"];
const tank_group1 = ["Trapper", "Overtrapper", "Mega Trapper", "Tri-Trapper"]; //Traps only
const tank_group2 = ["Tank", "Twin", "Triple Shot", "Spread Shot", "Penta Shot", "Machine Gun", "Sprayer", "Triplet"]; //constant bullets [initial speed = 0.699]
const tank_group2round = ["Twin Flank", "Triple Twin", "Quad Tank", "OctoT ank", "Flank Guard"];
const tank_group3 = ["Gunner Trapper"]; //Traps AND constant bullets
const tank_group4 = ["Fighter", "Booster", "Tri-Angle"]; // fast tanks
const tank_group5 = ["Sniper", "Assassin", "Stalker", "Ranger"]; //sniper+ bullets
const tank_group6 = ["Destroyer", "Hybrid", "Annihilator"]; //slower bullets [intitial speed = 0.699]
//const tank_group7 = ["Overseer", "Overlord", "Manager", "Necromancer"]; //infinite bullets(drones)     (UNFINISHED)
const tank_group8 = ["Factory"]; //drones with spreading abilities
const tank_group9 = ["Battleship"]; //special case
const tank_group10 = ["Streamliner"]; // special case
const tank_group11 = ["Gunner", "AutoGunner"] //                                                         (UNFINISHED)

//get bullet speed
function count_fours(string) {
    let fours_count = 0;
    let temp_array = [...string];
    for (let i = 0; i < temp_array.length; i++) {
        if (temp_array[i] === "4") {
            fours_count++;
        }
    }
    return fours_count;
}

function draw_cirle_radius_for_tank() {
    let b_s;
    if (diep_data.length > 0) {
        player.raw_build = diep_data[0][1];
        player.real_time_build = real_build(player.raw_build);
        b_s = count_fours(player.real_time_build);
    } else {
        b_s = 0;
    }

    if (tank_group1.includes(player.tank)) {
        circle_in_diepunits(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 485 + (52.5 * b_s), gradients[b_s]);
    } else if (tank_group2.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1850 + (210 * b_s), gradients[b_s]);
    } else if (tank_group2round.includes(player.tank)) {
        circle_in_diepunits(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1850 + (210 * b_s), gradients[b_s]);
    } else if (tank_group3.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1850 + (210 * b_s), gradients[b_s]);
        small_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 485 + (52.5 * b_s), gradients[b_s]);
    } else if (tank_group4.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1850 + (210 * b_s), gradients[b_s]);
        small_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1135 + (100 * b_s), gradients[b_s]);
    } else if (tank_group5.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 2680 + (350 * b_s), gradients[b_s]);
    } else if (tank_group6.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1443.21 + (146.79 * b_s), gradients[b_s]);
        /*
   }else if(tank_group7.includes(player.tank)){
        circle_in_diepunits( canvas.width/2/scalingFactor , canvas.height/2/scalingFactor, 1607 + (145*b_s), gradients[b_s]);
        circle_in_diepunits( coords.x*2/scalingFactor , coords.y*2/scalingFactor, 1607 + (145*i), gradients[b_s]);
         */
    } else if (tank_group8.includes(player.tank)) {
        if (!auto_fire) {
            circle_in_diepunits(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 200, gradients[0]);
        } else {
            circle_in_diepunits(coords.x * two / scalingFactor, coords.y * two / scalingFactor, 800, gradients[1]);
            circle_in_diepunits(coords.x * two / scalingFactor, coords.y * two / scalingFactor, 900, gradients[2]);
        }
    } else if (tank_group9.includes(player.tank)) {
        circle_in_diepunits(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1640 + (210 * b_s), gradients[b_s]);
    } else if (tank_group10.includes(player.tank)) {
        big_half_circle(canvas.width / 2 / scalingFactor, canvas.height / 2 / scalingFactor, 1750 + (190 * b_s), gradients[b_s]);
    } else {
        return;
    }

}

//let's calculate the angle
var vector_l = [null, null];
var angle_l = 0;

function calc_leader() {
    if (script_list.minimap_leader_v1) {
        let xc = canvas.width / 2;
        let yc = canvas.height / 2;
        vector_l[0] = window.l_arrow.xl - xc;
        vector_l[1] = window.l_arrow.yl - yc;
        angle_l = Math.atan2(vector_l[1], vector_l[0]) * (180 / Math.PI);
    } else if (script_list.minimap_leader_v2) {
        let xc = canvas.width / 2;
        let yc = canvas.height / 2;
        vector_l[0] = window.L_X - xc;
        vector_l[1] = window.L_Y - yc;
        angle_l = Math.atan2(vector_l[1], vector_l[0]) * (180 / Math.PI);
    } else {
        console.log("waiting for leader script to give us values");
    }
}

// Minimap logic
var minimap_elements = [
    {
        name: "minimap",
        x: 177.5,
        y: 177.5,
        width: 162.5,
        height: 162.5,
        color: "purple"
    },
    {
        name: "2 Teams Blue Team",
        x: 177.5,
        y: 177.5,
        width: 17.5,
        height: 162.5,
        color: "blue"
    },
    {
        name: "2 Teams Blue Team zone",
        x: 160.0,
        y: 177.5,
        width: 17.5,
        height: 162.5,
        color: "SlateBlue"
    },
    {
        name: "2 Teams Red Team",
        x: 32.5,
        y: 177.5,
        width: 17.5,
        height: 162.5,
        color: "red"
    },
    {
        name: "2 Teams Red Team zone",
        x: 50,
        y: 177.5,
        width: 17.5,
        height: 162.5,
        color: "orangeRed"
    },
    {
        name: "4 Teams Blue Team",
        x: 177.5,
        y: 177.5,
        width: 25,
        height: 25,
        color: "blue"
    },
    {
        name: "4 Teams Blue zone",
        x: 177.5,
        y: 177.5,
        width: 40,
        height: 40,
        color: "SlateBlue"
    },
    {
        name: "4 Teams Purple Team",
        x: 40,
        y: 177.5,
        width: 25,
        height: 25,
        color: "purple"
    },
    {
        name: "4 Teams Purple zone",
        x: 55,
        y: 177.5,
        width: 40,
        height: 40,
        color: "Violet"
    },
    {
        name: "4 Teams Green Team",
        x: 177.5,
        y: 40,
        width: 25,
        height: 25,
        color: "green"
    },
    {
        name: "4 Teams Green zone",
        x: 177.5,
        y: 55,
        width: 40,
        height: 40,
        color: "LimeGreen"
    },
    {
        name: "4 Teams Red Team",
        x: 40,
        y: 40,
        width: 25,
        height: 25,
        color: "orangeRed"
    },
    {
        name: "4 Teams Red zone",
        x: 55,
        y: 55,
        width: 40,
        height: 40,
        color: "red"
    },
];

var m_e_ctx_coords = [
    {
        name: "minimap",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "2 Teams Blue Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "2 Teams Blue Team Zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "2 Teams Red Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "2 Teams Red Team Zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Blue Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Blue zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Purple Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Purple zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Green Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Green zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Red Team",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    },
    {
        name: "4 Teams Red zone",
        startx: null,
        stary: null,
        endx: null,
        endy: null
    }
]

function draw_minimap() {
    //console.log('called draw_minimap function');
    let l = minimap_elements.length;
    switch (gamemode) {
        case "2 Teams":
            for (let i = 0; i < 5; i++) {
                if (i === 2 || i === 4) {
                    if (toggleButtons.Functional['Toggle Base Zones']) {
                        updateAndDrawElement(i);
                    }
                } else {
                    updateAndDrawElement(i);
                }
            }
            break;
        case "4 Teams":
            updateAndDrawElement(0);
            for (let i = 5; i < l; i++) {
                if (i === 6 || i === 8 || i === 10 || i === 12) {
                    if (toggleButtons.Functional['Toggle Base Zones']) {
                        updateAndDrawElement(i);
                    }
                } else {
                    updateAndDrawElement(i);
                }
            }
            break;
    }
    if (script_list.minimap_leader_v1 || script_list.minimap_leader_v2) {
        minimap_collision_check();
    }
}

function updateAndDrawElement(index) {
    // Update their real-time position
    //console.log('updateAndDrawElement function called');
    m_e_ctx_coords[index].startx = canvas.width - (minimap_elements[index].x * windowScaling());
    m_e_ctx_coords[index].starty = canvas.height - (minimap_elements[index].y * windowScaling());
    m_e_ctx_coords[index].endx = m_e_ctx_coords[index].startx + minimap_elements[index].width * windowScaling();
    m_e_ctx_coords[index].endy = m_e_ctx_coords[index].starty + minimap_elements[index].height * windowScaling();

    // Draw the element
    if(!toggleButtons.Debug["Toggle Minimap"]){
        //console.log('Debug Minimap is off, quitting...');
        return;
    }
    //console.log('Drawing minimap...');
    ctx.beginPath();
    ctx.rect(m_e_ctx_coords[index].startx, m_e_ctx_coords[index].starty, minimap_elements[index].width * windowScaling(), minimap_elements[index].height * windowScaling());
    ctx.lineWidth = "1";
    ctx.strokeStyle = minimap_elements[index].color;
    ctx.stroke();
}

function minimap_collision_check() {
    //console.log('checking collision...');
    if (script_list.minimap_leader_v1 || script_list.minimap_leader_v2) {
        let x = script_list.minimap_leader_v1 ? window.m_arrow.xl : window.arrows[0][0];
        let y = script_list.minimap_leader_v1 ? window.m_arrow.yl : window.arrows[0][1];
        /*console.log(`
        x: ${x}
        y: ${y}
        `);
        */

        if (m_e_ctx_coords[0].startx < x &&
            m_e_ctx_coords[0].starty < y &&
            m_e_ctx_coords[0].endx > x &&
            m_e_ctx_coords[0].endy > y) {

            if (gamemode === "2 Teams") {
                if (checkWithinBase(1, x, y)) position_on_minimap = "blue base";
                else if (checkWithinBase(2, x, y)) position_on_minimap = "blue drones";
                else if (checkWithinBase(3, x, y)) position_on_minimap = "red base";
                else if (checkWithinBase(4, x, y)) position_on_minimap = "red drones";
                else position_on_minimap = "not in the base";
            } else if (gamemode === "4 Teams") {
                if (checkWithinBase(6, x, y)) {
                    if (checkWithinBase(5, x, y)) {
                        position_on_minimap = "blue base"
                    } else {
                        position_on_minimap = "blue drones";
                    }
                } else if (checkWithinBase(8, x, y)) {
                    if (checkWithinBase(7, x, y)) {
                        position_on_minimap = "purple base"
                    } else {
                        position_on_minimap = "purple drones";
                    }
                } else if (checkWithinBase(10, x, y)) {
                    if (checkWithinBase(9, x, y)) {
                        position_on_minimap = "green base"
                    } else {
                        position_on_minimap = "green drones";
                    }
                } else if (checkWithinBase(12, x, y)) {
                    if (checkWithinBase(11, x, y)) {
                        position_on_minimap = "red base"
                    } else {
                        position_on_minimap = "red drones";
                    }
                } else {
                    position_on_minimap = "not in the base";
                }
            } else {
                position_on_minimap = "Warning! not on minimap";
            }
        }
    }
}

function checkWithinBase(baseIndex, x, y) {
    return m_e_ctx_coords[baseIndex].startx < x &&
        m_e_ctx_coords[baseIndex].starty < y &&
        m_e_ctx_coords[baseIndex].endx > x &&
        m_e_ctx_coords[baseIndex].endy > y;
}

//notify player about entering base zones
let alerted = false;

let team_clrs = ["blue", "red", "purple", "green"];

function alert_about_drones() {
    //console.log(position_on_minimap);
    if (position_on_minimap.includes('drones') && !position_on_minimap.includes(team_clrs[player.team_index])) {
        if (!alerted) {
            new_notification("Warning drones!", rgbToNumber(...notification_rbgs.warning), 2500);
            alerted = true;
        }
    } else {
        alerted = false;
    }
}

//let's try drawing a line to the leader

function apply_vector_on_minimap() {
    if (script_list.minimap_leader_v2) {
        let x = minimapArrow[0];
        let y = minimapArrow[1];
        let thetaRadians = angle_l * (Math.PI / 180);
        let r = m_e_ctx_coords[0].endx - m_e_ctx_coords[0].startx;
        let x2 = x + r * Math.cos(thetaRadians);
        let y2 = y + r * Math.sin(thetaRadians);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

const circle_gradients = [
  "#FF0000", // Red
  "#FF4D00", // Orange Red
  "#FF8000", // Orange
  "#FFB300", // Dark Goldenrod
  "#FFD700", // Gold
  "#FFEA00", // Yellow
  "#D6FF00", // Light Yellow Green
  "#A3FF00", // Yellow Green
  "#6CFF00", // Lime Green
  "#00FF4C", // Medium Spring Green
  "#00FF9D", // Turquoise
  "#00D6FF", // Sky Blue
  "#006CFF", // Blue
  "#0000FF" // Dark Blue
];

function draw_crx_events() {
    //you need either leader arrow or moveTo/lineTo script from h3llside for this part
    if (script_list.moveToLineTo_debug) {
        let l = window.y_and_x.length;
        for (let i = 0; i < l; i++) {
            ctx_arc(window.y_and_x[i][0], window.y_and_x[i][1], 10, 0, 2 * Math.PI, false, circle_gradients[i]);
            ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", i, window.y_and_x[i][0], window.y_and_x[i][1]);
        }
    } else if (script_list.minimap_leader_v1) {
        //ctx_arc(window.l_arrow.xm, window.l_arrow.ym, 15, 0, 2 * Math.PI, false, window.l_arrow.color);
        //ctx_arc(window.m_arrow.xm, window.m_arrow.ym, 1, 0, 2 * Math.PI, false, "yellow");
        ctx_arc(window.l_arrow.xl, window.l_arrow.yl, 5, 0, 2 * Math.PI, false, window.l_arrow.color);
        ctx_arc(window.m_arrow.xl, window.m_arrow.yl, 1, 0, 2 * Math.PI, false, "yellow");
    }
}

//tank aim lines
let TurretRatios = [
    {
        name: "Destroyer",
        ratio: 95 / 71.4,
        color: "red"
    },
    {
        name: "Anni",
        ratio: 95 / 96.6,
        color: "darkred"
    },
    {
        name: "Fighter",
        ratio: 80 / 42,
        color: "orange"
    },
    {
        name: "Booster",
        ratio: 70 / 42,
        color: "green"
    },
    {
        name: "Tank",
        ratio: 95 / 42,
        color: "yellow"
    },
    {
        name: "Sniper",
        ratio: 110 / 42,
        color: "yellow"
    },
    {
        name: "Ranger",
        ratio: 120 / 42,
        color: "orange"
    },
    {
        name: "Hunter",
        ratio: 95 / 56.7,
        color: "orange"
    },
    {
        name: "Predator",
        ratio: 80 / 71.4,
        color: "darkorange"
    },
    {
        name: "Mega Trapper",
        ratio: 60 / 54.6,
        color: "red"
    },
    {
        name: "Trapper",
        ratio: 60 / 42,
        color: "orange"
    },
    {
        name: "Gunner Trapper",
        ratio: 95 / 26.6,
        color: "yellow"
    },
    {
        name: "Predator",
        ratio: 95 / 84.8,
        color: "red"
    },
    {
        name: "Gunner(small)",
        ratio: 65 / 25.2,
        color: "lightgreen"
    },
    {
        name: "Gunner(big)",
        ratio: 85 / 25.2,
        color: "green"
    },
    {
        name: "Spread1",
        ratio: 89 / 29.4,
        color: "orange"
    },
    {
        name: "Spread2",
        ratio: 83 / 29.4,
        color: "orange"
    },
    {
        name: "Spread3",
        ratio: 71 / 29.4,
        color: "orange"
    },
    {
        name: "Spread4",
        ratio: 65 / 29.4,
        color: "orange"
    },
    {
        name: "Factory Drone",
        ratio: 1.687,
    },
    //{name: "bullet", ratio: 1, color: "pink"},
];

function drawTheThing(x, y, r, index) {
    if (toggleButtons.Visual['Toggle Aim Lines']) {
        if (TurretRatios[index].name != "bullet") {
            console.log(TurretRatios[index].name);
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
        } else {
            ctx.strokeStyle = TurretRatios[index].color;
            ctx.lineWidth = 5;

            // Draw text at the end of the line
            ctx.font = "15px Arial";
            ctx.fillStyle = TurretRatios[index].color;
            ctx.strokeStyle = "black";
            let tankRadiusesTrans = [];
            for (let i = 1; i <= 45; i++) {
                let value = Math.abs((48.589 * (1.01 ** (i - 1))) * Math.abs(scalingFactor).toFixed(4)).toFixed(3);
                tankRadiusesTrans.push(value);
            }

            let r_abs = Math.abs(r).toFixed(3);
            if (r_abs < tankRadiusesTrans[0]) {
                ctx.beginPath();
                ctx.strokeStyle = TurretRatios[index].color;
                ctx.arc(x, y - r / 2, r * 2, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
            } else {

                // Find the closest value in the array
                let closestValue = tankRadiusesTrans.reduce((prev, curr) => {
                    return (Math.abs(curr - r_abs) < Math.abs(prev - r_abs) ? curr : prev);
                });

                // Find the index of the closest value
                let closestIndex = tankRadiusesTrans.indexOf(closestValue);

                if (closestIndex !== -1) {
                    let r_name = `Level ${closestIndex + 1}`;
                    ctx.strokeText(r_name, x, y + 50 * scalingFactor);
                    ctx.fillText(r_name, x, y + 50 * scalingFactor);
                    ctx.beginPath();
                } else {

                    let r_name = `radius: ${Math.abs(r).toFixed(4)} 1: ${tankRadiusesTrans[0]} 2: ${tankRadiusesTrans[1]} 3: ${tankRadiusesTrans[2]}`;
                    ctx.strokeText(r_name, x, y);
                    ctx.fillText(r_name, x, y);
                    ctx.beginPath();
                }
                /*
                ctx.strokeText(TurretRatios[index].name, x, y);
                ctx.fillText(TurretRatios[index].name, x, y);
                */
            }
        }
    }
}

var angle, a, b, width;
let perm_cont = [];

CanvasRenderingContext2D.prototype.setTransform = new Proxy(CanvasRenderingContext2D.prototype.setTransform, {
    apply(target, thisArgs, args) {
        // Check if the ratio matches the specified conditions
        let l = TurretRatios.length;
        for (let i = 0; i < l; i++) {
            if (Math.abs(args[0] / args[3]).toFixed(3) == (TurretRatios[i].ratio).toFixed(3)) {
                if (TurretRatios[i].name === "bullet") {
                    if (args[0] != 1 && args[0] > 10 && args[0] < 100 && args[4] > 1 && args[5] > 1 && args[4] != args[5] &&
                        thisArgs.globalAlpha != 0.10000000149011612 && thisArgs.globalAlpha != 0.3499999940395355) {
                        if (!perm_cont.includes(thisArgs)) {
                            perm_cont.push(thisArgs);
                            //console.log(perm_cont);
                        }
                        angle = Math.atan2(args[2], args[3]) || 0;
                        width = Math.hypot(args[3], args[2]);
                        a = args[4] - Math.cos(angle + Math.PI / 2) * width / 2;
                        b = args[5] + Math.sin(angle + Math.PI / 2) * width / 2;
                        //console.log(b);
                        if (a > 0 && b > 0 && thisArgs.fillStyle != "#1B1B1B") { //OUTLINE COLOR
                            drawTheThing(a, b, Math.hypot(args[3], args[2]), i);
                        }
                    }
                } else {
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

const ms_fps_clrs = ["lime", "green", "yellow", "orange", "darkorange", "red", "darkred"];
const ms_filters = new Uint16Array([15, 26, 50, 90, 170, 380, 1000]);
const fps_filters = new Uint16Array([59, 55, 50, 35, 20, 10, 5]);

function pick_fps_color() {
    let fps_num = parseFloat(fps);
    let l = fps_filters.length;
    for (let i = 0; i < l; i++) {
        if (fps_num > fps_filters[i]) {
            ctx_text(ms_fps_clrs[i], "black", 4, 1 + "em Ubuntu", fps + "fps", canvas.width / 2, canvas.height / 2);
            return;
        }
    }
}

function pick_ms_color() {
    let ms_num = parseFloat(ms);
    for (let i = 0; i < ms_filters.length; i++) {
        if (ms_num < ms_filters[i]) {
            ctx_text(ms_fps_clrs[i], "black", 4, 1 + "em Ubuntu", ms + "ms", canvas.width / 2, canvas.height / 2 + 20);
            return;
        }
    }
}

//gonna work on that later (it's not accurate enough)
const arena_sizes = {
    startX: -3400,
    startY: -3400,
    endX: 3400,
    endY: 3400
}

function world_2_minimap(x, y){
    let minimap_width = minimapDim[0];
    let minimap_height = minimapDim[1];
    let center = {x:minimapPos[0]+minimap_width/2, y:minimapPos[1]+minimap_height/2};
    let scaled_du = minimap_width/(arena_sizes.endX*2);
    return {x:center.x+(x*scaled_du), y:center.y+(y*scaled_du)};
}

function world_your_pos(){
    let minimap_width = (minimapPos[0]+minimapDim[0])-minimapPos[0];
    let minimap_height = (minimapPos[1]+minimapDim[1])-minimapPos[1];
    let center = {x:minimapPos[0]+minimap_width/2, y:minimapPos[1]+minimap_height/2};
    let scaled_du = minimap_width/(arena_sizes.endX*2);
    let offset = {x: (minimapArrow[0] - center.x)/scaled_du, y: (minimapArrow[1] - center.y)/scaled_du};
    console.log(offset);
    return offset;
}

function window_2_world(x, y){
    let tank_pos = world_your_pos();
    /*
    let width = window.innerWidth*FOV;
    let height = window.innerHeight*FOV;
    */
    let width = window.innerWidth;
    let height = window.innerHeight;
    let corners = {
        lu: {
            x: tank_pos.x-(width/2),
            y: tank_pos.y-(height/2)
        },
        rb: {
            x: tank_pos.x+(width/2),
            y: tank_pos.y+(height/2)
        }
    }
    let final_coords = {x: corners.lu.x+x, y: corners.lu.y+y};
    return final_coords;
}

function world_2_window(x, y){
    let tank_pos = world_your_pos();

    let final_coords = {
        x: (x-tank_pos.x)/FOV,
        y: (y-tank_pos.y)/FOV
    }
    //ctx_arc(window_2_canvas(final_coords.x), window_2_canvas(final_coords.y), 10, 0, 2 * Math.PI, false, "yellow");
    //console.log(final_coords);
    return final_coords;
}

function draw_point(x, y){
    let point = world_2_minimap(x, y);
    ctx_arc(window_2_canvas(point.x), window_2_canvas(point.y), 1, 0, 2 * Math.PI, false, "yellow");
}

//keys visualiser
function transparent_rect_fill(x, y, a, b, scolor, fcolor, opacity){
     ctx.beginPath();
    ctx.rect(x, y, a, b);

    // Set stroke opacity
    ctx.globalAlpha = 1;  // Reset to 1 for stroke, or set as needed
    ctx.strokeStyle = scolor;
    ctx.stroke();

    // Set fill opacity
    ctx.globalAlpha = opacity;  // Set the opacity for the fill color
    ctx.fillStyle = fcolor;
    ctx.fill();

    // Reset globalAlpha back to 1 for future operations
    ctx.globalAlpha = 1;
}

let ctx_wasd = {
    square_sizes: { //in windowScaling
        a: 50,
        b: 50
    },
    text_props: {
        lineWidth:  3,
        font: 1 + "em Ubuntu",
    },
    square_colors: {
        stroke: "black",
        unpressed: "yellow",
        pressed: "orange"
    },
    text_colors: {
        stroke: "black",
        unpressed: "orange",
        pressed: "red"
    },
    w: {
        x: 300,
        y: 200,
        pressed: false,
        text: 'W'
    },
    a: {
        x: 350,
        y: 150,
        pressed: false,
        text: 'A'
    },
    s: {
        x: 300,
        y: 150,
        pressed: false,
        text: 'S'
    },
    d: {
        x: 250,
        y: 150,
        pressed: false,
        text: 'D'
    },
    l_m: {
        x: 350,
        y: 75,
        pressed: false,
        text: 'LMC'
    },
    r_m: {
        x: 250,
        y: 75,
        pressed: false,
        text: 'RMC'
    },
}

function visualise_keys(){
    let keys = ['w', 'a', 's', 'd', 'l_m', 'r_m'];
    let l = keys.length;
    for(let i = 0; i < l; i++){
    let args = {
        x: canvas.width - windowScaling_2_canvas(ctx_wasd[keys[i]].x),
        y: canvas.height - windowScaling_2_canvas(ctx_wasd[keys[i]].y),
        a: windowScaling_2_canvas(ctx_wasd.square_sizes.a),
        b: windowScaling_2_canvas(ctx_wasd.square_sizes.b),
        s_c: ctx_wasd.square_colors.stroke,
        f_c: ctx_wasd[keys[i]].pressed? ctx_wasd.square_colors.pressed : ctx_wasd.square_colors.unpressed,
        t_s: ctx_wasd.text_colors.stroke,
        t_f: ctx_wasd[keys[i]].pressed? ctx_wasd.text_colors.pressed : ctx_wasd.text_colors.unpressed,
        t_lineWidth: ctx_wasd.text_props.lineWidth,
        t_font: ctx_wasd.text_props.font,
        text: ctx_wasd[keys[i]].text,
        opacity: 0.25
    }
    transparent_rect_fill(
        args.x,
        args.y,
        args.a,
        args.b,
        args.s_c,
        args.f_c,
        args.opacity
    );
       ctx_text(
           args.t_f,
           args.t_s,
           args.t_lineWidth,
           args.t_font,
           args.text,
           args.x+(args.a/2),
           args.y+(args.b/2)
       );
    }
}

document.body.addEventListener("keydown", function(e) {
    switch(e.code){
        case "KeyW":
            ctx_wasd.w.pressed = true;
            break
        case "KeyA":
            ctx_wasd.a.pressed = true;
            break
        case "KeyS":
            ctx_wasd.s.pressed = true;
            break
        case "KeyD":
            ctx_wasd.d.pressed = true;
            break
    }
});

document.body.addEventListener("keyup", function(e) {
    switch(e.code){
        case "KeyW":
            ctx_wasd.w.pressed = false;
            break
        case "KeyA":
            ctx_wasd.a.pressed = false;
            break
        case "KeyS":
            ctx_wasd.s.pressed = false;
            break
        case "KeyD":
            ctx_wasd.d.pressed = false;
            break
    }
});

document.body.addEventListener("mousedown", function(e) {
    switch(e.button){
        case 0:
            ctx_wasd.l_m.pressed = true;
            break
        case 2:
            ctx_wasd.r_m.pressed = true;
            break
    }
});

document.body.addEventListener("mouseup", function(e) {
    switch(e.button){
        case 0:
            ctx_wasd.l_m.pressed = false;
            break
        case 2:
            ctx_wasd.r_m.pressed = false;
            break
    }
});

setTimeout(() => {
    let gui = () => {
        check_addon_scripts();
        text_startingY = canvas_2_windowScaling(450);
        textAdd = canvas_2_windowScaling(25);
        if (state === "in game") {
            //transparent_rect_fill(canvas_2_windowScaling(100), canvas_2_windowScaling(100), 250, 250, "black", "yellow", 0.25);
            if(toggleButtons.Visual['Wasd & Mouse press visualiser']){
               visualise_keys();
            }
            if(window.arrowv2_debug){
               draw_arrow(minimapArrow[0], minimapArrow[1], "lime");
               draw_viewport();
               draw_arrow(leaderArrow[0], leaderArrow[1], "pink");
               draw_arrow(minimapPos[0], minimapPos[1], "purple");
            }
            /*
            let coordss = world_2_window(arena_sizes.startX + 1450, arena_sizes.startY + 1450);
            ctx.beginPath();
            ctx.moveTo(window.innerWidth/2, window.innerHeight/2);
            ctx.lineTo(coordss.x, coordss.y);
            ctx.stroke();
            let mouse = window_2_world(coords.x, coords.y);
            draw_point(mouse.x, mouse.y);
            */
            if (ms_active) {
                pick_fps_color();
                pick_ms_color();
            }
            draw_minimap();
            if (toggleButtons.Functional['Toggle Base Zones']) {
                alert_about_drones();
            }
            if (script_list.minimap_leader_v2) {
                if (toggleButtons.Visual['Toggle Leader Angle']) {
                 calc_leader();
                 apply_vector_on_minimap();
                }
            }
            if (toggleButtons.Debug['Toggle Arrow pos']) {
                window.arrowv2_debug = true;
            } else {
                window.arrowv2_debug = false;
            }
            if (script_list.set_transform_debug) {
                ctx_arc(window.crx_container[2], window.crx_container[3], 50, 0, 2 * Math.PI, false, "yellow");
            }
            if (toggleButtons.Debug['Toggle Text']) {
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "canvas Lvl:" + player.level, canvas.width / 20 + 10, text_startingY + (textAdd * 0));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "canvas tank: " + player.tank, canvas.width / 20 + 10, text_startingY + (textAdd * 1));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "radius: " + ripsaw_radius, canvas.width / 20 + 10, text_startingY + (textAdd * 2));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "scaling Factor: " + scalingFactor, canvas.width / 20 + 10, text_startingY + (textAdd * 3));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "diep Units: " + diepUnits, canvas.width / 20 + 10, text_startingY + (textAdd * 4));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "Fov: " + FOV, canvas.width / 20 + 10, text_startingY + (textAdd * 5));
                ctx_text("white", "DarkRed", 3, 1 + "em Ubuntu", "vector: " + Math.floor(vector_l[0]) + ", " + Math.floor(vector_l[1]) + "angle: " + Math.floor(angle_l), canvas.width / 20 + 10, text_startingY + (textAdd * 7));
                //ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + coords.x + "realY: " + coords.y + "newX: " + coords.x*windowScaling() + "newY: " + coords.y*windowScaling(), coords.x*2, coords.y*2);

                //points at mouse
                ctx_arc(coords.x * two, coords.y * two, 5, 0, 2 * Math.PI, false, "purple");
                /*
                circle_in_diepunits(coords.x*2/scalingFactor, coords.y*2/scalingFactor, 35, "pink");
                circle_in_diepunits(coords.x*2/scalingFactor, coords.y*2/scalingFactor, 55, "yellow");
                circle_in_diepunits(coords.x*2/scalingFactor, coords.y*2/scalingFactor, 75, "purple");
                circle_in_diepunits(coords.x*2/scalingFactor, coords.y*2/scalingFactor, 200, "blue");
                */

                //coords at mouse
                ctx_text("white", "DarkRed", 6, 1.5 + "em Ubuntu", "realX: " + coords.x * two + "realY: " + coords.y * two, coords.x * two, coords.y * two);
            }

            if (player.level != null && player.tank != null) {
                if (toggleButtons.Debug['Toggle Middle Circle']) {
                    ctx.beginPath();
                    ctx.moveTo(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
                    ctx.lineTo(coords.x * two, coords.y * two);
                    ctx.stroke();
                    ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius, 0, 2 * Math.PI, false, "darkblue");
                    ctx_arc(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY, ripsaw_radius * 0.9, 0, 2 * Math.PI, false, "lightblue");
                }
                if (toggleButtons.Debug['Toggle Upgrades']) {
                    draw_upgrade_grid();
                }
                //draw_server_border(4000, 2250);
                draw_crx_events();
                if (toggleButtons.Visual['Toggle Bullet Distance']) {
                    draw_cirle_radius_for_tank();
                }
            };
        }
        window.requestAnimationFrame(gui);
    }
    gui();
    setTimeout(() => {
        gui();
    }, 5000);
}, 1000);

// Alert players about missing scripts (for addons)
let notified = {};

function require(category, toggleButton, script) {
    if (state === "in game") {
        const notificationKey = `${category}-${toggleButton}-${script}`;
        if (toggleButtons[category]?.[toggleButton] && !script_list[script] && !notified[notificationKey]) {
            new_notification(`${toggleButton} requires ${script} to be active!`, rgbToNumber(...notification_rbgs.require), 7500);
            notified[notificationKey] = true;
        }
    }
}

function check_addon_scripts() {
    require('Addons', 'FOV changer', 'fov');
}

//cooldowns (unfinished)
let c_cd = "red";
let c_r = "green";
const cooldowns = [
    {
        Tank: "Destroyer",
        cooldown0: 109,
        cooldown1: 94,
        cooldown2: 81,
        cooldown3: 86
    },
]

//detect which slot was clicked
document.addEventListener('mousedown', checkPos)

function checkPos(e) {
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
    let b = (1.015**(player.level - 1));
    let A_o = 2.55*(a/b);
    accelarate(A_o);
}
*/

//handle Key presses
let key_storage = [];
let keyHeld = {};

window.addEventListener('keydown', function(e) {
    if (!keyHeld[e.key]) {
        keyHeld[e.key] = true;
        key_storage.push(e.key);
        analyse_keys();
    }
    console.log(key_storage);
});

window.addEventListener('keyup', function(e) {
    if (key_storage.includes(e.key)) {
        key_storage.splice(key_storage.indexOf(e.key), 1);
    }
    keyHeld[e.key] = false;
    console.log(key_storage);
    analyse_keys();
});

function analyse_keys() {
    if (key_storage.includes("j")) { //J
        change_visibility();
        //auto spin && auto fire
    } else if (key_storage.includes("l")) {
        ms_active = !ms_active;
    } else if (key_storage.includes("e")) { //E
        if (ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")) {
            f_s("fire");
        } else {
            auto_fire = false;
        }
        console.log(auto_fire);
    }else if (key_storage.includes("c")) {
        console.log(auto_spin);
        if (ingamescreen.classList.contains("screen") && ingamescreen.classList.contains("active")) {
            f_s("spin");
        } else {
            auto_spin = false;
        }
        console.log(auto_spin);
        //stats
    } else if (toggleButtons.Functional['Stats']) {
        if (key_storage.includes("u")) {
            if (key_storage.includes("r")) {
                reset_stats();
            }
            if (!document.body.contains(upgrade_box)) {
                document.body.appendChild(upgrade_box);
            }
            update_stats();
            if (stats_limit >= 0) {
                for (let i = 1; i < 9; i++) {
                    if (key_storage.includes(`${i}`) && stats[i] < 7) {
                        stats[i] += 1;
                        stats_limit -= 1;
                    }
                }
            }
        } else {
            if (document.body.contains(upgrade_box)) {
                document.body.removeChild(upgrade_box);
            }
            use_stats_ingame();
        }
    }
}

//stats handler
var stats_instructions_showed = false;

function show_stats_instructions() {
    if (toggleButtons.Functional['Stats']) {
        input.execute("ren_stats false");
        if (!stats_instructions_showed) {
            if (state === "in game") {
                use_stats_ingame();
                new_notification("Usage: hold 'u' button and then press a number between 1 and 9", rgbToNumber(...notification_rbgs.normal), 5000);
                new_notification("Explanation: this module lets you choose a tank build that will stay even after you die", rgbToNumber(...notification_rbgs.normal), 5100);
                new_notification("unless you press r while pressing u", rgbToNumber(...notification_rbgs.normal), 5200);
                stats_instructions_showed = true;
            }
        } else {
            if (state === "in menu") {
                stats_instructions_showed = false;
            }
        }
    } else {
        input.execute("ren_stats true");
    }
}

setInterval(show_stats_instructions, 500);
let stats = ["don't use this", 0, 0, 0, 0, 0, 0, 0, 0];
let stats_limit = 32;

function update_stats() {
    let l = stats.length;
    for (let i = 1; i < l; i++) {
        let stat_steps = stats[i];
        for (let j = 1; j < stat_steps + 1; j++) {
            let stat_row = document.querySelector(`#row${[i]} > #s_box${j}`);
            stat_row.style.backgroundColor = `${upgrade_name_colors[i]}`;
        }
    }
}

function reset_stats() {
    let l = stats.length;
    for (let i = 1; i < l; i++) {
        let stat_steps = stats[i];
        for (let j = 1; j < stat_steps + 1; j++) {
            let stat_row = document.querySelector(`#row${[i]} > #s_box${j}`);
            stat_row.style.backgroundColor = "black";
        }
    }
    stats = ["don't use this", 0, 0, 0, 0, 0, 0, 0, 0];
    stats_limit = 32;
}

function use_stats_ingame() {
    let final_decision = "";
    for (let i = 5; i < 9; i++) {
        for (let j = 0; j < stats[i]; j++) {
            final_decision += `${i}`;
        }
    }
    for (let i = 1; i < 5; i++) {
        for (let j = 0; j < stats[i]; j++) {
            final_decision += `${i}`;
        }
    }
    input.execute(`game_stats_build ${final_decision}`);
}

const upgrade_names = [
  "don't use this",
  "Health Regen",
  "Max Health",
  "Body Damage",
  "Bullet Speed",
  "Bullet Penetration",
  "Bullet Damage",
  "Reload",
  "Movement Speed",
];

const upgrade_name_colors = [
  "don't use this",
  "DarkSalmon",
  "pink",
  "DarkViolet",
  "DodgerBlue",
  "yellow",
  "red",
  "lime",
  "lightblue",
];

const upgrade_box = document.createElement("div");
upgrade_box.style.width = "400px";
upgrade_box.style.height = "300px";
upgrade_box.style.backgroundColor = "lightGray";
upgrade_box.style.position = "fixed";
upgrade_box.style.display = "block";
upgrade_box.style.bottom = "10px";
upgrade_box.style.zIndex = 100;

for (let i = 1; i < 9; i++) {
    create_upgrades(`row${i}`, i);
}

function create_upgrades(name, rownum) {
    let black_box = document.createElement("div");
    black_box.id = name;
    black_box.style.width = "350px";
    black_box.style.height = "20px";
    black_box.style.position = "relative";
    black_box.style.display = "block";
    black_box.style.marginTop = "15px";
    black_box.style.left = "25px";
    for (let i = 1; i < 8; i++) {
        let small_box = document.createElement("div");
        small_box.id = `s_box${i}`;
        small_box.style.width = "20px";
        small_box.style.height = "20px";
        small_box.style.backgroundColor = "black";
        small_box.style.display = "inline-block";
        small_box.style.border = "2px solid white";

        black_box.appendChild(small_box);
    }
    let upgrade_btn = document.createElement("button");
    upgrade_btn.id = upgrade_names[rownum];
    upgrade_btn.style.color = "black";
    upgrade_btn.innerHTML = "+";
    upgrade_btn.style.width = "20px";
    upgrade_btn.style.height = "20px";
    upgrade_btn.style.backgroundColor = upgrade_name_colors[rownum];
    upgrade_btn.style.display = "inline-block";
    upgrade_btn.style.border = "2px solid black";
    upgrade_btn.style.cursor = "pointer";
    black_box.appendChild(upgrade_btn);

    let text_el = document.createElement("h3");
    text_el.innerText = `[${rownum}] ${upgrade_names[rownum]}`;
    text_el.style.fontSize = "15px";
    text_el.style.display = "inline-block";
    black_box.appendChild(text_el);
    upgrade_box.appendChild(black_box);
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