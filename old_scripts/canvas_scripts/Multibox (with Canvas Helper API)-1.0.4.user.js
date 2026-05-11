// ==UserScript==
// @name         Multibox (with Canvas Helper API)
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  simple multibox script using canvas Helper API
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-start
// ==/UserScript==

GM_setValue('Master', undefined);
const win = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
win._set = GM_setValue;
win._get = GM_getValue;

//overwrite zoom function to get the zoom out factor
let zoom_factor = 1;

function overwrite_zoom() {
    if (win.extern && win.extern.setScreensizeZoom) {
        let original = win.extern.setScreensizeZoom;
        win.extern.setScreensizeZoom = function(factor1, factor2) {
            zoom_factor = factor2;
            original(factor1, factor2);
        }
    } else {
        setTimeout(overwrite_zoom, 100);
    }
}
overwrite_zoom();

//AUTO RESPAWN FIX RESETTING SOME THINGS

//keys bypass
(function() {
    win.frozenHasFocus = {
        hasFocus: () => true
    };
    document.hasFocus = () => true;
})();

//keys definition
const diep_keys = [
  "KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG", "KeyH", "KeyI", "KeyJ", "KeyK", "KeyL", "KeyM", "KeyN", "KeyO", "KeyP", "KeyQ", "KeyR", "KeyS", "KeyT", "KeyU", "KeyV", "KeyW", "KeyX", "KeyY", "KeyZ",
  "ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Tab", "Enter", "NumpadEnter", "ShiftLeft", "ShiftRight", "Space", "Numpad0", "Numpad1", "Numpad2", "Numpad3", "Numpad4", "Numpad5", "Numpad6", "Numpad7", "Numpad8", "Numpad9",
  "Digit0", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "F2", "End", "Home", "Semicolon", "Comma", "NumpadComma", "Period", "Backslash"
].reduce((n, e, c) => {
    n[e] = c + 1;
    return n;
}, {});

//api detecting logic
let notified_about_missing = false;

function notify_about_missing() {
    if (notified_about_missing) return;
    alert('Missing Canvas Api to run addon script, join our discord server to get it: https://discord.gg/S3ZzgDNAuG');
    notified_about_missing = true;
}

//world position calculator
const world_map = {
    min: {
        x: 0,
        y: 0
    },
    max: {
        x: 27000,
        y: 27000
    },
}

function get_your_worldpos() {
    if (!win.ripsaw_api) {
        notify_about_missing();
        return;
    }
    let minimap = win.ripsaw_api.get_minimap().corners;
    let you = win.ripsaw_api.get_arrows().minimap.center;
    let unscaled = {
        x: you[0] - minimap.top_left[0],
        y: you[1] - minimap.top_left[1],
        max: {
            x: minimap.top_right[0] - minimap.top_left[0],
            y: minimap.bottom_left[1] - minimap.top_left[1]
        },
    }
    if (unscaled.max.x == 0 || unscaled.max.y == 0) {
        unscaled.max.x = 1;
        unscaled.max.y = 1;
    }
    let world = {
        x: JSON.parse(((unscaled.x / unscaled.max.x) * world_map.max.x).toFixed(2)),
        y: JSON.parse(((unscaled.y / unscaled.max.y) * world_map.max.y).toFixed(2)),
    }
    return world;
}
//infos
let you, focused;

function windowScaling() {
    const a = canvas.height / 1080;
    const b = canvas.width / 1920;
    return b < a ? a : b;
}

//upgrade logic
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

function step_offset(steps, offset) {
    let final_offset = 0;
    switch (offset) {
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
        LUcornerY: _bp.startY,
    },
    {
        color: "green",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY,
    },
    {
        color: "red",
        LUcornerX: _bp.startX,
        LUcornerY: _bp.startY + _bo.offsetY,
    },
    {
        color: "yellow",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: _bp.startY + _bo.offsetY,
    },
    {
        color: "blue",
        LUcornerX: _bp.startX,
        LUcornerY: step_offset(2, "y"),
    },
    {
        color: "purple",
        LUcornerX: _bp.startX + _bo.offsetX,
        LUcornerY: step_offset(2, "y"),
    }
]

function upgrade_get_coords(color) {
    let windowScaling_2_canvas = function(a) {
        let b = a * windowScaling();
        return b;
    }
    let windowScaling_2_window = function(a) {
        let b = (windowScaling_2_canvas(a)) / (canvas.width / window.innerWidth);
        return b;
    }
    let l = boxes.length;
    let upgrade_coords = {
        x: "not defined",
        y: "not defined"
    };
    for (let i = 0; i < l; i++) {
        if (boxes[i].color === color) {
            upgrade_coords.x = windowScaling_2_window(boxes[i].LUcornerX + (_bp.width / 2));
            upgrade_coords.y = windowScaling_2_window(boxes[i].LUcornerY + (_bp.height / 2));
        }
    }
    return upgrade_coords;
}

function upgrade(color) {
    let u_coords = upgrade_get_coords(color);
    win.input.onTouchStart(-1000, u_coords.x, u_coords.y);
    win.input.onTouchEnd(-1000, u_coords.x, u_coords.y);
}

function r(lvl, name, color) {
    return {
        required_level: lvl,
        required_tank: name,
        upgrade_color: color
    };
}

