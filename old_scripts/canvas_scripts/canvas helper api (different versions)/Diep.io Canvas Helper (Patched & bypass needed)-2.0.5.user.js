// ==UserScript==
// @name         Diep.io Canvas Helper (Patched & bypass needed)
// @namespace    http://tampermonkey.net/
// @version      2.0.5
// @description  canvas manipulation
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

//sadly this project is discontinued until I find a new way to hook inside canvas

let debug_visible = true; //turn this on to draw lines to shapes & Arrows
/*
Issues:
1. only YOUR drones get detected
2. base Drones require separate ratio with base
3. once drones get damage, Error occurs. Probably because of the color/opacity?

- Arrow detection √
- Shapes detection √
- Drones detection (√)

(Work in progress...)
- Player Detection
- different Drones Detection
- Bosses Detection
- Turrets Detection
- Text coordinates detect
- Scoreboard reader
- make scaling work properly
*/

//Window Scaling
function windowScaling() {
    const canvas = document.getElementById('canvas');
    const a = canvas.height / 1080;
    const b = canvas.width / 1920;
    return b < a ? a : b;
}

//COLOR GETTER SCRIPT (by r!Psaw, aka me :P )
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

//single use
//let diep_user_colors = update_your_colors();
//loop
let diep_user_colors;

function update_colors() {
    window.requestAnimationFrame(update_colors);
    if (input && window.lobby_ip) {
        diep_user_colors = update_your_colors();
        //console.log("updated colors:");
        //console.log(diep_user_colors);
    }
}
window.requestAnimationFrame(update_colors);

