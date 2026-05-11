// ==UserScript==
// @name         r!PsAw's base Farm (with diepUtils)
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  supports DiepStyle and other theme scripts (works only in 4tdm and 2tdm)
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @require      https://raw.githubusercontent.com/MI301/My-Diep.io-Scripts/refs/heads/main/libraries/DiepUtils/scriptSrc
// @grant        none
// @license      MIT
// ==/UserScript==

//get api
let api = false;
let awaitApi = setInterval(function() {
    if (typeof DiepUtils === "null") {
        return;
    }
    clearInterval(awaitApi);
    api = true;
}, 400);

// Load saved config from localStorage or use default
let savedConfig = localStorage.getItem("botConfig");
let config = savedConfig
    ? JSON.parse(savedConfig)
    : {
          script_enabled: false,
          bot_name: "r!PsAw BaseFarm",
          build: "555555566666667777777444888888823",
          auto_fire_delay: 750,
          distance_to_base_border: 100,
          toggle_button: "Escape",
      };

// GUI Creation Functionality
function createElement(type, properties = {}, styles = {}, events = {}) {
    const element = document.createElement(type);
    Object.assign(element, properties);
    Object.assign(element.style, styles);
    for (let [event, handler] of Object.entries(events)) {
        element.addEventListener(event, handler);
    }
    return element;
}

const guiContainer = createElement(
    "div",
    {},
    {
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "300px",
        padding: "15px",
        background: "#282c34",
        color: "white",
        borderRadius: "10px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        fontFamily: "Arial, sans-serif",
        zIndex: 10000,
    }
);

const title = createElement(
    "h3",
    { innerText: "Bot Config" },
    { margin: "0 0 10px 0", textAlign: "center", borderBottom: "1px solid #444" }
);

guiContainer.appendChild(title);

function createInputField(labelText, inputType, configKey, maxLength = null) {
    const wrapper = createElement(
        "div",
        {},
        { marginBottom: "10px" }
    );

    const label = createElement(
        "label",
        { innerText: labelText },
        { display: "block", marginBottom: "5px", fontSize: "14px" }
    );

    const input = createElement(
        "input",
        {
            type: inputType,
            value: config[configKey],
            maxLength: maxLength,
        },
        {
            width: "100%",
            padding: "8px",
            border: "1px solid #555",
            borderRadius: "5px",
            background: "#444",
            color: "white",
            fontSize: "14px",
        },
        {
            input: (event) => {
                if (inputType === "number") {
                    config[configKey] = parseFloat(event.target.value) || 0;
                } else {
                    config[configKey] = event.target.value;
                }
            },
        }
    );

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
}

guiContainer.appendChild(createInputField("Bot Name", "text", "bot_name", 16));
guiContainer.appendChild(createInputField("Build String", "text", "build", 33));
guiContainer.appendChild(createInputField("Auto Fire Delay (ms)", "number", "auto_fire_delay"));
guiContainer.appendChild(createInputField("Distance to Base Border", "number", "distance_to_base_border"));

// Script Enable Toggle
const toggleWrapper = createElement("div", {}, { marginBottom: "10px" });

const toggleLabel = createElement(
    "label",
    { innerText: "Enable Script" },
    { marginRight: "10px", fontSize: "14px" }
);

const toggleCheckbox = createElement(
    "input",
    {
        type: "checkbox",
        checked: config.script_enabled,
    },
    {},
    {
        change: (event) => {
            config.script_enabled = event.target.checked;
            if(config.script_enabled){
                extern.inGameNotification("Script Enabled");
            }else{
                extern.inGameNotification("Script Enabled");
                stop_movement();
            }
        },
    }
);

toggleWrapper.appendChild(toggleLabel);
toggleWrapper.appendChild(toggleCheckbox);
guiContainer.appendChild(toggleWrapper);

// Toggle Button Config
const toggleButtonContainer = createElement("div", {}, { marginBottom: "10px" });