const upgrading_tank_path = {
    "Spike": [
      r(30, 'Tank', 'blue'),
      r(45, 'Smasher', 'red')
  ],
    "Auto Tank": [
      r(45, 'Tank', 'purple')
  ],
    "Glider": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
      r(45, 'Destroyer', 'blue'),
  ],
    "Rocketeer": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
      r(45, 'Destroyer', 'yellow'),
  ],
    "Auto Trapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
      r(45, 'Trapper', 'blue'),
  ],
    "Streamliner": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'green'),
      r(45, 'Gunner', 'red'),
  ],
    "Spread Shot": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'lightblue'),
      r(45, 'Triple Shot', 'red'),
  ],
    "Auto 5": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'green'),
      r(45, 'Quad Tank', 'green'),
  ],
    "Auto Gunner": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'green'),
      r(45, 'Gunner', 'lightblue'),
  ],
    "Landmine": [
      r(30, 'Tank', 'blue'),
      r(45, 'Smasher', 'lightblue')
  ],
    "Sprayer": [
      r(15, 'Tank', 'red'),
      r(45, 'Machine Gun', 'red'),
  ],
    "Tri-Trapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
      r(45, 'Trapper', 'lightblue'),
  ],
    "Mega Trapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
      r(45, 'Trapper', 'yellow'),
  ],
    "Overtrapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
      r(45, 'Trapper', 'red'),
  ],
    "Gunner Trapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
      r(45, 'Trapper', 'green'),
  ],
    "Predator": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'red'),
      r(45, 'Hunter', 'lightblue'),
  ],
    "Manager": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'green'),
      r(45, 'Overseer', 'red'),
  ],
    "Hybrid": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
      r(45, 'Destroyer', 'lightblue'),
  ],
    "Fighter": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'lightblue'),
      r(45, 'Tri-Angle', 'green'),
  ],
    "Booster": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'lightblue'),
      r(45, 'Tri-Angle', 'lightblue'),
  ],
    "Ranger": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'lightblue'),
      r(45, 'Assassin', 'lightblue'),
  ],
    "Stalker": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'lightblue'),
      r(45, 'Assassin', 'green'),
  ],
    "Penta Shot": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'lightblue'),
      r(45, 'Triple Shot', 'green'),
  ],
    "Necromancer": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'green'),
      r(45, 'Overseer', 'green'),
  ],
    "Overlord": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'green'),
      r(45, 'Overseer', 'lightblue'),
  ],
    "Factory": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'green'),
      r(45, 'Overseer', 'purple'),
  ],
    "Octo Tank": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'green'),
      r(45, 'Quad Tank', 'lightblue'),
  ],
    "Annihilator": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
      r(45, 'Destroyer', 'green'),
  ],
    "Triplet": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'lightblue'),
      r(45, 'Triple Shot', 'lightblue'),
  ],
    "Triple Twin": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'red'),
      r(45, 'Twin Flank', 'lightblue'),
  ],
    "Auto 3": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'yellow'),
  ],
    "Gunner": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'green'),
  ],
    "Hunter": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'red'),
  ],
    "Assassin": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'lightblue'),
  ],
    "Smasher": [
      r(30, 'Tank', 'blue'),
  ],
    "Twin Flank": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'red'),
  ],
    "Quad Tank": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'green'),
  ],
    "Destroyer": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
  ],
    "Tri-Angle": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'lightblue'),
  ],
    "Auto Smasher": [
      r(30, 'Tank', 'blue'),
      r(45, 'Smasher', 'green')
  ],
    "Triple Shot": [
      r(15, 'Tank', 'lightblue'),
      r(30, 'Twin', 'lightblue'),
  ],
    "Trapper": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'yellow'),
  ],
    "Flank Guard": [
      r(15, 'Tank', 'yellow'),
  ],
    "Skimmer": [
      r(15, 'Tank', 'red'),
      r(30, 'Machine Gun', 'lightblue'),
      r(45, 'Destroyer', 'red'),
  ],
    "Machine Gun": [
      r(15, 'Tank', 'red'),
  ],
    "Sniper": [
      r(15, 'Tank', 'green'),
  ],
    "Battleship": [
      r(15, 'Tank', 'yellow'),
      r(30, 'Flank Guard', 'red'),
      r(45, 'Twin Flank', 'green'),
  ],
    "Twin": [
      r(15, 'Tank', 'lightblue'),
  ],
    "Overseer": [
      r(15, 'Tank', 'green'),
      r(30, 'Sniper', 'green'),
  ],
    //"Tank": [
    //],
};

//let's have some fun >:)
function generate_ID(length) {
    let final_result = "";
    let chars =
        "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+-=/.,".split(
            ""
        );
    for (let i = 0; i < length; i++) {
        final_result += chars[Math.floor(Math.random() * chars.length)];
    }
    return GM_getValue(final_result) ? generate_ID(length) : final_result;
}

function deepConvertMaps(obj) {
    if (obj instanceof Map) {
        let result = {};
        for (let [key, value] of obj.entries()) {
            result[key] = deepConvertMaps(value);
        }
        return result;
    } else if (Array.isArray(obj)) {
        return obj.map(item => deepConvertMaps(item));
    } else if (obj !== null && typeof obj === 'object') {
        let result = {};
        for (let key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = deepConvertMaps(obj[key]);
            }
        }
        return result;
    }
    return obj;
}