function get_hex(convar) {
    let diep_hex = input.get_convar(convar);
    let normal_hex = "#" + diep_hex.split("x")[1];
    return normal_hex;
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

function update_your_colors() {
    let temp_container = {
        background: get_hex("ren_background_color"),
        bar_background: get_hex("ren_bar_background_color"),
        border: get_hex("ren_border_color"),
        grid: get_hex("ren_grid_color"),
        healthbar_back: get_hex("ren_health_background_color"),
        healthbar_front: get_hex("ren_health_fill_color"),
        minimap: get_hex("ren_minimap_background_color"),
        minimap_border: get_hex("ren_minimap_border_color"),
        scorebar: get_hex("ren_score_bar_fill_color"),
        solid_border: get_hex("ren_stroke_solid_color"),
        xp_bar: get_hex("ren_xp_bar_fill_color"),
        ui1: get_hidden("UI", 1),
        ui2: get_hidden("UI", 2),
        ui3: get_hidden("UI", 3),
        ui4: get_hidden("UI", 4),
        ui5: get_hidden("UI", 5),
        ui6: get_hidden("UI", 6),
        ui7: get_hidden("UI", 7),
        smasher_and_dominator: get_hidden("NET", 0),
        barrels: get_hidden("NET", 1),
        body: get_hidden("NET", 2),
        blue_team: get_hidden("NET", 3),
        red_team: get_hidden("NET", 4),
        purple_team: get_hidden("NET", 5),
        green_team: get_hidden("NET", 6),
        shiny_shapes: get_hidden("NET", 7),
        square: get_hidden("NET", 8),
        triangle: get_hidden("NET", 9),
        pentagon: get_hidden("NET", 10),
        crasher: get_hidden("NET", 11),
        arena_closers_neutral_dominators: get_hidden("NET", 12),
        scoreboard_ffa_etc: get_hidden("NET", 13),
        maze_walls: get_hidden("NET", 14),
        others_ffa: get_hidden("NET", 15),
        necromancer_squares: get_hidden("NET", 16),
        fallen_bosses: get_hidden("NET", 17)
    }
    return temp_container;
};

//Actual script:
//variables
const crx = CanvasRenderingContext2D.prototype;
const methods = [
    'beginPath',
    'setTransform',
    'drawImage',
    'arc',
    'moveTo',
    'lineTo',
    'fill',
    'fillRect',
    'fillText',
    'stroke',
    'strokeRect',
    'strokeText',
    'clearRect',
    'createPattern'
];
const patterns = { //set debug_visible to false when using these
    arc: ['setTransform', 'arc', 'fill'],
    triangle: ["setTransform", "moveTo", "lineTo", "lineTo", "fill"],
    square: ["setTransform", "moveTo", "lineTo", "lineTo", "lineTo", "fill"],
    pentagon: ["setTransform", "moveTo", "lineTo", "lineTo", "lineTo", "lineTo", "fill"],
    //game_screen: ['setTransform', 'moveTo', 'lineTo', 'lineTo', 'fill', 'setTransform', 'strokeRect'], //I'm not sure about this one so I won't use it for now
    grid: ["setTransform",
  "moveTo",
  "lineTo",
  "moveTo",
  "lineTo",
  "setTransform",
  "stroke",
  "createPattern"],
}

const ratios_to_body = { //drones are paused for now
    drones: { //warning Rocketeer bullet gets detected too, Fix!
        triangle: {
            over: 0.97, //big 0.98
            battleship: 0.47, //big 0.48
            base: 0.96,
            //guardian: 0,
        },
        square: {
            //summoner: 0,
            necro: 0.97,
            //necromancer_body is 1.78
        }
    }
}

const turrets_of_tank = { //only rectangular tanks for now
    //Tank Name: [ [Amount1, TurretName1], [Amount2, TurretName2] ]
    'Tank': [[1,'Tank']],
    'Twin': [[2,'Tank']],
    'Triple Shot': [[3, 'Tank']],
    'Quad Tank': [[4, 'Tank']],
    'Octo Tank': [[8, 'Tank',]],
    'Triplet': [[2, 'Fighter'], [1, 'Tank']],
    'Twin Flank': [[4, 'Tank']], //!Problem! same turrets as Quad Tank. Possible solution: Angle check
    'Triple Twin': [[6, 'Tank']],
    'Assassin': [[1, 'Ranger']],
    'Ranger': [[1, 'Ranger']], //!Problem! same turret as Assassin. Possible solution: Ranger addon check
    'Gunner': [[2, 'Gunner(small)'], [2, 'Gunner(big)']],
    'Spread Shot': [[1, 'Tank'], [2, 'Spread1'], [2, 'Spread2'], [2, 'Spread3'], [2, 'Spread4'], [2, 'Sniper']],
    'Tri-Trapper': [[3, 'Trapper']],
    'Mega Trapper': [[1, 'Mega Trapper']],
    'Gunner Trapper': [[2, 'Gunner Trapper'], [1, 'Mega Trapper']],
    'Trapper': [[1, 'Trapper']],
    'Fighter': [[1, 'Tank'], [4, 'Fighter']],
    'Booster': [[1, 'Tank'], [2, 'Fighter'], [2, 'Booster']],
    'Hunter': [[1, 'Sniper'], [1, 'Hunter']],
    'Predator': [[1, 'Sniper'], [1, 'Hunter'], [1, 'Predator']],
    'Penta Shot': [[1, 'Sniper'], [2, 'Tank'], [2, 'Fighter']],
    'Destroyer': [[1, 'Destroyer']],
    'Tri-Angle': [[1, 'Tank'], [2, 'Fighter']],
    'Flank Guard': [[1, 'Tank'], [1, 'Fighter']],
    'Sniper': [[1, 'Sniper']],
    'Annihilator': [[1, 'Anni']],
    //'Streamliner': [[1, 'Sniper'], [1, 'Fighter'], [1, 'Booster'], //rest is unknown],
}

const TurretRatios = [
    {
        name: "Destroyer",
        ratio: 95 / 71.4,
    },
    {
        name: "Anni",
        ratio: 95 / 96.6,
    },
    {
        name: "Fighter",
        ratio: 80 / 42,
    },
    {
        name: "Booster",
        ratio: 70 / 42,
    },
    {
        name: "Tank",
        ratio: 95 / 42,
    },
    {
        name: "Sniper",
        ratio: 110 / 42,
    },
    {
        name: "Ranger",
        ratio: 120 / 42,
    },
    {
        name: "Hunter",
        ratio: 95 / 56.7,
    },
    {
        name: "Predator",
        ratio: 80 / 71.4,
    },
    {
        name: "Mega Trapper",
        ratio: 60 / 54.6,
    },
    {
        name: "Trapper",
        ratio: 60 / 42,
    },
    {
        name: "Gunner Trapper",
        ratio: 95 / 26.6,
    },
    {
        name: "Predator",
        ratio: 95 / 84.8,
    },
    {
        name: "Gunner(small)",
        ratio: 65 / 25.2,
    },
    {
        name: "Gunner(big)",
        ratio: 85 / 25.2,
    },
    {
        name: "Spread1",
        ratio: 89 / 29.4,
    },
    {
        name: "Spread2",
        ratio: 83 / 29.4,
    },
    {
        name: "Spread3",
        ratio: 71 / 29.4,
    },
    {
        name: "Spread4",
        ratio: 65 / 29.4,
    },
];

/* tried to use this with fov, but nvm
const sizes = { //length of 1 line / Field of view
    shapes: {
        square: 84,
        triangle: 102.88,
        pentagon: 95.22,
        big_pentagon: 253.92,
        crasher: 54.2,
        big_crasher: 85.17,
    },
    drones: {
        over: 86.07, //min 55.62
        necro: 84.1,
        battleship: 42.22, //min 27.25
        base: 55.55,
        //summoner: 0,
        //guardian: 0,
    },
    body: {
        necromancer: 153.98,
        factory: 153.98, //min 99.38
        //summoner: 0,
        //guardian: 0,
    },
    turrets: {}//do this later
}
*/

let bosses = {
    fallen_booster: {
        x: null,
        y: null
    },
    fallen_ol: {
        x: null,
        y: null
    },
    necromancer: {
        x: null,
        y: null
    },
    guardian: {
        x: null,
        y: null
    }
}
let circles = {
    all: [],
};
let turrets = {
    rectangular: [],
}
let texts = {
    all: [],
    /*
    scoreboard: [],
    fps: [],
    ms: [],
    players: [],
    boss: [],
    arena_closers: [],
    notifications: [],
    */
};
let drones = {
    over: [], //overlord, overseer, manager, hybrid, overtrapper
    necro: [],
    battleship: [],
    base: [],
    summoner: [],
    guardian: [],
    trash: [] //put all drones here that don't meet right conditions to avoid errors
}
let shapes = {
    squares: [],
    crashers: [],
    triangles: [],
    pentagons: [],
}
let arrows = {
    leader: {
        moveTo: [0, 0],
        lineTo1: [0, 0],
        lineTo2: [0, 0],
        center: [0, 0]
    },
    minimap: {
        moveTo: [0, 0],
        lineTo1: [0, 0],
        lineTo2: [0, 0],
        center: [0, 0]
    },
    dimension: { //invisible arrow, used to determine minimap size
        moveTo: [0, 0],
        lineTo1: [0, 0],
        lineTo2: [0, 0],
        center: [0, 0]
    },
}

let placeholder = [ // script will work with this data, to store it in the actual one. This is done, because canvas api is retarded
    circles,
    turrets,
    texts,
    bosses,
    drones,
    shapes,
    arrows
];

//classes
class Player { //it is important to save player stats for later calculations
    constructor(level, FOV, tank) {
        this.level = level;
        this.FOV = FOV;
        this.tank = tank;
        this.body = []; //dark + light circle OR square
    }
    update_value(type, value) {
        this[type] = value;
    }
}

class Proxy_communicator {
    constructor() {
        this.last = null;
        this.order = [];
        this.lines = []; //store xy from lineTo's here, because lineTo proxy class can only save 1 at the time
        this.transform = [0, 0, 0, 0, 0, 0];
        //scaling
        this.dpr = window.devicePixelRatio;
        this.windowScaling = windowScaling();
        this.scalingFactor = 0.55 * this.windowScaling;
    }
    announce(proxy_class) {
        if (is_beginPath(proxy_class.name)) {
            this.last = proxy_class;
            this.order = [];
            return
        }

        this.last = proxy_class;
        this.order.push(proxy_class.name);

        /*
        console.log(`
        announced:
        last ${this.last.name}
        order ${this.order}
        `);
        */

    }
    has_pattern(pattern) {
        //console.log('used pattern:');
        //console.log(pattern);
        //console.log('current order:');
        //console.log(this.order);

        let o_l = this.order.length;
        let p_l = pattern.length;

        /*
        console.log(`
        order length: ${o_l}
        pattern length: ${p_l}
        `);
        */

        let counter = 0;
        if (o_l != p_l) {
            return false;
        }

        //console.log('first condition met!');

        for (let i = 0; i < o_l; i++) {
            /*
            console.log(`
            i ${i}
            pattern[i] ${pattern[i]}
            this.order[i] ${this.order[i]}
            counter ${counter}
            `);
            */

            if (pattern[i] === this.order[i]) {
                counter++;
            }
        }

        //console.log(`final ${counter === p_l}`);

        return (counter === p_l);
    }
    update_scaling(player_class) {
        this.dpr = window.devicePixelRatio;
        this.windowScaling = windowScaling();
        this.scalingFactor = player_class.FOV * this.windowScaling;
    }
}

class Proxy_class {
    constructor(method) {
        this.name = method;
        this.calls = 0;
        this.target = null;
        this.thisArgs = null;
        this.args = null;
        this.screenXY = [null, null];
    }
    update_tta(target, thisArgs, args) {
        if (is_beginPath(this.name)) {
            //console.log(`beginPath detected, resetting and quitting...`);

            reset_calls();
            return
        }

        /*
        console.log(`
        update_tta called on Proxy_class.name ${this.name}
        with arguments:
        ${target}
        ${thisArgs}
        ${args}
        `);
        */

        this.target = target;
        this.thisArgs = thisArgs;
        this.args = args;
    }
}

const _player = new Player(1, 0.55, 'Tank');
const communicator = new Proxy_communicator();
let method_classes = [];

//functions
function calculate_distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function is_point_inside_circle(point, circle){
    let distance = calculate_distance(point.x, point.y, circle.x, circle.y);
    //console.log(`distance: ${distance} radius ${circle.radius}`);
    return (distance < circle.radius);
}

function is_color(key, color) {
    if (!diep_user_colors) {
        return false;
    }
    return color === diep_user_colors[key];
}

function find_your_tank_body() {
    if (!extern.doesHaveTank()) {
        return [];
    }
    let tank_body = {
        back_arc: null,
        front_arc: null
    };
    let arr = circles.all;
    let w = canvas.width / 2;
    let h = canvas.height / 2;
    let l = arr.length;
    let closest_index = 0;
    let d = calculate_distance(0, 0, w, h);
    for (let i = 0; i < l; i++) {
        let x = arr[i].get('x');
        let y = arr[i].get('y');
        let temp_d = calculate_distance(x, y, w, h);
        if (temp_d < d) {
            d = temp_d;
            closest_index = i;
            tank_body.front_arc = arr[i];
        } else if (temp_d === d) {
            tank_body.back_arc = arr[i - 1];
        }
    }
    return tank_body;
}

/* tried to use this for FOV, but won't for now. Maybe in the future
function find_type_by_size(array, value){ //do not use negative numbers for this
    let temp = {
        key: null,
        val: null,
        diff: null
    }
    for(let key in array){
        //console.log(temp);
        if(temp.val === null){
            temp.key = key;
            temp.val = array[key];
            temp.diff = Math.abs(array[key] - value);
        }else{
            let temp_diff = Math.abs(array[key] - value);
            if(temp_diff < temp.diff){
                temp.key = key;
                temp.val = array[key];
                temp.diff = temp_diff;
            }
        }
    }
    return temp.key;
}
*/
function drone_ratio_check(ratio, shape) {
    for (let r in ratios_to_body.drones[shape]) {
        let your_ratio = parseInt((ratio).toFixed(2));
        let ratio_2_check = ratios_to_body.drones[shape][r];
        if (your_ratio >= ratio_2_check - 0.01 &&
            your_ratio <= ratio_2_check + 0.01) {
            return r;
        }
    }
    return 'trash';
}

function is_beginPath(name) {
    //console.log(`is_beginPath called with ${name}`);

    return (name === 'beginPath');
}

function start_proxies() {
    //console.log('start_proxies called');

    methods.forEach(start_proxy);
    Object.freeze(crx);
}

function define_current(method) {
    /*
    console.log(`
    define_current called with
    ${method}
    returning argument:
    ${method_classes.find((element) => element.name === method)}
    `);
    */

    return method_classes.find((element) => element.name === method);
}

function start_proxy(method) {
    //console.log(`start_proxy called with ${method}`);

    //define class outside proxies, to avoid repetition
    let current = new Proxy_class(method);
    method_classes.push(current);

    //console.log(`${current} created a new Proxy_class & pushed inside method_classes, check:`);
    //console.log(method_classes);

    crx[method] = new Proxy(crx[method], {
        apply(target, thisArgs, args) {
            (method === "strokeText" && thisArgs.canvas.id !== "canvas") ? thisArgs.canvas._txt = args[0]: null; //define property for text
            /*
            if(diep_user_colors && thisArgs.fillStyle === diep_user_colors.barrels){
                console.log(`order: ${communicator.order}`);
                console.log(`color detected at ${method}. Args: ${args}`);
            }
            */
            current = define_current(method);

            //console.log(`current redefined inside proxy: ${method} to ${current}`);

            current.update_tta(target, thisArgs, args);
            current.calls++;
            communicator.announce(current);
            console.log(args);

            handle_proxy(method, {
                target: target,
                thisArgs: thisArgs,
                args: args
            });
            //logic
            return Reflect.apply(target, thisArgs, args);
        }
    });
}

//FOV finder
let fov_factors = [0.699, 0.8, 0.85, 0.899];
let fov_tanks = {
    0.699: ["Ranger"],
    0.8: ["Assassin", "Stalker"],
    0.85: ["Predator", "Streamliner", "Hunter"],
    0.899: ["Sniper", "Overseer", "Overlord", "Necromancer", "Manager", "Trapper", "Gunner Trapper", "Overtrapper", "Mega Trapper", "Tri-Trapper", "Smasher", "Landmine", "Streamliner", "Auto Trapper", "Battleship", "Auto Smasher", "Spike", "Factory", "Skimmer", "Glider", "Rocketeer"]
};

function find_fieldFactor(tank) {
    let fieldFactor = 1;
    let l = fov_factors.length;
    for (let i = 0; i < l; i++) {
        if (fov_tanks[fov_factors[i]].includes(tank)) {
            fieldFactor = fov_factors[i];
        }
    }
    return fieldFactor;
}

function calculateFOV(Fv, l) {
    const numerator = 0.55 * Fv;
    const denominator = Math.pow(1.01, (l - 1) / 2);
    return (numerator / denominator);
}
//

function unscale(value) {
    return Math.floor(value / communicator.scalingFactor);
}

function handle_turrets(args, color){ //rectangular turrets
    let l = TurretRatios.length;
    let i = 0;
    let ratio_match = false;
    for(i; i < l; i++){
        if(Math.abs(args[0] / args[3]).toFixed(3) == (TurretRatios[i].ratio).toFixed(3)){
            ratio_match = true;
            break
        }
    }
    let color_match = is_color('barrels', color);
    if(color_match && ratio_match){
        //console.log('TURRET FOUND');
        let temp_sizes = {
            angle: Math.atan2(args[2], args[3]) || 0,
            width: Math.hypot(args[3], args[2]),
            length: Math.hypot(args[0], args[1]),
        }
        let start_coords = {
            x: args[4] - Math.cos(temp_sizes.angle + Math.PI / 2) * temp_sizes.width / 2,
            y: args[5] + Math.sin(temp_sizes.angle + Math.PI / 2) * temp_sizes.width / 2,
        }
        let end_coords = {
            x: start_coords.x + temp_sizes.length * Math.cos(-temp_sizes.angle),
            y: start_coords.y + temp_sizes.length * Math.sin(-temp_sizes.angle)
        };
        let temp_turret = {
            name: TurretRatios[i].name,
            coords: {
                startX: start_coords.x,
                startY: start_coords.y,
                endX: end_coords.x,
                endY: end_coords.y
            },
            angle: temp_sizes.angle,
            reversedAngle: -temp_sizes.angle,
            width: temp_sizes.width,
            length: temp_sizes.length,
        }
        if(
            temp_turret.coords.startX >= 0 &&
            temp_turret.coords.startY >= 0 &&
            temp_turret.coords.endX >= 0 &&
            temp_turret.coords.endY >= 0){
            placeholder.turrets.rectangular.push(temp_turret);
        }
    }
}

function handle_proxy(type, values) {
    //console.log(`working on proxy ${type}`);
    let current = define_current(type);
    let x, y;
    switch (type) {
        case 'setTransform':
            communicator.setTransform = values.args;
            handle_turrets(values.args, values.thisArgs.fillStyle);
            break
        case 'fill':
            if (communicator.has_pattern(patterns.arc)) {
                x = communicator.setTransform[4];
                y = communicator.setTransform[5];
                let target = define_current('arc');
                target.screenXY = [x, y];
                /*debug({
                    x: x,
                    y: y
                });*/
                //console.log(`arc updated coords ${target.screenXY}`);

                let temp_circle = new Map();
                temp_circle.set('x', x);
                temp_circle.set('y', y);
                temp_circle.set('radius', communicator.setTransform[0]);
                temp_circle.set('color', target.thisArgs.fillStyle);
                placeholder.circles.all.push(temp_circle);
                //console.log(circles);
                let you = find_your_tank_body();
                _player.body = you;
                //let your_radius = you instanceof Map ? you.get('radius') : 1;
                //let your_radius_unscaled = unscale(your_radius);
                //console.log(your_radius_unscaled);

            } else if (communicator.has_pattern(patterns.triangle)) {
                //console.log(values.thisArgs.fillStyle);
                //console.log(values.thisArgs.globalAlpha);
                if (is_arrow(values.thisArgs)) {
                    switch (true) {
                        case (values.thisArgs.globalAlpha === 0.3499999940395355):
                            update_arrow('leader');
                            break
                        case (values.thisArgs.globalAlpha > 0.9):
                            update_arrow('minimap');
                            break
                    }
                }

                if (is_shape('triangle', values.thisArgs)) {
                    //console.log('TRIANGLE FOUND');
                    update_shape('triangle');
                }

                if (is_shape('crasher', values.thisArgs)) {
                    //console.log('TRIANGLE FOUND');
                    update_shape('crasher');
                }

                if (is_drone(values.thisArgs)) {
                    update_drone(values.thisArgs.fillStyle);
                }
            } else if (communicator.has_pattern(patterns.square)) {
                if (is_shape('square', values.thisArgs)) {
                    //console.log('SQUARE FOUND');
                    update_shape('square');
                }

                if (is_drone(values.thisArgs)) {
                    update_drone(values.thisArgs.fillStyle);
                }
            } else if (communicator.has_pattern(patterns.pentagon)) {
                if (is_shape('pentagon', values.thisArgs)) {
                    //console.log('PENTAGON FOUND');
                    update_shape('pentagon');
                }
            }
            break
        case 'moveTo':
            current.screenXY = [values.args[0], values.args[1]];
            //console.log(`moveTo updated coords ${current.screenXY}`);
            //logic for shape & arrow recognition
            break
        case 'lineTo':
            current.screenXY = [values.args[0], values.args[1]];
            //console.log(`lineTo updated coords ${current.screenXY}`);
            communicator.lines.push(current.screenXY);
            //console.log('lineTo updated inside communicator:');
            //console.log(communicator.lines);
            //logic for shape & arrow recognition
            break
        case 'drawImage':
            x = communicator.setTransform[4];
            y = communicator.setTransform[5];
            current.screenXY = [x, y];
            if (values.args[0]._txt && x > 0 && y > 0) { //thank you Mi300 for explaining this part
                let temp = {
                    text: values.args[0]._txt,
                    drawImage: {
                        x: x,
                        y: y
                    },
                    center: {
                        x: x + values.args[1] + values.args[0].width / 2,
                        y: y + values.args[2] + values.args[0].height / 2,
                    },
                    setTransform: communicator.setTransform,
                }
                placeholder.texts.all.push(temp);
            }
            break
        case 'fillText':
            //detect data for FOV
            if (values.args[0].startsWith("Lvl ") && extern.doesHaveTank()) {
                let dpr = 1;
                if (window.dpr) {
                    dpr = window.dpr;
                }
                let words = values.args[0].split(" ");
                _player.update_value('level', words[1]);
                _player.update_value('tank', words.slice(2).join(" ").trim());
                let fieldFactor = find_fieldFactor(_player.tank);
                _player.update_value('FOV', calculateFOV(fieldFactor, _player.level) * dpr);
                communicator.update_scaling(_player);
                console.log(`
            %c[Canvas Helper] FOV value was changed, look :0

            tank: ${_player.tank}
            level: ${_player.level}
            fieldFactor: ${fieldFactor}
            FOV: ${_player.FOV}
            `, "color: brown");
            }
            break
        default: {
            //add logic
        }
    }
}

function is_drone(context) {
    let teams = ['red_team', 'blue_team', 'green_team', 'purple_team'];
    let other = ['necromancer_squares'];
    let color_found = false;
    for (let team of teams) {
        if (is_color(team, context.fillStyle)) {
            color_found = true;
        }
    }
    for (let color of other) {
        if (is_color(color, context.fillStyle)) {
            color_found = true;
        }
    }
    //console.log(color_found);
    return color_found;
}

function is_arrow(context) {
    return (context.fillStyle === '#000000');
}

function is_shape(type, context) {
    return is_color(type, context.fillStyle);
}

function find_drone_type(drone_color) {
    let shape = (communicator.lines.length === 2) ? 'triangle' : 'square';
    let colors = ['red_team', 'blue_team', 'green_team', 'purple_team', 'necromancer_squares'];
    let output, drone;
    for (let color of colors) {
        (is_color(color, drone_color)) ? output = color: null;
    }
    if (output === 'necromancer_squares' && shape != 'square') {
        throw Error(`shape: ${shape} expected: square`);
    }
    drone = {
        team: output,
        shape: shape
    };
    //console.log(drone);
    return drone;
}

function get_average(points) {
    let result = [0, 0];
    for (let point of points) {
        result[0] += point[0];
        result[1] += point[1];
    }
    result[0] /= points.length;
    result[1] /= points.length;
    return result;
}

function update_drone(color) { //Necromancer & Factory body gets detected too
    //console.log(color);
    let type = find_drone_type(color);
    let moveTo = define_current('moveTo').screenXY;
    let points = [moveTo];
    let point_num = 1;
    let drone = new Map(); //used a map instead of Array, because I can't push a key with a value
    drone.set('team', type.team);
    drone.set('shape', type.shape);
    drone.set('moveTo', moveTo);

    for (let line of communicator.lines) {
        points.push(line);
        drone.set(`lineTo${point_num}`, line);
        point_num++;
    }
    //console.log(points);
    drone.set('center', get_average(points));

    // !!!debug!!!
    let f, cent, vector;
    switch (type.shape) {
        case 'triangle':
            f = 2.5;
            cent = {
                x: drone.get('center')[0],
                y: drone.get('center')[1]
            };
            vector = {
                x: moveTo[0] - cent.x,
                y: moveTo[1] - cent.y
            };
            drone.set('vector', vector);
            debug({
                x: moveTo[0] + (vector.x * f),
                y: moveTo[1] + (vector.y * f)
            }, {
                x: drone.get('center')[0],
                y: drone.get('center')[1]
            });
            break
        case 'square':
            cent = {
                x: drone.get('center')[0],
                y: drone.get('center')[1]
            };
            debug({
                x: cent.x,
                y: cent.y
            });
            break
    }
    // !!!debug!!!

    let a = calculate_distance(points[0][0], points[0][1], points[1][0], points[1][1]);

    /*
    if (_player.body.front_arc && _player.body.back_arc) {
        console.log(`
        type: ${type.team} ${type.shape}
        a: ${a.toFixed(2)} back radius: ${(_player.body.back_arc.get('radius')).toFixed(2)} front radius: ${(_player.body.front_arc.get('radius')).toFixed(2)}
        back ratio: ${(a/_player.body.back_arc.get('radius')).toFixed(2)} front ratio: ${(a/_player.body.front_arc.get('radius')).toFixed(2)}
        `);
    }
    
    if(_player.body.front_arc && _player.body.back_arc){
        let final = drone_ratio_check(a/_player.body.front_arc.get('radius'), type.shape);
        //placeholder.drones[final].push(drone);
    }
    */
    //let unscaled_a = unscale(a);
    //console.log(`${type.team} ${type.shape} original a ${a} with FOV: ${unscale(a)}`);
    //let final = find_type_by_size(sizes.drones, unscaled_a);
    //console.log(final);

    //Logic to separate drones from square tank bodies & separate base drones from over drones
    //placeholder.drones;
}

function update_shape(type) {
    let plural = type + 's'; //triangle = shapes.triangles
    //basically constructing the shape from information stored
    let moveTo = define_current('moveTo').screenXY;
    let points = [moveTo];
    let point_num = 1;
    let shape = new Map(); //used a map instead of Array, because I can't push a key with a value
    shape.set('moveTo', moveTo);

    for (let line of communicator.lines) {
        points.push(line);
        shape.set(`lineTo${point_num}`, line);
        point_num++;
    }
    //console.log(points);
    shape.set('center', get_average(points));
    debug({
        x: shape.get('center')[0],
        y: shape.get('center')[1]
    });
    //console.log(shape);
    //adding the new made shape inside global array of shapes
    placeholder.shapes[plural].push(shape);
    //console.log(shapes[plural]);

    let a = calculate_distance(points[0][0], points[0][1], points[1][0], points[1][1]);
    //sizes.shapes[type] = a;
    //console.log(`length of ${type} shape is ${unscale(a)} with _player.FOV`);;
}

function update_arrow(type) {
    let moveTo = define_current('moveTo');
    let points = [moveTo.screenXY, communicator.lines[0], communicator.lines[1]];
    placeholder.arrows[type].moveTo = points[0];
    placeholder.arrows[type].lineTo1 = points[1];
    placeholder.arrows[type].lineTo2 = points[2];
    placeholder.arrows[type].center = get_average(points);
    debug({
        x: placeholder.arrows[type].center[0],
        y: placeholder.arrows[type].center[1]
    });
    //let ctx = canvas.getContext('2d');
    //ctx.fillRect(Arrows[type].center[0], Arrows[type].center[1], 150, 150);
    //console.log(Arrows[type]);
}

function placeholder_apply() {
    // Ensure `placeholder` properties exist before copying
    if (!placeholder.circles) placeholder.circles = {
        all: [],
    };
    if (!placeholder.turrets) placeholder.turrets = {
        rectangular: [],
    };
    if (!placeholder.texts) placeholder.texts = {
        all: [],
    };
    if (!placeholder.bosses) placeholder.bosses = {
        fallen_booster: [],
        fallen_ol: [],
        necromancer: [],
        guardian: [],
    };
    if (!placeholder.shapes) placeholder.shapes = {
        squares: [],
        crashers: [],
        triangles: [],
        pentagons: []
    };
    if (!placeholder.drones) placeholder.drones = {
        over: [],
        necro: [],
        battleship: [],
        base: [],
        summoner: [],
        guardian: []
    };
    if (!placeholder.arrows) placeholder.arrows = {
        leader: {},
        minimap: {},
        dimension: {}
    };

    // Manually deep copy objects to avoid JSON issues
    circles = structuredClone(placeholder.circles);
    turrets = structuredClone(placeholder.turrets);
    texts = structuredClone(placeholder.texts);
    bosses = structuredClone(placeholder.bosses);
    shapes = structuredClone(placeholder.shapes);
    drones = structuredClone(placeholder.drones);
    arrows = structuredClone(placeholder.arrows);

    // Reset placeholder arrays properly
    for (let key in placeholder) {
        if (typeof placeholder[key] === 'object' && placeholder[key] !== null) {
            for (let key2 in placeholder[key]) {
                if (Array.isArray(placeholder[key][key2])) {
                    placeholder[key][key2] = []; // Reset nested arrays
                }
            }
        }
    }
}

function reset_coords() {
    window.requestAnimationFrame(reset_coords);
    //console.log('called reset_coords');
    placeholder_apply();

    method_classes.forEach(reset_coord);
}
window.requestAnimationFrame(reset_coords);

function reset_coord(method_class) {
    //console.log(`called reset_coord with ${method_class}`);

    method_class.screenXY = [null, null];
}

function reset_calls() {
    //console.log(`called reset_calls`);

    communicator.lines = [];
    method_classes.forEach(reset_call);
}

function reset_call(method_class) {
    //console.log(`called reset_call with ${method_class}`);

    method_class.calls = 0;
}

function array_or_map(object) {
    let answer = 'neither';
    (object instanceof Map) ? answer = 'Map': (object instanceof Array) ? answer = 'Array' : null;
    return answer;
}

function countWord(arr, word) {
    return arr.filter(item => item === word).length;
}

function turrets_2_tank(turret_names){ //example: ['Tank', 'Tank', 'Twin']
    for(let tank_name in turrets_of_tank){
        let arr = turrets_of_tank[tank_name];
        let l = arr.length;
        let matches = 0;
        for(let i = 0; i < l; i++){
            let count = countWord(turret_names, arr[i][1])
            if(count === arr[i][0]){
                matches++;
            }
            if(matches === l){
                return tank_name;
            }
        }
    }
}

function construct_tanks(){
    window.requestAnimationFrame(construct_tanks);
    let l1 = circles.all.length;
    let l2 = turrets.rectangular.length;
    let temp_tanks = [];
    for(let i = 0; i < l1; i++){
        let turrets_found = 0;
        let temp_tank = {
            body: [],
            turrets: [],
            name: null
        };
        for(let j = 0; j < l2; j++){
            let circle = {
                radius: circles.all[i].get('radius'),
                x: circles.all[i].get('x'),
                y: circles.all[i].get('y'),
            }
            let point = {
                x: turrets.rectangular[j].coords.startX,
                y: turrets.rectangular[j].coords.startY
            }
            //console.log(point);
            //console.log(circle);
            if(is_point_inside_circle(point, circle)){
                //console.log('turret detected');
                temp_tank.turrets.push(turrets.rectangular[j]);
                turrets_found++;
            }
        }
        if(turrets_found>0){
            temp_tank.body.push(circles.all[i]);
            temp_tanks.push(temp_tank);
            let arr = [];
            let l3 = temp_tank.turrets.length;
            for(let j = 0; j < l3; j++){
                arr.push(temp_tank.turrets[j].name);
            }
            temp_tank.name = turrets_2_tank(arr);
        }
        let x, y;
        if(temp_tank.body[0]){
            x = temp_tank.body[0].get('x');
            y = temp_tank.body[0].get('y');
            debug({x:x, y:y});
        }
    }
    //console.log(temp_tanks);
}
window.requestAnimationFrame(construct_tanks);

function debug(to, from = {
    x: canvas.width / 2,
    y: canvas.height / 2
}) {
    if (!debug_visible) {
        return;
    }
    let ctx = canvas.getContext('2d');
    let original_ga = ctx.globalAlpha;
    let original_lw = ctx.lineWidth;
    ctx.globalAlpha = 1;
    ctx.lineWidth = 1;
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.globalAlpha = original_ga;
    ctx.lineWidth = original_lw;
}

/* === external operations === */

class API {
    constructor() {
        //
    }
    get_closest(array) {
        let pos = {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
        let smallest = {
            element: null,
            distance: canvas.width + canvas.height
        }
        let l = array.length;
        for (let i = 0; i < l; i++) {
            let target = array[i];
            if (array_or_map(target) === 'Map') {
                target = array[i].get('center');
            }
            let d = calculate_distance(pos.x, pos.y, target[0], target[1]);
            if (smallest.distance > d) {
                smallest.element = target;
                smallest.distance = d;
            }
        }
        return smallest.element;
    }
    toggle_debug() {
        debug_visible = !debug_visible;
    }
    get_FOV() {
        return _player.FOV;
    }
}

window.ripsaw_api = new API();

function update_api_values(){
    window.requestAnimationFrame(update_api_values);
    //
}
window.requestAnimationFrame(update_api_values);

/*
function get_side_length(category, type) {
    let size = (sizes[category][type] != 0) ? sizes[category][type] : 'not found yet';
    return size;
}
*/

function find_text(text, mode = 'strict', save = 'no') {
    //Note: text that is being updated very quickly (like Lvl 1 Tank) will not get detected properly
    let current = define_current('fillText');
    let result;
    if (mode === 'strict') {
        (current.args[0] === text) ? result = current.args[0]: null;
    } else {
        (current.args[0].includes(text)) ? result = current.args[0]: null;
    }
    return result;
}

function test_external_operations() {
    //console.log(turrets);
}
setInterval(test_external_operations, 500);

//init
start_proxies();