let toggleButtonText = createElement(
    "span",
    { innerText: `Hide GUI with "${config.toggle_button}"` },
    { display: "block", fontSize: "14px", marginBottom: "5px" }
);

let toggleButtonConfigButton = createElement(
    "button",
    { innerText: "Change Toggle Button" },
    {
        width: "100%",
        padding: "10px",
        background: "#4caf50",
        border: "none",
        borderRadius: "5px",
        color: "white",
        fontSize: "14px",
        cursor: "pointer",
    },
    {
        click: () => {
            toggleButtonText.innerText = "Select a new button...";
            document.addEventListener("keydown", handleKeyPress);
        },
    }
);

function handleKeyPress(event) {
    config.toggle_button = event.key;
    toggleButtonText.innerText = `Hide GUI with "${config.toggle_button}"`;
    document.removeEventListener("keydown", handleKeyPress);
}

toggleButtonContainer.appendChild(toggleButtonText);
toggleButtonContainer.appendChild(toggleButtonConfigButton);
guiContainer.appendChild(toggleButtonContainer);

// Save Button
const saveButton = createElement(
    "button",
    { innerText: "Save Config" },
    {
        width: "100%",
        padding: "10px",
        background: "#61dafb",
        border: "none",
        borderRadius: "5px",
        color: "black",
        fontSize: "14px",
        cursor: "pointer",
    },
    {
        click: () => {
            localStorage.setItem("botConfig", JSON.stringify(config));
            alert("Configuration Saved!");
        },
    }
);

guiContainer.appendChild(saveButton);

// Append GUI to Document
document.body.appendChild(guiContainer);

// Hide/Show GUI with Toggle Button
document.addEventListener("keydown", (event) => {
    if (event.key === config.toggle_button) {
        guiContainer.style.display =
            guiContainer.style.display === "none" ? "block" : "none";
    }
});

//color functions
let ui_color_range = {
    min: 1,
    max: 7
}

let net_color_range = {
    min: 0,
    max: 27
}

function get_style_color(property) {
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
}

function get_hidden(type, number) {
    type === "UI" ? (ui_color_range.min <= number && number <= ui_color_range.max) ? null : console.log("illegal Number!") : type === "NET" ? (net_color_range.min <= number && number <= net_color_range.max) ? null : ("illegal Number!") : console.log("illegal Type!");
    switch (type) {
        case "UI":
            return get_style_color(`--uicolor${number}`);
            break
        case "NET":
            return get_style_color(`--netcolor${number}`);
            break
    }
}

//store some information here
let server = {
    gamemode: null,
    loaded: false,
    bases_generated: false
};

let bot = {
    name: config.bot_name,
    pos: {
        x: 0,
        y: 0
    },
    goal: {
        x: 0,
        y: 0,
        dir: "up"
    },
    shape: {
        x: 0,
        y: 0,
        exists: false
    },
    team: "",
    base: "",
    in_base: false,
    moving_process_ended1: true,
    moving_process_ended2: true,
    dead: true,
    shooting: false,
    set_build: config.build,
    get_build: ""
};

let sizes = {
    arena: {
        width: 26000,
        height: 26000
    },
    t4_base: {
        width: 3900,
        height: 3900
    },
    t2_base: {
        width: 2500,
        height: 26000
    }
}

let colors = {
    blue_team: get_hidden("NET", 3),
    red_team: get_hidden("NET", 4),
    purple_team: get_hidden("NET", 5),
    green_team: get_hidden("NET", 6),
    index: ["blue", "red", "purple", "green"]
}

let bases = [];