class Player {
    constructor() {
        //unique to every tank
        this.id = generate_ID(50);
        //store build
        let empty_build = new Array(33);
        empty_build.fill('0');
        this.build = empty_build.join('');
        //Auto Fire & Spin boolean
        this.AutoFire = false;
        this.AutoSpin = false;
        //Mouse Click active
        this.RightMouseClick = false;
        this.LeftMouseClick = false;
        //mouse pos
        this.mouse = {
            x: null,
            y: null,
        }
        //check functions
        this.hasSpawned = () => {
            return !!(win.input && win.input.doesHaveTank());
        }
        this.hasConnected = () => {
            return !!win.lobby_ip
        };
        //ingame information
        this.world_pos = {
            x: null,
            y: null
        }
        this.mouse_pos = {
            real: {
                x: null,
                y: null
            }
        }
        //script information
        this.master = false;
        this.update_setValue();
    }
    update_world_pos() {
        this.world_pos = get_your_worldpos();
        if (this.master) {
            GM_setValue("target world X", this.world_pos.x);
            GM_setValue("target world Y", this.world_pos.y);
        }
    }
    update_build() {
        if (!win.input || !win.input.get_convar) return;
        let empty_build = new Array(33);
        let build_string = win.input.get_convar('game_stats_build');
        for (let i = 0; i < 33; i++) {
            empty_build[i] = (build_string[i]) ? build_string[i] : '0';
        }
        this.build = empty_build.join('');
        this.update_setValue();
    }
    update_setValue() {
        let af = this.AutoFire ? '1' : '0';
        let as = this.AutoSpin ? '1' : '0';
        let rmc = this.RightMouseClick ? '1' : '0';
        let lmc = this.LeftMouseClick ? '1' : '0';
        GM_setValue(this.id, this.build + af + as + rmc + lmc); //structure: 33 build + 1 AutoFire On/Off + 1 AutoSpin On/Off + 1 Right Mouse Click On/Off + 1 Left Mouse Click On/Off
    }
    get_tank_data() {
        if (this.hasSpawned()) {
            let tank_data = {
                FOV: win.ripsaw_api.get_FOV(),
                level: JSON.parse(win.ripsaw_api.get_your_lvl()),
                tank_name: win.ripsaw_api.get_your_tank_name(),
                body: win.ripsaw_api.get_your_body(),
            }
            return tank_data;
        }
    }
    get_surroundings() {
        if (this.hasSpawned()) {
            let surroundings = {
                shapes: win.ripsaw_api.get_shapes(),
                tanks: win.ripsaw_api.get_tanks(),
            }
            return surroundings;
        }
    }
    save() {
        /*
        console.log(
            `
            ripsaw api: ${win.ripsaw_api}
            lobby ip: ${win.lobby_ip}
            spawned: ${input?.doesHaveTank()==1}
            `
        );
        */
        let worldPos = get_your_worldpos();
        if (worldPos) {
            GM_setValue(`${this.id} WorldPos`, JSON.stringify(worldPos));
        }

        let t_data = this.get_tank_data();
        if (t_data) {
            GM_setValue(`${this.id} ScalingFactor`, JSON.stringify(t_data.FOV * windowScaling()));
        }

        let surroundings = this.get_surroundings();
        if (surroundings) {
            GM_setValue(`${this.id} surroundings`, JSON.stringify(deepConvertMaps(surroundings)));
        }

    }
}

//define keybinds
let aim_modes = ['Auto', 'Angle', 'Copy', 'Precise'];
GM_setValue('Copy Build', false);
GM_setValue('Enable Aim', false);
GM_setValue('Sync Auto Fire & Spin', false);
GM_setValue('Move to Tank', false);
GM_setValue('Aim Mode', aim_modes[0]);
GM_setValue('Auto Respawn', false);
GM_setValue('Auto Choose Tank', false);
GM_setValue('Insta Disconnect', false);
GM_setValue('Hidden Canvases', false);

//Multiboxing logic
function press(key) {
    input.onKeyDown(diep_keys[key]);
}

function unpress(key) {
    input.onKeyUp(diep_keys[key]);
}

function copy_build() {
    //console.log('starting copy_build');
    let _id = GM_getValue('Master');
    if (!_id) return;
    let _data = GM_getValue(_id);
    let _build = '';
    for (let i = 0; i < 33; i++) {
        if (_data[i] == 0) break;
        _build += _data[i];
    }
    win.input.set_convar('game_stats_build', _build);
    //console.log('copied');
}

let dir = {
    up: 'KeyW',
    left: 'KeyA',
    down: 'KeyS',
    right: 'KeyD',
}
let pressed = {
    up: false,
    left: false,
    down: false,
    right: false,
}

function move_to_tank() {
    if (you.master) return;
    /* OLD
    if (GM_getValue('Move to Tank')) {
        let your_coords = you.world_pos;
        let goal = {
            x: GM_getValue("target world X"),
            y: GM_getValue("target world Y"),
        }
        if (!goal.x || !goal.y) return;
        //now the moving logic
        if (your_coords.x < goal.x) {
            press(dir.right);
            unpress(dir.left);
        } else {
            press(dir.left);
            unpress(dir.right);
        }
        if (your_coords.y < goal.y) {
            press(dir.down);
            unpress(dir.up);
        } else {
            press(dir.up);
            unpress(dir.down);
        }
    } else {
        for (let _key in dir) {
            unpress(dir[_key]);
            pressed[_key] = false;
        }
    }
    NEW (someone helped me with that) */
    if (GM_getValue('Move to Tank')) {
        const your_coords = you.world_pos;
        const goal = {
            x: GM_getValue("target world X"),
            y: GM_getValue("target world Y"),
        };

        if (!goal.x || !goal.y) return;

        const deltaX = goal.x - your_coords.x;
        const deltaY = goal.y - your_coords.y;

        const angle = Math.atan2(deltaY, deltaX);
        const angleDeg = (Math.atan2(deltaY, deltaX) * 180 / Math.PI + 360) % 360;
        const quadrant = Math.floor((angleDeg + 22.5) / 45) % 8;


        const directionKeys = [
            [0,0,0,1],
            [0,0,1,1],
            [0,0,1,0],
            [0,1,1,0],
            [0,1,0,0],
            [1,1,0,0],
            [1,0,0,0],
            [1,0,0,1]
        ];

        const pressedKeys = directionKeys[quadrant];

        pressedKeys[0] ? press(dir.up) : unpress(dir.up);
        pressedKeys[1] ? press(dir.left) : unpress(dir.left);
        pressedKeys[2] ? press(dir.down) : unpress(dir.down);
        pressedKeys[3] ? press(dir.right) : unpress(dir.right);

    } else {
        for (let key in dir) {
            unpress(dir[key]);
        }
    }
}

//NOTE: your body has 2 identical circles for some reason, so try to avoid using win.ripsaw_api.get_your_body().
//IDEA: check closest Tank = your body. 2 circles, so smaller radius is the front one.
//IDEA2: check closest Enemy
function get_your_tank(tanks) {
    let closest = null;
    let last_d = Infinity;
    for (let tank of tanks) {
        let dx = tank.body[0].x - (canvas.width / 2);
        let dy = tank.body[0].y - (canvas.height / 2);
        let d = Math.hypot(dx, dy);
        if (d < last_d) {
            closest = tank;
            last_d = d;
        }
    }
    if (!closest) console.warn("Your Tank wasn't found yet...");
    return closest;
}

function get_your_true_color(tank) {
    if (tank.name === "Unknown Tank") return;
    if (tank.body.length === 1) return tank.body[0];
    let i = 1;
    let b1 = tank.body[0];
    let b2 = tank.body[i];
    if (!b1 || !b2) return;
    while (b1.color === b2.color && i < tank.body.length) {
        i++;
        b2 = tank.body[i];
    }
    if (b1.color === b2.color) return console.warn('duplicate');
    if (b1.radius < b2.radius) return b1.color;
    if (b2.radius < b1.radius) return b2.color;
}

function handle_clicks(data) {
    let rmc = data[35] == 1;
    let lmc = data[36] == 1;
    if (rmc) {
        press("ShiftLeft");
    } else {
        unpress("ShiftLeft");
    }

    if (lmc) {
        press("Space");
    } else {
        unpress("Space");
    }
}

function handle_aim() {
    if (!you.hasSpawned() || !GM_getValue('Enable Aim')) return;
    switch (GM_getValue('Aim Mode')) {
        case aim_modes[0]: { // Auto
            if (you.master) return;
            let surroundings = you.get_surroundings();
            let tanks = surroundings.tanks;
            let your_tank = get_your_tank(tanks);

            if (tanks && your_tank) {
                let your_team_color = get_your_true_color(your_tank);
                let enemies = [];

                for (let tank of tanks) {
                    let temp_team_color = get_your_true_color(tank);
                    console.log('enemy color: ', temp_team_color, ' your: ', your_team_color);
                    if (temp_team_color != your_team_color) enemies.push(tank);
                }

                if (enemies.length > 0) {
                    let closest = null;
                    let last_d = Infinity;
                    for (let enemy of enemies) {
                        let dx = enemy.body[0].x - (canvas.width / 2);
                        let dy = enemy.body[0].y - (canvas.height / 2);
                        let d = Math.hypot(dx, dy);
                        if (d < last_d) {
                            closest = enemy;
                            last_d = d;
                        }
                    }
                    if (closest) {
                        input.onTouchMove(-1000, closest.body[0].x, closest.body[0].y);
                        return;
                    }
                }
            }

            let full_arr = surroundings.shapes;
            let temp_arr = [...full_arr.crashers, ...full_arr.pentagons, ...full_arr.squares, ...full_arr.triangles];
            let target = win.ripsaw_api.get_closest(temp_arr);
            input.onTouchMove(-1000, ...target);
        }
        break
        case aim_modes[1]: //Angle
            if (!you.mouse.x || !you.mouse.y) return;
            if (you.master) { //save angle
                let radians_2_degrees = function(x) {
                    return (x / Math.PI) * 180;
                }
                let start = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                }
                let target = {
                    x: you.mouse.x,
                    y: you.mouse.y,
                }
                let l = {
                    x: target.x - start.x,
                    y: target.y - start.y,
                }
                let angle = radians_2_degrees(Math.atan2(l.y, l.x));
                // Normalize to [0, 360)
                if (angle < 0) angle += 360;
                GM_setValue("Master Angle", angle);
                //console.log(angle);
            } else { //apply angle
                if (!GM_getValue("Master Angle")) return;
                let degrees_2_radians = function(x) {
                    return (Math.PI / 180) * x;
                }
                let angle = GM_getValue("Master Angle");
                let radians = degrees_2_radians(angle);
                let start = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                }
                let length = Math.min(start.x, start.y);
                let aim_at = [start.x + Math.cos(radians) * length, start.y + Math.sin(radians) * length];
                input.onTouchMove(-1000, ...aim_at);
                let master_id = GM_getValue("Master");
                if (master_id) {
                    handle_clicks(GM_getValue(master_id));
                }
            }
            break
        case aim_modes[2]: //Copy
            if (you.master) {
                let tank_data = you.get_tank_data();
                let FOV = tank_data.FOV;
                let scalingFactor = FOV * windowScaling();
                let point_2_du = function(point) {
                    return point / scalingFactor;
                }
                let center = {
                    x: point_2_du(canvas.width / 2),
                    y: point_2_du(canvas.height / 2),
                }
                let mouseOffset = {
                    x: point_2_du(you.mouse.x) - center.x,
                    y: point_2_du(you.mouse.y) - center.y,
                }
                GM_setValue("Master Mouse Offset X", mouseOffset.x);
                GM_setValue("Master Mouse Offset Y", mouseOffset.y);
            } else {
                let tank_data = you.get_tank_data();
                let FOV = tank_data.FOV;
                let scalingFactor = FOV * windowScaling();
                let du_2_point = function(point) {
                    return point * scalingFactor * zoom_factor;
                }
                if (!GM_getValue("Master Mouse Offset X") || !GM_getValue("Master Mouse Offset Y")) return;
                let mouseOffset = {
                    x: du_2_point(GM_getValue("Master Mouse Offset X")),
                    y: du_2_point(GM_getValue("Master Mouse Offset Y")),
                }
                let center = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                }
                let screen = {
                    x: center.x + mouseOffset.x,
                    y: center.y + mouseOffset.y,
                }
                input.onTouchMove(-1000, screen.x, screen.y);
                let master_id = GM_getValue("Master");
                if (master_id) {
                    handle_clicks(GM_getValue(master_id));
                }
            }
            break
        case aim_modes[3]: //Precise
            if (you.master) { //store your mouse position in world coords
                let tank_data = you.get_tank_data();
                let FOV = tank_data.FOV;
                let scalingFactor = FOV * windowScaling();
                let point_2_du = function(point) {
                    return point / scalingFactor / zoom_factor;
                }
                let center = {
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                }
                let mouseOffset = {
                    x: you.mouse.x - center.x,
                    y: you.mouse.y - center.y,
                }
                let world = {
                    x: you.world_pos.x + point_2_du(mouseOffset.x),
                    y: you.world_pos.y + point_2_du(mouseOffset.y),
                }
                //console.log(you.world_pos, world);
                GM_setValue("Master Mouse World X", world.x);
                GM_setValue("Master Mouse World Y", world.y);
            } else { //set your mouse position to saved world coords
                let world = {
                    x: GM_getValue("Master Mouse World X"),
                    y: GM_getValue("Master Mouse World Y"),
                }
                if (!world.x || !world.y) return;
                let tank_data = you.get_tank_data();
                let FOV = tank_data.FOV;
                let scalingFactor = FOV * windowScaling();
                let du_2_point = function(point) {
                    return point * scalingFactor * zoom_factor;
                }
                let offset = {
                    x: (world.x - you.world_pos.x) * scalingFactor * zoom_factor,
                    y: (world.y - you.world_pos.y) * scalingFactor * zoom_factor,
                }
                let screen = {
                    x: canvas.width / 2 + offset.x,
                    y: canvas.height / 2 + offset.y,
                }

                input.onTouchMove(-1000, screen.x, screen.y);
                let master_id = GM_getValue("Master");
                if (master_id) {
                    handle_clicks(GM_getValue(master_id));
                }
            }
            break
    }
}