//main
function init() {
    window.requestAnimationFrame(init);
    if (!window.lobby_ip) {
        server.loaded = false;
        console.log("Server still loading...");
        return;
    }
    if (api) {
        server.loaded = true;
        server.gamemode = get_gamemode();
        if (server.gamemode != "teams" && server.gamemode != "4teams") {
            console.log(server.gamemode);
            return;
        }
        bot.dead = is_dead();
        if(config.script_enabled){
            bot.dead? respawn() : start_bot();
        };
        config.script_enabled?extern.execute(`game_stats_build ${bot.set_build}`):null;
        bot.get_build = extern.get_convar("game_stats_build");
        if (bot.set_build != bot.get_build) {
            config.script_enabled?extern.execute(`game_stats_build ${bot.set_build}`):null;
        }
        if(config.script_enabled){
        window.__common__.has_leaderboard ? autofire() : null;
        }
    } else {
        console.warn("DiepUtils still loading...");
    }
}

//helper functions
function is_dead() {
    switch (extern.doesHaveTank()) {
        case 0:
            return true;
            break
        case 1:
            return false;
            break
    }
}

function respawn() {
    extern.try_spawn(bot.name);
    bot.dead = is_dead();
    bot.shooting = false;
    console.log("respawned");
}

function start_bot() {
    get_positions();
    !server.bases_generated ? set_bases() : null;
    bot.team = get_team();
    bot.base = bases[colors.index.indexOf(bot.team)];
    bot.in_base = is_in_base();
    if(config.script_enabled){
        bot.in_base ? start_farming() : move_to_base();
    }
}

function get_gamemode() {
    /*
    const { gameManager } = window.DiepUtils;
    server.gamemode = gameManager.getGamemode();
    */
    return window.__common__.active_gamemode;
}

function autofire() {
    if (!bot.shooting && !bot.dead) {
        console.log("Autofire ON");
        bot.shooting = true;
        setTimeout(() => {
            /*
            const { controller } = window.DiepUtils;
            controller.pressKey("KeyE");
            */
            extern.onKeyDown(5);
            extern.onKeyUp(5);
        }, config.auto_fire_delay);
    }
}

function update_colors() {
    colors = {
        blue_team: get_hidden("NET", 3),
        red_team: get_hidden("NET", 4),
        purple_team: get_hidden("NET", 5),
        green_team: get_hidden("NET", 6),
        index: ["blue", "red", "purple", "green"]
    }
}

function get_team() {
    const {
        entityManager
    } = window.DiepUtils;
    let your_color = entityManager.getPlayer().color;
    if (your_color === colors.blue_team) {
        return "blue";
    }
    if (your_color === colors.red_team) {
        return "red";
    }
    if (your_color === colors.purple_team) {
        return "purple";
    }
    if (your_color === colors.green_team) {
        return "green";
    }
}

function new_base(color, from, to) {
    return {
        color: color,
        from: from,
        to: to
    };
}

function set_bases() {
    switch (server.gamemode) {
        case "4teams":
            bases.push(new_base("blue", {
                wx: 0,
                wy: 0
            }, {
                wx: sizes.t4_base.width,
                wy: sizes.t4_base.height
            }));
            bases.push(new_base("red", {
                wx: sizes.arena.width - sizes.t4_base.width,
                wy: sizes.arena.height - sizes.t4_base.height
            }, {
                wx: sizes.arena.width,
                wy: sizes.arena.height
            }));
            bases.push(new_base("purple", {
                wx: sizes.arena.width - sizes.t4_base.width,
                wy: 0
            }, {
                wx: sizes.arena.width,
                wy: sizes.t4_base.height
            }));
            bases.push(new_base("green", {
                wx: 0,
                wy: sizes.arena.height - sizes.t4_base.height
            }, {
                wx: sizes.t4_base.width,
                wy: sizes.arena.height
            }));
            break
        case "teams":
            bases.push(new_base("blue", {
                wx: 0,
                wy: 0
            }, {
                wx: sizes.t2_base.width,
                wy: sizes.t2_base.height
            }));
            bases.push(new_base("red", {
                wx: sizes.arena.width - sizes.t2_base.width,
                wy: 0
            }, {
                wx: sizes.arena.width,
                wy: sizes.arena.height
            }))
            break
    }
    server.bases_generated = true;
}