function sync_auto() {
    let bool = GM_getValue('Sync Auto Fire & Spin');
    let master = GM_getValue('Master');
    //console.log('Master: ', you.AutoFire, you.AutoSpin);
    if (you.master || !bool || !master) return;
    let data = GM_getValue(master);
    let f = data[33] == 1;
    let s = data[34] == 1;
    //console.log('Slave:', f, s);
    //handle AutoFire sync
    if (you.AutoFire != f) {
        input.inGameNotification(`Slave, Master: ${you.AutoFire} ${f}`);
        press("KeyE");
        unpress("KeyE");
        you.AutoFire = !you.AutoFire;
    }

    //handle AutoSpin sync
    if (you.AutoSpin != s) {
        press("KeyC");
        unpress("KeyC");
        you.AutoSpin = !you.AutoSpin;
    }
}

function tank_copy() {
    if (!GM_getValue('Auto Choose Tank')) return;
    if (you.master) {
        let tank_name = you.get_tank_data().tank_name;
        GM_setValue('Tank to upgrade', tank_name);
    } else {
        let tank_name = you.get_tank_data().tank_name;
        let lvl = you.get_tank_data().level;
        let target_name = GM_getValue('Tank to upgrade');
        if (!target_name || target_name === 'Tank') return;
        console.log(target_name);
        let instructions = upgrading_tank_path[target_name];
        for (let instruction of instructions) {
            //{required_level: lvl, required_tank: name, upgrade_color: color};
            if (
                lvl >= instruction.required_level &&
                tank_name === instruction.required_tank
            ) {
                upgrade(instruction.upgrade_color);
            }
        }
    }
}

function handle_disconnect() {
    if (GM_getValue('Insta Disconnect') && !you.master) {
        win.input.disconnect_game();
    }
}

function handle_canvas_visibility(){
    if (GM_getValue('Hidden Canvases') && !you.master) {
        win.canvas.style.display = 'none';
    }else{
        win.canvas.style.display = '';
    }
}

let delay_active = true;
let delay = 250;

function update_yourself() {
    window.requestAnimationFrame(update_yourself);
    if (!you) return;
    if (you.hasSpawned()) {
        if (!win.ripsaw_api) {
            notify_about_missing();
            return;
        }
        if (win.ripsaw_api.get_arrows() && !win.ripsaw_api.get_arrows().minimap.center.includes(0)) {
            you.update_world_pos();
        }
        if (win.input && win.input.set_convar && GM_getValue('Copy Build') && !you.master) copy_build();
        move_to_tank();
        handle_aim();
        if (delay > 0) {
            delay--;
        } else {
            delay_active = false;
        }
        if (!delay_active) sync_auto();
        tank_copy();
        handle_disconnect();
        handle_canvas_visibility();
        you.update_build(); //automatically updates setValue too, so keep that at the end
    } else {
        delay_active = true;
        delay = 500;
        you.AutoFire = false;
        you.AutoSpin = false;
        if (GM_getValue('Auto Respawn') && !you.master) {
            win.input.try_spawn('');
        }
    }
}
window.requestAnimationFrame(update_yourself);

//GUI

//init
function rewrite_spawn_name() {
    if (!win.lobby_ip) return setTimeout(rewrite_spawn_name, 100);
    const og = win.input.try_spawn;
    win.input.try_spawn = function(arg) {
        let max_l = 13;
        let l = arg.length;
        let free_space = max_l - l;
        let filler = you.id.substring(0, free_space);
        og(`${filler} ${arg}`);
    };
}
rewrite_spawn_name();

function greet_user() {
    if (!win.input || !win.input.doesHaveTank()) return setTimeout(greet_user, 250);
    input.inGameNotification('Welcome to r!Psaw Multibox!', 1000, 7500);
    input.inGameNotification('Keybinds:', 2500, 7500);
    input.inGameNotification('[B] Copy Build', 4000, 7500);
    input.inGameNotification('[V] Enable Aim', 5500, 7500);
    input.inGameNotification('[Q] Aim Mode', 7000, 7500);
    input.inGameNotification('[N] Sync Auto Fire & Spin', 8500, 7500);
    input.inGameNotification('[T] Move to Tank', 10000, 7500);
    input.inGameNotification('[R] Auto Respawn', 11500, 7500);
    input.inGameNotification('[X] Auto Choose Tank', 13000, 7500);
    input.inGameNotification('[I] Insta Disconnect', 14500, 7500);
    input.inGameNotification('[P] Hidden Canvases', 16000, 7500);
}
greet_user();

//listeners
window.addEventListener("load", function(e) {
    console.log('%c=== WELCOME TO RIPSAWS MULTIBOX ===', 'color: red');
    you = new Player();
    setInterval(() => you.save(), 50);
    win.test = you;
    let stored = localStorage.getItem('Ripsaw Multibox Ids');
    let set = stored ? new Set(JSON.parse(stored)) : new Set();

    if (!set.has(you.id)) {
        set.add(you.id);
        localStorage.setItem('Ripsaw Multibox Ids', JSON.stringify([...set]));
    }
});

window.addEventListener("focus", () => {
    focused = true;
    if (typeof you !== "undefined" && you) {
        you.master = true;
        GM_setValue("Master", you.id);
    }
});

window.addEventListener("blur", () => {
    focused = false;
    if (typeof you !== "undefined" && you) {
        you.master = false;
        GM_deleteValue("target world X");
        GM_deleteValue("target world Y");
    }
});

function apply_keybind(name, color, instruction = -1) {
    if (you.hasSpawned()) {
        let bool = !GM_getValue(name);
        let txt = bool ? 'On' : 'Off';
        GM_setValue(name, bool);
        if (instruction != -1) input.inGameNotification(instruction, color, 2500);
        input.inGameNotification(`${name}: ${txt}`, color, 2500);
    }
}

function apply_switch_keybind(name, arr, color, instruction = -1, instr_index = -1) {
    if (you.hasSpawned()) {
        let current = GM_getValue(name);
        let index = arr.indexOf(current);
        if (index === -1) return;
        let next_index = (index + 1) % arr.length;
        let next_value = arr[next_index];
        GM_setValue(name, next_value);
        if (instruction != -1 && instr_index === next_index) input.inGameNotification(instruction, color, 2500);
        input.inGameNotification(`${name}: ${next_value}`, color, 2500);
    }
}

window.addEventListener("keydown", function(e) {
    if (you) {
        switch (e.code) {
            case "KeyE":
                if (you.hasSpawned()) you.AutoFire = !you.AutoFire;
                break
            case "KeyC":
                if (you.hasSpawned()) you.AutoSpin = !you.AutoSpin;
                break
            case "ShiftRight":
            case "ShiftLeft":
                if (you.hasSpawned()) you.RightMouseClick = true;
                break
            case "Space":
                if (you.hasSpawned()) you.LeftMouseClick = true;
                break
                //Keybinds
            case "KeyB":
                apply_keybind('Copy Build', 20000, "Don't forget to press U or M when making build!");
                break
            case "KeyV":
                apply_keybind('Enable Aim', 30000);
                break
            case "KeyQ":
                apply_switch_keybind('Aim Mode', aim_modes, 40000, "Angle not recommended with Drone class", 1);
                break
            case "KeyT":
                apply_keybind('Move to Tank', 50000);
                break
            case "KeyN":
                apply_keybind('Sync Auto Fire & Spin', 60000);
                break
            case "KeyR":
                apply_keybind('Auto Respawn', 70000);
                break
            case "KeyX":
                apply_keybind('Auto Choose Tank', 80000);
                break
            case "KeyI":
                apply_keybind('Insta Disconnect', 90000);
                break
            case "KeyP":
                apply_keybind('Hidden Canvases', 100000);
                break
        }
    }
});

window.addEventListener("keyup", function(e) {
    if (you) {
        switch (e.code) {
            case "ShiftRight":
            case "ShiftLeft":
                if (you.hasSpawned()) you.RightMouseClick = false;
                break
            case "Space":
                if (you.hasSpawned()) you.LeftMouseClick = false;
                break
        }
    }
});

window.addEventListener("mousedown", function(e) {
    if (you) {
        switch (e.button) {
            case 0:
                if (you.hasSpawned()) you.LeftMouseClick = true;
                break
            case 2:
                if (you.hasSpawned()) you.RightMouseClick = true;
                break
        }
    }
});

window.addEventListener("mouseup", function(e) {
    if (you) {
        switch (e.button) {
            case 0:
                if (you.hasSpawned()) you.LeftMouseClick = false;
                break
            case 2:
                if (you.hasSpawned()) you.RightMouseClick = false;
                break
        }
    }
});