function get_positions() {
    const {
        entityManager
    } = window.DiepUtils;
    let you = entityManager.getPlayer();
    let shape = entityManager.getClosestEntity("shape");
    bot.pos.x = you.wx;
    bot.pos.y = you.wy;
    if (shape) {
        bot.shape.x = shape.x;
        bot.shape.y = shape.y;
        bot.shape.exists = true;
    }else{
        bot.shape.exists = false;
    }
}

function is_in_base() {
    //console.log("is_in_base called");
    if (bot.pos.x !== 0 && bot.pos.y !== 0 && bot.base !== "") {
        //console.log("bot_pos and bot_base are defined :)");

        // Check if you're between the two corners of the base
        let from_corner = bot.base.from.wx <= bot.pos.x && bot.base.from.wy <= bot.pos.y;
        let to_corner = bot.base.to.wx >= bot.pos.x && bot.base.to.wy >= bot.pos.y;

        //if (from_corner) console.log("first condition met!");
        //if (to_corner) console.log("second condition met!");

        return from_corner && to_corner;
    }
    return false;
}

function move_to_base() {
    let move_x, move_y;
    switch (server.gamemode) {
        case "4teams":
            move_x = bot.base.from.wx + (sizes.t4_base.width / 2);
            move_y = bot.base.from.wy + (sizes.t4_base.height / 2);
            break
        case "teams":
            move_x = bot.base.from.wx + (sizes.t2_base.width / 2);
            move_y = bot.base.from.wy + (sizes.t2_base.height / 2);
            break
    }
    move_to(move_x, move_y);
    bot.moving_process_ended1 = false;
    handle_aim();
}

function start_farming() {
    // Stop moving to base when inside the base
    if (!bot.moving_process_ended1) {
        stop_movement();
        bot.moving_process_ended1 = true;
    }
    // Stop current movement if transitioning between goals
    if (!bot.moving_process_ended2) {
        stop_movement();
        bot.moving_process_ended2 = true;
    }

    switch(server.gamemode){
        case "4teams":
            bot.goal.x = bot.base.from.wx + (sizes.t4_base.width / 2);
            break
        case "teams":
            bot.goal.x = bot.base.from.wx + (sizes.t2_base.width / 2);
            break
    }

    switch (bot.goal.dir) {
        case "up":
            bot.goal.y = bot.base.from.wy + config.distance_to_base_border;
            move_to(bot.goal.x, bot.goal.y);
            if (bot.pos.y <= bot.goal.y) {
                stop_movement();
                bot.goal.dir = "down";
                bot.moving_process_ended2 = false;
            }
            break;

        case "down":
            bot.goal.y = bot.base.to.wy - config.distance_to_base_border;
            move_to(bot.goal.x, bot.goal.y);
            if (bot.pos.y >= bot.goal.y) {
                stop_movement();
                bot.goal.dir = "up";
                bot.moving_process_ended2 = false;
            }
            break;
    }
    handle_aim();
}

function handle_aim(){
    if(bot.shape.exists){
        aim_at(bot.shape.x, bot.shape.y);
    }else{
        switch(bot.goal.dir){
            case "up":
                aim_at(window.innerWidth/2,window.innerHeight);
                break
            case "down":
                aim_at(window.innerWidth/2, 0);
                break
        }
    }
}

function move_to(wx, wy) {
    const {
        controller
    } = window.DiepUtils;
    controller.moveToPosition(wx, wy);
}

function stop_movement() {
    const {
        controller
    } = window.DiepUtils;
    controller.resetMovement();
}

function aim_at(x, y) {
    const {
        controller
    } = window.DiepUtils;
    controller.setMousePos(x, y);
}

//intervals
window.requestAnimationFrame(init);
setInterval(update_colors, 250);