window.addEventListener("mousemove", function(e) {
    if (you) {
        you.mouse.x = e.clientX;
        you.mouse.y = e.clientY;
    }
});

//debug
setInterval(() => {
    if (!you) return;
    /*
    console.log(' ');
    console.log('Master', GM_getValue('Master'));
    console.log('your id', you.id);
    console.log('your id data', GM_getValue(you.id));
    console.log('target x', GM_getValue('target world X'));
    console.log('target y', GM_getValue('target world Y'));
    */
}, 1000);

//canvas debug
const fake_canvas = document.createElement('canvas');
let ctx = fake_canvas.getContext('2d');

function tooClose(pos) {
    const dx = pos.x - you.world_pos.x;
    const dy = pos.y - you.world_pos.y;
    return (dx * dx + dy * dy) > 750 * 750;
}


function draw_player(player, worldpos, sFactor) {
    //console.log(player, worldpos, sFactor);
    //data to world pos
    let point_2_du = function(point) {
        return point / sFactor;
    }
    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    }
    let p2o = function(point) { //point to offset
        return {
            x: point[0] - center.x,
            y: point[1] - center.y,
        }
    }
    let o2w = function(point) { //point to world
        return {
            x: worldpos.x + point_2_du(p2o(point).x),
            y: worldpos.y + point_2_du(p2o(point).y),
        }
    }
    //let's start with the body
    for (let body of player.body) {
        //console.log(body);
        switch (body.type) {
            case "circle":
                body.w_pos = o2w([body.x, body.y]);
                body.w_radius = point_2_du(body.radius);
                break
            case "Rectangle":
                //this is not working right now
                break
        }
    }
    //now the turrets
    for (let turret of player.turrets) {
        switch (turret.source_array) {
            case "other":
                turret.w_points = [];
                for (let point of turret.points) {
                    turret.w_points.push(o2w(point));
                }
                break
            case "rectangular":
                turret.w_start_coords = o2w([turret.coords.startX, turret.coords.startY]);
                turret.w_end_coords = o2w([turret.coords.endX, turret.coords.endY]);
                turret.w_width = point_2_du(turret.width);
                break
        }
    }

    //now we need out scalingFactor
    let tank_data = you.get_tank_data();
    if (!tank_data) return; //so many errors I'm going insane fr
    let FOV = tank_data.FOV;
    let scalingFactor = FOV * windowScaling();
    let du_2_point = function(point) {
        return point * scalingFactor * zoom_factor;
    }
    ctx.globalAlpha = 0.25;

    //apply turrets first
    for (let i = 0; i < player.turrets.length; i++) {
        let turret = player.turrets[i];
        if (turret.source_array === "rectangular" &&
            (!tooClose(turret.w_start_coords) && !tooClose(turret.w_end_coords))) {
            continue;
        }

        if (turret.source_array === "other" &&
            turret.w_points.every(pt => !tooClose(pt))) {
            continue;
        }

        switch (turret.source_array) {
            case "other":
                ctx.beginPath();
                for (let j = 0; j < turret.w_points.length; j++) {
                    let point = turret.w_points[j];
                    let offset = {
                        x: (point.x - you.world_pos.x) * scalingFactor * zoom_factor,
                        y: (point.y - you.world_pos.y) * scalingFactor * zoom_factor,
                    }
                    let screen = {
                        x: canvas.width / 2 + offset.x,
                        y: canvas.height / 2 + offset.y,
                    }
                    if (j == 0) {
                        //console.log('moveTo', screen);
                        ctx.moveTo(screen.x, screen.y);
                    } else {
                        //console.log('lineTo', screen);
                        ctx.lineTo(screen.x, screen.y);
                    }
                }
                ctx.closePath();
                ctx.fillStyle = "gray";
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.stroke();
                break
            case "rectangular": {
                const p1 = turret.w_start_coords;
                const p2 = turret.w_end_coords;
                const width = turret.w_width;

                // Vector from p1 to p2
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const len = Math.hypot(dx, dy);

                if (len === 0) break; // avoid divide by zero

                // Perpendicular unit vector
                const ux = -dy / len;
                const uy = dx / len;

                const halfW = width / 2;

                // 4 corners (world coords)
                const C1 = {
                    x: p1.x + ux * halfW,
                    y: p1.y + uy * halfW
                };
                const C2 = {
                    x: p1.x - ux * halfW,
                    y: p1.y - uy * halfW
                };
                const C3 = {
                    x: p2.x - ux * halfW,
                    y: p2.y - uy * halfW
                };
                const C4 = {
                    x: p2.x + ux * halfW,
                    y: p2.y + uy * halfW
                };

                // Transform to screen space
                function worldToScreen(pt) {
                    return {
                        x: canvas.width / 2 + (pt.x - you.world_pos.x) * scalingFactor * zoom_factor,
                        y: canvas.height / 2 + (pt.y - you.world_pos.y) * scalingFactor * zoom_factor
                    };
                }

                const sC1 = worldToScreen(C1);
                const sC2 = worldToScreen(C2);
                const sC3 = worldToScreen(C3);
                const sC4 = worldToScreen(C4);

                // Draw
                ctx.beginPath();
                ctx.moveTo(sC1.x, sC1.y);
                ctx.lineTo(sC2.x, sC2.y);
                ctx.lineTo(sC3.x, sC3.y);
                ctx.lineTo(sC4.x, sC4.y);
                ctx.closePath();

                ctx.fillStyle = "gray";
                ctx.fill();
                ctx.strokeStyle = "black";
                ctx.stroke();
                break;
            }
        }
    }
    ctx.globalAlpha = 1;

    ctx.beginPath();
    ctx.globalAlpha = 0.25;

    //apply body
    for (let body of player.body) {
        if (!tooClose(body.w_pos)) continue;
        let offset = {
            x: (body.w_pos.x - you.world_pos.x) * scalingFactor * zoom_factor,
            y: (body.w_pos.y - you.world_pos.y) * scalingFactor * zoom_factor,
        }
        let screen = {
            x: canvas.width / 2 + offset.x,
            y: canvas.height / 2 + offset.y,
        }
        ctx.arc(screen.x, screen.y, body.w_radius * scalingFactor * zoom_factor, 0, 2 * Math.PI);
        ctx.fillStyle = body.color;
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}

//fake shapes
const fake_shapes_colors = {
    squares: {
        fill: "#ffe869",
        stroke: "#bfae4e",
    },
    triangles: {
        fill: "#fc7677",
        stroke: "#bd5859",
    },
    pentagons: {
        fill: "#768dfc",
        stroke: "#5869bd",
    },
    crasher: {
        fill: "#f177dd",
        stroke: "#b459a5",
    },
}

function draw_shape(shape, worldpos, sFactor, type) {
    if (!shape || !worldpos || !sFactor || !type) return console.warn(shape, worldpos, sFactor);
    //data to world coords
    let point_2_du = function(point) {
        return point / sFactor;
    }
    let center = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    }
    let p2o = function(point) { //point to offset
        return {
            x: point[0] - center.x,
            y: point[1] - center.y,
        }
    }
    let o2w = function(point) { //point to world
        return {
            x: worldpos.x + point_2_du(p2o(point).x),
            y: worldpos.y + point_2_du(p2o(point).y),
        }
    }
    if (!shape['moveTo']) return console.warn(shape);
    let world_points = [o2w(shape['moveTo'])];
    //console.log(Object.keys(shape));
    let i = 1;
    while (shape[`lineTo${i}`]) {
        world_points.push(o2w(shape[`lineTo${i}`]));
        i++;
    }

    //now we need out scalingFactor
    let tank_data = you.get_tank_data();
    if (!tank_data) return; //so many errors I'm going insane fr
    let FOV = tank_data.FOV;
    let scalingFactor = FOV * windowScaling();
    let du_2_point = function(point) {
        return point * scalingFactor * zoom_factor;
    }
    ctx.beginPath();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < world_points.length; i++) {
        let offset = {
            x: (world_points[i].x - you.world_pos.x) * scalingFactor * zoom_factor,
            y: (world_points[i].y - you.world_pos.y) * scalingFactor * zoom_factor,
        }
        let screen = {
            x: canvas.width / 2 + offset.x,
            y: canvas.height / 2 + offset.y,
        }
        //let's start actually drawing now (it took way too long omfg)
        if (i == 0) {
            //console.log('moveTo', screen);
            ctx.moveTo(screen.x, screen.y);
        } else {
            //console.log('lineTo', screen);
            ctx.lineTo(screen.x, screen.y);
        }
    }
    //console.log('stroke');
    ctx.closePath();
    ctx.fillStyle = fake_shapes_colors[type].fill;
    ctx.fill();
    ctx.strokeStyle = fake_shapes_colors[type].stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
}

setTimeout(() => {
    let gui = () => {
        let c = document.getElementById('canvas');
        //console.log(c);
        if (c) {
            //console.log('the canvas loaded!');
            let original_ctx = c.getContext('2d');
            //resize canvas
            fake_canvas.width = c.width;
            fake_canvas.height = c.height;
            //draw some things
            let ids = JSON.parse(localStorage.getItem('Ripsaw Multibox Ids'));
            //console.log('ids', ids);
            for (let id of ids) {
                //console.log('going through id: ', id);
                if (you && id != you.id) { //to not redraw what you already see lol
                    let raw = {
                        worldpos: GM_getValue(`${id} WorldPos`),
                        sFactor: GM_getValue(`${id} ScalingFactor`),
                        surroundings: GM_getValue(`${id} surroundings`),
                    };
                    if (!raw.worldpos || !raw.sFactor || !raw.surroundings) break; //to prevent errors
                    let worldpos = JSON.parse(raw.worldpos);
                    let sFactor = JSON.parse(raw.sFactor);
                    let surroundings = JSON.parse(raw.surroundings);
                    //console.log('results: ', worldpos, sFactor, surroundings);
                    if (worldpos && sFactor && surroundings) {
                        for (let player of surroundings.tanks) {
                            //console.log('checking player', player);
                            draw_player(player, worldpos, sFactor);
                        }
                        //console.log('Im so sick of this shit omfg', surroundings.shapes);
                        for (let type in surroundings.shapes) {
                            //console.log(type);
                            if (surroundings.shapes[type].length > 0) {
                                for (let shape of surroundings.shapes[type]) {
                                    //console.log('checking shape', shape);
                                    draw_shape(shape, worldpos, sFactor, type);
                                }
                            }
                        }
                    }
                }
            }
            //apply context
            ctx.globalAlpha = 0.1;
            //ctx.fillRect(0, 0, 1000, 1000);
            original_ctx.drawImage(fake_canvas, 0, 0);
        }
        window.requestAnimationFrame(gui);
    };
    gui();
}, 500);

//deleting ids
window.addEventListener("beforeunload", () => {
    let raw = localStorage.getItem('Ripsaw Multibox Ids');
    let set = new Set(raw ? JSON.parse(raw) : []);
    if (set.has(you.id)) {
        set.delete(you.id);
        localStorage.setItem('Ripsaw Multibox Ids', JSON.stringify([...set]));
    }
});