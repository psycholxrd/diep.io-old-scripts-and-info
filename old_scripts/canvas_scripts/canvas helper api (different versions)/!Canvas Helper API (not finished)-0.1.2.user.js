// ==UserScript==
// @name         !Canvas Helper API (not finished)
// @namespace    http://tampermonkey.net/
// @version      0.1.2
// @description  canvas manipulation
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==
const ripsaw_api_version = '0.1.2';

let debug_visible = false; //turn this on to draw lines to shapes & Arrows
let ratio_debug = false; //turn this on to check ratios
let rect_ratio_debug = false; //turn this on to check rectangle turret ratios
/*
Changes:
- added all new tanks
- texts now get detected properly
- minimap now gets detected again

Issues:
- arrows have now random vertices instead of 3
- Smasher, Spike addons don't get detected...
- Necromancer body, doesn't get detected...

(Work in progress...)
- handle transformed text
- detect the weird ass minimap arrow
- finding true arrow data
- Bosses Detection
- Scoreboard reader
- make scaling work properly
- rework the entire tank detection (pain...)
- make tanks detectable even after recieving damage

TODO LIST:
===Tanks===

Special cases:
- Trapper Addons aren't touching the tank body   ## IDEA: new Turret category Addons or branch from "other", check collision with existing turrets and combine.
- figure out what to do with Auto Turret gray circles

Definition Duplicates:
- Triplet & Tri-Angle
- Quad Tank & Twin Flank

Bullets:
- figure out what to do with Skimmer bullets
- figure out what to do with Rocketeer bullets
- figure out what to do with Glider bullets

Other stuff:
- learn to get text coords and store player names in addition to the tanks
- Everything works right now, but you added body types to tank definition, so try replacing that ugly ass logic you made with matches + body_type=true?

===Bosses===
- dominators
- sandbox Mothership is not the same as regular mothership, so check for gamemode in the future (???)
- handle arena closers

===Drones===
- detect factory drones

===UI===
- make scoreboard reader

*/
let canvas, ctx;
//define your canvas
const fake_canvas = document.createElement('canvas');
const fctx = fake_canvas.getContext('2d');
let img_present = false;

function update_fake_canvas() {
    if (canvas && ctx) {
        if(canvas.width != fake_canvas.width || canvas.height != fake_canvas.height){
            fake_canvas.width = canvas.width;
            fake_canvas.height = canvas.height;
        }
        if(!img_present){
            ctx.drawImage(fake_canvas, 0, 0);
            fctx.beginPath();
            fctx.clearRect(0, 0, fake_canvas.width, fake_canvas.height);
            img_present = true;
        }
    }
}

//define main canvas
function wait_and_define_canvas(){
    let c = document.getElementById('canvas');
    if(c){
        fake_canvas.width = c.width;
        fake_canvas.height = c.height;
        canvas = c;
        ctx = c.getContext('2d');
    }else{
        setTimeout(wait_and_define_canvas, 100);
    }
}
wait_and_define_canvas();

//Window Scaling
function windowScaling() {
    const canvas = document.getElementById('canvas');
    const a = canvas.height / 1080;
    const b = canvas.width / 1920;
    return b < a ? a : b;
};

//CUSTOM COLORS
let custom_colors = {
    boss_arrow: "#641299",
    leader_arrow: "#000000",
    minimap_arrow: "#000000",
}

//Helper Function to detect if the player has spawned
const dimmer = document.querySelector("#dimmer");
function isPlayerInGame(){
    return !JSON.parse(dimmer.dataset.isActive);
}

//COLOR GETTER SCRIPT (by r!Psaw, aka me :P )
let diep_user_colors;

function rgbToHex(rgb) {
    const match = rgb.match(/\d+/g);
    if (!match) return rgb;
    const [r, g, b] = match.map(Number);
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function get_style_color(property) {
    return rgbToHex(getComputedStyle(document.documentElement).getPropertyValue(property).trim());
}

function update_your_colors() {
    let temp_container = {
        // Core render colors
        background: get_style_color("--theme-color-backgroundColor"),
        bar_background: get_style_color("--theme-color-barBackground"),
        border: get_style_color("--theme-color-worldBorderColor"),
        grid: get_style_color("--theme-color-gridColor"),
        healthbar_back: get_style_color("--theme-color-healthBarBackground"),
        healthbar_front: get_style_color("--theme-color-healthBarFill"),
        minimap: get_style_color("--theme-color-minimapBackgroundColor"),
        minimap_border: get_style_color("--theme-color-minimapBorderColor"),
        scorebar: get_style_color("--theme-color-scoreBarFillColor"),
        solid_border: get_style_color("--theme-color-border-color") || get_style_color("--theme-color-shadowColor"), // fallback
        xp_bar: get_style_color("--theme-color-xpBarFillColor"),

        // UI Colors
        ui1: get_style_color("--theme-color-uiColor1"),
        ui2: get_style_color("--theme-color-uiColor2"),
        ui3: get_style_color("--theme-color-uiColor3"),
        ui4: get_style_color("--theme-color-uiColor4"),
        ui5: get_style_color("--theme-color-uiColor5"),
        ui6: get_style_color("--theme-color-uiColor6"),
        ui7: get_style_color("--theme-color-uiColor7"),

        // Team and entity colors
        smasher_and_dominator: get_style_color("--theme-color-smasherColor"),
        barrels: get_style_color("--theme-color-cannonColor"),
        body: get_style_color("--theme-color-oldOutlineColor"),
        blue_team: get_style_color("--theme-color-blueTeamColor"),
        red_team: get_style_color("--theme-color-redTeamColor"),
        purple_team: get_style_color("--theme-color-purpleTeamColor"),
        green_team: get_style_color("--theme-color-greenTeamColor"),
        shiny_shapes: get_style_color("--theme-color-shinyShapeColor"),
        square: get_style_color("--theme-color-squareColor"),
        triangle: get_style_color("--theme-color-triangleColor"),
        pentagon: get_style_color("--theme-color-pentagonColor"),
        hexagon: '#35c5db', //not defined anywhere dynamically
        crasher: get_style_color("--theme-color-crasherColor"),
        arena_closers_neutral_dominators: get_style_color("--theme-color-arenaCloserColor"),
        scoreboard_ffa_etc: get_style_color("--theme-color-ffaEnemyColor"),
        maze_walls: get_style_color("--theme-color-mazeWallColor"),
        others_ffa: get_style_color("--theme-color-ffaFriendlyColor"),
        necromancer_squares: get_style_color("--theme-color-necroDroneColor"),
        fallen_bosses: get_style_color("--theme-color-fallenBossColor")
    };

    diep_user_colors = temp_container;
}

setInterval(() => {
        update_your_colors();
}, 1500);

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
    hexagon: ["setTransform", "moveTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "fill"],
    smasher_addon: ["setTransform", "moveTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "fill"],
    mothership: ["setTransform", "moveTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "lineTo", "fill"],
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

const body_types = ['arc', 'rect', 'hexa'];

const turrets_of_tank = {
    //Tank Name: [ [Amount1, TurretName1], [Amount2, TurretName2] ]
    'Tank': {
        turrets: [[1,'Tank']],
        body_type: body_types[0],
    },
    'Auto Tank': {
        turrets: [[1, 'Tank'], [1, 'Auto']],
        body_type: body_types[0],
    },
    'Twin': {
        turrets: [[2,'Tank']],
        body_type: body_types[0],
    },
    'Sniper': {
        turrets: [[1, 'Sniper']],
        body_type: body_types[0],
    },
    'Machine Gun': {
        turrets: [[1, 'Machine Gun']],
        body_type: body_types[0],
    },
    'Triple Shot': {
        turrets: [[3, 'Tank']],
        body_type: body_types[0],
    },
    'Quad Tank': {
        turrets: [[4, 'Tank']],
        body_type: body_types[0],
    },
    'Octo Tank': {
        turrets: [[8, 'Tank',]],
        body_type: body_types[0],
    },
    'Triplet': {
        turrets: [[2, 'Fighter'], [1, 'Tank']],
        body_type: body_types[0],
    },
    'Twin Flank': {
        turrets: [[4, 'Tank']], //!Problem! same turrets as Quad Tank. Possible solution: Angle check
        body_type: body_types[0],
    },
    'Triple Twin': {
        turrets: [[6, 'Tank']],
        body_type: body_types[0],
    },
    'Assassin': {
        turrets: [[1, 'Assassin']],
        body_type: body_types[0],
    },
    'Ranger': {
        turrets: [[1, 'Ranger'], [1, 'Assassin']],
        body_type: body_types[0],
    },
    'Stalker': {
        turrets: [[1, "Stalker"]],
        body_type: body_types[0],
    },
    'Gunner': {
        turrets: [[2, 'Gunner(small)'], [2, 'Gunner(big)']],
        body_type: body_types[0],
    },
    'Spread Shot': {
        turrets: [[1, 'Tank'], [2, 'Spread1'], [2, 'Spread2'], [2, 'Spread3'], [2, 'Spread4'], [2, 'Sniper']],
        body_type: body_types[0],
    },
    'Auto Trapper': {
        turrets: [[1, 'Trapper'], [1, 'Auto']],
        body_type: body_types[0],
    },
    'Tri-Trapper': {
        turrets: [[3, 'Trapper']],
        body_type: body_types[0],
    },
    'Mega Trapper': {
        turrets: [[1, 'Mega Trapper']],
        body_type: body_types[0],
    },
    'Gunner Trapper': {
        turrets: [[2, 'Gunner Trapper'], [1, 'Mega Trapper']],
        body_type: body_types[0],
    },
    'Trapper': {
        turrets: [[1, 'Trapper']],
        body_type: body_types[0],
    },
    'Fighter': {
        turrets: [[1, 'Tank'], [4, 'Fighter']],
        body_type: body_types[0],
    },
    'Booster': {
        turrets: [[1, 'Tank'], [2, 'Fighter'], [2, 'Booster']],
        body_type: body_types[0],
    },
    'Hunter': {
        turrets: [[1, 'Sniper'], [1, 'Hunter']],
        body_type: body_types[0],
    },
    'Predator': {
        turrets: [[1, 'Sniper'], [1, 'Hunter'], [1, 'Predator']],
        body_type: body_types[0],
    },
    'Penta Shot': {
        turrets: [[1, 'Sniper'], [2, 'Tank'], [2, 'Fighter']],
        body_type: body_types[0],
    },
    'Destroyer': {
        turrets: [[1, 'Destroyer']],
        body_type: body_types[0],
    },
    'Tri-Angle': {
        turrets: [[1, 'Tank'], [2, 'Fighter']],
        body_type: body_types[0],
    },
    'Flank Guard': {
        turrets: [[1, 'Tank'], [1, 'Fighter']],
        body_type: body_types[0],
    },
    'Annihilator': {
        turrets: [[1, 'Anni']],
        body_type: body_types[0],
    },
    'Hybrid': {
        turrets: [[1, 'Destroyer'], [1, 'Overseer']],
        body_type: body_types[0],
    },
    'Manager': {
        turrets: [[1, 'Overseer']],
        body_type: body_types[0],
    },
    'Necromancer': {
        turrets: [[2, 'Overseer'], [1, 'Necro Body']],
        body_type: body_types[1],
    },
    'Factory': {
        turrets: [[1, 'Overseer'], [1, 'Necro Body']],
        body_type: body_types[1],
    },
    'Overlord': {
        turrets: [[4, 'Overseer']],
        body_type: body_types[0],
    },
    'Overseer': {
        turrets: [[2, 'Overseer']],
        body_type: body_types[0],
    },
    'Sprayer': {
        turrets: [[1, 'Machine Gun'], [1, 'Sniper']],
        body_type: body_types[0],
    },
    'Skimmer': {
        turrets: [[1, 'Predator'], [1, 'Glider2']],
        body_type: body_types[0],
    },
    'Rocketeer': {
        turrets: [[1, "Rocketeer1"], [1, "Glider2"]],
        body_type: body_types[0],
    },
    'Streamliner': {
        turrets: [[1, 'Sniper'], [1, 'Fighter'], [1, 'Booster'], [1, 'Streamliner1'], [1, 'Streamliner2']],
        body_type: body_types[0],
    },
    'Auto 3': {
        turrets: [[3, 'Auto']],
        body_type: body_types[0],
    },
    'Auto 5': {
        turrets: [[5, 'Auto']],
        body_type: body_types[0],
    },
    'Battleship': {
        turrets: [[4, 'Battleship']],
        body_type: body_types[0],
    },
    'Glider': {
        turrets: [[1, 'Glider1'], [1, 'Glider2']],
        body_type: body_types[0],
    },
    'Auto Gunner': {
        turrets: [[1, 'Auto'], [2, 'Gunner(small)'], [2, 'Gunner(big)']],
        body_type: body_types[0],
    },
    'Overtrapper': {
        turrets: [[2, 'Overseer'], [1, 'Trapper']],
        body_type: body_types[0],
    },
    'Mothership': {
        turrets: [[16, 'Mothership']],
        body_type: body_types[2],
    },
    'Shotgun': {
        turrets: [[3, 'Shotgun(small)'], [1, 'Shotgun(big)']],
        body_type: body_types[0],
    },
    'Pellet Shot': {
        turrets: [[1, 'Pellet(small)'], [3, 'Pellet(middle)'], [1, 'Pellet(big)']],
        body_type: body_types[0],
    },
    'Dual-Barrel': {
        turrets: [[6, 'Dual'], [1, 'Shotgun(big)']],
        body_type: body_types[0],
    },
    'Firework': {
        turrets: [[1, "Firework(small)"], [1, "Firework(middle)"], [1, "Firework(big)"]],
        body_type: body_types[0],
    },
    //Firework
}

/* //Problem: doesn't actually touch tank's body, but connects to the turret instead -> tank detection algorhythm fails, so disabled for now
const TurretAddonsRatios = [
    {
        name: "TrapperAddon",
        ratio: 2.887,
    },
]
*/

const smasher_branch_tanks = {
    'Smasher': [[1, 'smasher_addons']],
    'Auto Smasher': [[1, 'smasher_addons'], [1, 'Auto']],
    'Landmine': [[2, 'smasher_addons']],
    'Spike': [[4, 'spike_addons']],
}

let smasher_branch_addons = {
    smasher_addons: [], //6 sided
    spike_addons: [], //3 sided
}

const OtherTurretRatios = [ //bigger side / smaller side
    {
        name: "Necro Body",
        ratio: 1.000,
    },
    {
        name: "Machine Gun",
        ratio: 1.310,
    },
    {
        name: "Overseer",
        ratio: 1.024,
    },
    {
        name: "Ranger",
        ratio: 1.402,
    },
    {
        name: "Stalker",
        ratio: 1.647,
    },
    {
        name: "Glider1",
        ratio: 1.199,
    },
    {
        name: "Glider2",
        ratio: 1.590,
    },
    {
        name: "Rocketeer1",
        ratio: 1.115,
    },
    {
        name: "Battleship",
        ratio: 1.473,
    },
    {
        name: "Mothership",
        ratio: 3.272,
    },
    {
        name: "Shotgun(small)",
        ratio: 1.243,
    },
    {
        name: "Shotgun(big)",
        ratio: 1.132,
    },
    {
        name: "Pellet(small)",
        ratio: 1.611,
    },
    {
        name: "Pellet(middle)",
        ratio: 1.109,
    },
    {
        name: "Pellet(big)",
        ratio: 1.293,
    },
    {
        name: "Dual",
        ratio: 3.238,
    },
    {
        name: "Firework(small)",
        ratio: 1.899,
    },
    {
        name: "Firework(middle)",
        ratio: 1.503,
    },
    {
        name: "Firework(big)",
        ratio: 1.455,
    },
]

const TurretRatios = [
    {
        name: "Destroyer",
        ratio: 1.331,
    },
    {
        name: "Anni",
        ratio: 0.983,
    },
    {
        name: "Fighter",
        ratio: 1.905,
    },
    {
        name: "Booster",
        ratio: 1.667,
    },
    {
        name: "Tank",
        ratio: 2.262,
    },
    {
        name: "Sniper",
        ratio: 2.619,
    },
    {
        name: "Assassin",
        ratio: 2.857,
    },
    {
        name: "Hunter",
        ratio: 1.675,
    },
    {
        name: "Predator",
        ratio: 1.120,
    },
    {
        name: "Mega Trapper",
        ratio: 1.099,
    },
    {
        name: "Trapper",
        ratio: 1.429,
    },
    {
        name: "Gunner Trapper",
        ratio: 3.571,
    },
    {
        name: "Predator",
        ratio: 1.120,
    },
    {
        name: "Gunner(small)",
        ratio: 2.579,
    },
    {
        name: "Gunner(big)",
        ratio: 3.373,
    },
    {
        name: "Spread1",
        ratio: 3.027,
    },
    {
        name: "Spread2",
        ratio: 2.823,
    },
    {
        name: "Spread3",
        ratio: 2.415,
    },
    {
        name: "Spread4",
        ratio: 2.211,
    },
    {
        name: "Auto",
        ratio: 1.871,
    },
    {
        name: "Streamliner1",
        ratio: 2.381,
    },
    {
        name: "Streamliner2",
        ratio: 2.143,
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
    fallen_booster: null,
    fallen_ol: null,
    necromancer: null,
    guardian: null
}
let circles = {
    all: [],
};
let unusual_bodies = {
    all: [],
}
let turrets = {
    rectangular: [],
    other: [],
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
    hexagons: [],
}
let arrows = {
    boss: {
        center: [0, 0]
    },
    leader: {
        center: [0, 0]
    },
    minimap: {
        center: [0, 0]
    },
}
let minimap = {
    corners: {
        top_left: [0, 0],
        top_right: [0, 0],
        bottom_left: [0, 0],
        bottom_right: [0, 0],
    }
}

let bases = {
    blue: {
        top_left: [0, 0],
        top_right: [0, 0],
        bottom_left: [0, 0],
        bottom_right: [0, 0],
    },
    red: {
        top_left: [0, 0],
        top_right: [0, 0],
        bottom_left: [0, 0],
        bottom_right: [0, 0],
    },
    purple: {
        top_left: [0, 0],
        top_right: [0, 0],
        bottom_left: [0, 0],
        bottom_right: [0, 0],
    },
    green: {
        top_left: [0, 0],
        top_right: [0, 0],
        bottom_left: [0, 0],
        bottom_right: [0, 0],
    },
}

let bars = {
    score: [],
    level: [],
    health: [],
    leaderboard: [],
    upgrades: [],
}

let placeholder = {
    smasher_branch_addons: {
        smasher_addons: [], //6 sided
        spike_addons: [], //3 sided
    },
    bosses: {
        fallen_booster: null,
        fallen_ol: null,
        necromancer: null,
        guardian: null
    },
    circles: {
        all: [],
    },
    texts: {
        all: [],
    },
    unusual_bodies: {
        all: [],
    },
    turrets: {
        rectangular: [],
        other: [],
    },
    drones: {
        over: [],
        necro: [],
        battleship: [],
        base: [],
        summoner: [],
        guardian: [],
        trash: []
    },
    shapes: {
        squares: [],
        crashers: [],
        triangles: [],
        pentagons: [],
        hexagons: [],
    },
    arrows: {
        boss: {
            center: [0, 0]
        },
        leader: {
            center: [0, 0]
        },
        minimap: {
            center: [0, 0]
        },
    },
    minimap: {
        corners: {
            top_left: [0, 0],
            top_right: [0, 0],
            bottom_left: [0, 0],
            bottom_right: [0, 0],
        }
    },
    bases: {
        blue: {
            top_left: [0, 0],
            top_right: [0, 0],
            bottom_left: [0, 0],
            bottom_right: [0, 0],
        },
        red: {
            top_left: [0, 0],
            top_right: [0, 0],
            bottom_left: [0, 0],
            bottom_right: [0, 0],
        },
        purple: {
            top_left: [0, 0],
            top_right: [0, 0],
            bottom_left: [0, 0],
            bottom_right: [0, 0],
        },
        green: {
            top_left: [0, 0],
            top_right: [0, 0],
            bottom_left: [0, 0],
            bottom_right: [0, 0],
        },
    },
    bars: {
        score: [],
        level: [],
        health: [],
        leaderboard: [],
        upgrades: [],
    }
}

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
        this.setTransform = [0, 0, 0, 0, 0, 0];
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

function pointInPolygon(point, polygon) {
    let [px, py] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let [xi, yi] = polygon[i];
        let [xj, yj] = polygon[j];

        let intersect = ((yi > py) !== (yj > py)) &&
                        (px < (xj - xi) * (py - yi) / (yj - yi + 0.0000001) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

function hasApproxX(x1, x2, tolerance = 0.5){
    return (Math.abs(x1-x2) < tolerance);
}

function is_color(key, color) {
    if (!diep_user_colors) {
        return false;
    }
    return color === diep_user_colors[key];
}

function find_your_tank_body() {
    if (!isPlayerInGame()) {
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
        let x = arr[i].x;
        let y = arr[i].y;
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

// ---proxying logic---
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
            //console.log(args);

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

function start_proxies() {
    //console.log('start_proxies called');

    methods.forEach(start_proxy);
    Object.freeze(crx);
}

// ---proxying logic end---

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

function calculateFOV(Fv, l, factor=1.01) {
    const numerator = 0.55 * Fv;
    const denominator = Math.pow(factor, (l - 1) / 2);
    return (numerator / denominator);
}
//

function unscale(value) {
    return Math.floor(value / communicator.scalingFactor);
}

const tankOrder = [];

function handle_other_turrets() {
    let l = OtherTurretRatios.length;
    for (let i = 0; i < l; i++) {
        let side1 = calculate_distance(communicator.lines[0][0], communicator.lines[0][1], communicator.lines[1][0], communicator.lines[1][1]);
        let side2 = calculate_distance(communicator.lines[1][0], communicator.lines[1][1], communicator.lines[2][0], communicator.lines[2][1]);
        let _ratio = (Math.max(side1, side2) / Math.min(side1, side2)).toFixed(3);
        if (OtherTurretRatios[i].ratio == _ratio) {
            tankOrder.push(OtherTurretRatios[i].name);
            //console.log('ratio match!', OtherTurretRatios[i].name);
            let temp_turret = {
                source_array: 'other',
                name: OtherTurretRatios[i].name,
                points: [define_current('moveTo').screenXY, ...communicator.lines],
                side_length: [side1, side2],
                ratio: _ratio,
            }
            placeholder.turrets.other.push(temp_turret);
            break
        }
    }
}

function handle_turrets(args, color){ //rectangular turrets
    let l = TurretRatios.length;
    let i = 0;
    let ratio_match = false;
    let turret_type;
    for(i; i < l; i++){
        if(Math.abs(args[0] / args[3]).toFixed(3) == (TurretRatios[i].ratio).toFixed(3)){
            ratio_match = true;
            turret_type = TurretRatios[i].name;
            break
        }
    }
    let color_match = is_color('barrels', color);
    if(color_match && ratio_match){
        //console.log('TURRET FOUND: ', turret_type);
        tankOrder.push(turret_type);
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
            source_array: 'rectangular',
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

function draw_ratio(){
    let d = 3; //numbers after comma
    let side1 = calculate_distance(communicator.lines[0][0], communicator.lines[0][1], communicator.lines[1][0], communicator.lines[1][1]);
    let side2 = calculate_distance(communicator.lines[1][0], communicator.lines[1][1], communicator.lines[2][0], communicator.lines[2][1]);
    let ratio = Math.max(side1, side2) / Math.min(side1, side2);
    let og = {
        f: fctx.font,
        lw: fctx.lineWidth,
        ss: fctx.strokeStyle,
        fs: fctx.fillStyle
    }
    fctx.lineWidth = 1.5;
    fctx.font = "20px Georgia";
    fctx.strokeStyle = "black";
    fctx.strokeText('moveTo',...define_current('moveTo').screenXY);
    fctx.strokeText((ratio).toFixed(d), communicator.lines[0][0], communicator.lines[0][1]);
    fctx.strokeText((ratio).toFixed(d), communicator.lines[1][0], communicator.lines[1][1]);
    fctx.strokeText((ratio).toFixed(d), communicator.lines[2][0], communicator.lines[2][1]);
    fctx.fillStyle = "yellow";
    fctx.fillText('moveTo',...define_current('moveTo').screenXY);
    fctx.fillText((ratio).toFixed(d), communicator.lines[0][0], communicator.lines[0][1]);
    fctx.fillText((ratio).toFixed(d), communicator.lines[1][0], communicator.lines[1][1]);
    fctx.fillText((ratio).toFixed(d), communicator.lines[2][0], communicator.lines[2][1]);
    fctx.fillStyle = og.fs;
    fctx.strokeStyle = og.ss;
    fctx.lineWidth = og.lw;
    update_fake_canvas();
}

let _t = []
function draw_rect_ratio(){
    let t = communicator.setTransform;
    let temp_sizes = {
        angle: Math.atan2(t[2], t[3]) || 0,
        width: Math.hypot(t[3], t[2]),
        length: Math.hypot(t[0], t[1])*3,
    }
    let start_coords = {
        x: t[4] - Math.cos(temp_sizes.angle + Math.PI / 2) * temp_sizes.width / 2,
        y: t[5] + Math.sin(temp_sizes.angle + Math.PI / 2) * temp_sizes.width / 2,
    }
    let end_coords = {
        x: start_coords.x + temp_sizes.length * Math.cos(-temp_sizes.angle),
        y: start_coords.y + temp_sizes.length * Math.sin(-temp_sizes.angle)
    };
    let ratio = Math.abs(t[0] / t[3]).toFixed(3);
    if(!_t.includes(ratio)) _t[_t.length] = ratio;
    window._t = _t;
    let og = {
        f: fctx.font,
        lw: fctx.lineWidth,
        ss: fctx.strokeStyle,
        fs: fctx.fillStyle,
    }
    fctx.lineWidth = 1.5;
    fctx.font = "40px italic";
    fctx.strokeStyle = "black";
    //ctx.strokeText(ratio, start_coords.x, start_coords.y);
    fctx.strokeText(ratio, end_coords.x, end_coords.y);
    fctx.fillStyle = "yellow";
    fctx.fillText(ratio, end_coords.x, end_coords.y);
    fctx.fillStyle = og.fs;
    fctx.strokeStyle = og.ss;
    fctx.lineWidth = og.lw;
    fctx.font = og.f;
    update_fake_canvas();
}

function handle_base(color, args) {
    let types = {
        blue: diep_user_colors.blue_team,
        red: diep_user_colors.red_team,
        green: diep_user_colors.green_team,
        purple: diep_user_colors.purple_team,
    }
    let found_type;
    for (let type in types) {
        if (color === types[type]) {
            found_type = type;
            break
        }
    }
    let [a, b, c, d, e, f] = args;

    // Corner offsets:
    let topLeft = {
        x: e,
        y: f
    };
    let topRight = {
        x: e + a,
        y: f + b
    };
    let bottomLeft = {
        x: e + c,
        y: f + d
    };
    let bottomRight = {
        x: e + a + c,
        y: f + b + d
    };

    //console.log(found_type);
    if(found_type){
        bases[found_type].top_left[0] = topLeft.x;
        bases[found_type].top_left[1] = topLeft.y;

        bases[found_type].top_right[0] = topRight.x;
        bases[found_type].top_right[1] = topRight.y;

        bases[found_type].bottom_left[0] = bottomLeft.x;
        bases[found_type].bottom_left[1] = bottomLeft.y;

        bases[found_type].bottom_right[0] = bottomRight.x;
        bases[found_type].bottom_right[1] = bottomRight.y;
    }
    // Debug output
    debug(
        topLeft,
    );
    debug(
        topRight,
    );
    debug(
        bottomLeft,
    );
    debug(
        bottomRight,
    );
}

function hexToRgb(hex) { //CHAT GPT generated
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbDiff(rgb1, rgb2) { //CHAT GPT generated (for debugging only)
  return {
    r: rgb2.r - rgb1.r,
    g: rgb2.g - rgb1.g,
    b: rgb2.b - rgb1.b,
    euclidean: Math.sqrt(
      Math.pow(rgb2.r - rgb1.r, 2) +
      Math.pow(rgb2.g - rgb1.g, 2) +
      Math.pow(rgb2.b - rgb1.b, 2)
    )
  };
}

function isFacingSameDirection(vector, reference) { //CHAT GPT generated (I will replace that one probably)
    const dotProduct = vector[0] * reference[0] + vector[1] * reference[1];
    return dotProduct > 0;
}

function is_gradient(current_color, original_color){ //CHAT GPT generated (I will replace that one probably)
    if(!diep_user_colors || current_color === original_color) return false; //avoid duplicates & ensures diep_user_colors is defined
    let full = hexToRgb(diep_user_colors[original_color]);
    if(!full) return false;
    let rgb = `rgb(${full.r}, ${full.g}, ${full.b}`;
    let full2 = hexToRgb(current_color);
    if(!full2) return false;
    let rgb2 = `rgb(${full2.r}, ${full2.g}, ${full2.b}`;
    let diff = rgbDiff(full, full2);
    return isFacingSameDirection([full2.g, full2.b], [full.g, full.b]);
}

function is_whitened(current_color, original_color){ //CHAT GPT generated
    if(!diep_user_colors || current_color === original_color) return false; //avoid duplicates & ensures diep_user_colors is defined
    let full = hexToRgb(diep_user_colors[original_color]);
    if(!full) return false;
    let rgb = `rgb(${full.r}, ${full.g}, ${full.b}`;
    let full2 = hexToRgb(current_color);
    if(!full2) return false;
    let rgb2 = `rgb(${full2.r}, ${full2.g}, ${full2.b}`;
    let diff = rgbDiff(full, full2);
    return (diff.g > 0 && diff.b > 0);
}

function handle_damage(current_color, original_color, callbackFunc, callbackArg){ //CHAT GPT generated
    if(is_gradient(current_color, original_color) || is_gradient(current_color, original_color)){
        callbackFunc(callbackArg);
    }
}

function getUnitVector2d(a, b){ //defines direction of a vector
    let magnitude = Math.sqrt(a*a+b*b);
    if (magnitude === 0) return [0, 0];
    return [a/magnitude, b/magnitude];
}

function getUnitVectorFromWhite(green, blue) { //unit vector from [g:255, b:255] to [g:green, b:blue]
    let gOffset = green - 255;
    let bOffset = blue - 255;

    return getUnitVector2d(gOffset, bOffset);
}

function getUnitVectorsFromColors(colors_array, type = "default"){ //takes ['color1', 'color2', ...] as input and outputs {color1: [unitVector1], color2: [unitVector2], ...}
    let output_object = {};
    if(!(colors_array instanceof Array)) return output_object;
    for(let temp_color of colors_array){
        if(typeof temp_color === "string" && diep_user_colors && diep_user_colors[temp_color]){
            let temp_rgb = hexToRgb(diep_user_colors[temp_color]);
            if(temp_rgb){
                let temp_uv;
                switch(type){
                    case "default":
                        temp_uv = getUnitVector2d(temp_rgb.g, temp_rgb.b);
                        break
                    case "whitened":
                        temp_uv = getUnitVectorFromWhite(temp_rgb.g, temp_rgb.b);
                        break
                    default: //to avoid some errors
                        temp_uv = [0, 0];
                        break
                }
                output_object[temp_color] = temp_uv;
            }
        }
    }
    return output_object;
}

function choose_damaged_entity(sides, color){ //picks what entity is damaged based on red & white unitvectors and amount of sides
    const teams = ['red_team', 'blue_team', 'green_team', 'purple_team'];
    const colors_to_choose_from = {
        3: ['triangle', 'crasher', ...teams], //triangles, crashers and all team drones
        4: ['square', 'barrels', 'necromancer_squares', ...teams], //squares, ffa necro drones, all team necro drones
        5: ['pentagon'],
        6: ['hexagon'],
        16: [...teams], //mothership body
    };
    if(!colors_to_choose_from[sides]) return -1; //amount of sides was not defined
    let color_rgb = hexToRgb(color);
    if(!color_rgb) return -1;
    //white unit vectors
    let c_white_unit_vector = getUnitVectorFromWhite(color_rgb.g, color_rgb.b);
    let white_unit_vectors = getUnitVectorsFromColors(colors_to_choose_from[sides], "whitened");

    //red unit vectors
    let c_red_unit_vector = getUnitVector2d(color_rgb.g, color_rgb.b);
    let red_unit_vectors = getUnitVectorsFromColors(colors_to_choose_from[sides]);

    //now let's do the sorting
    switch(sides){
        case 3:
            //check red unit vectors matching
            for(let clr in red_unit_vectors){
                //console.log(c_red_unit_vector[0] - red_unit_vectors[clr][0], c_red_unit_vector[1] - red_unit_vectors[clr][1]);
                if(
                    (c_red_unit_vector[0] - red_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_red_unit_vector[1] - red_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('3 red match');
                    if(teams.includes(clr)){ //drone detected
                        update_drone(3, color, clr);
                    }else{ //shape detected
                        //console.log('called update_shape with: ', clr);
                        update_shape(clr); //since clr is not part of teams array, it has to be either triangle or crasher.
                    }
                    return; //quit the function if found
                }
            }
            //check white unit vectors matching
            for(let clr in white_unit_vectors){
                if(
                    (c_white_unit_vector[0] - white_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_white_unit_vector[1] - white_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('3 white match');
                    if(teams.includes(clr)){ //drone detected
                        update_drone(3, color, clr);
                    }else{ //shape detected
                        update_shape(clr);
                    }
                    return; //quit the function if found
                }
            }
            break
        case 4:
            //check red unit vectors matching
            for(let clr in red_unit_vectors){
                if(
                    (c_red_unit_vector[0] - red_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_red_unit_vector[1] - red_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('4 red match');
                    if(teams.includes(clr) || clr === "necromancer_squares"){ //drone detected
                        update_drone(4, color, clr);
                    }else if(clr === 'barrels'){
                        handle_other_turrets();
                    }else{ //shape detected
                        update_shape('square');
                    }
                    return; //quit the function if found
                }
            }
            //check white unit vectors matching
            for(let clr in white_unit_vectors){
                if(
                    (c_white_unit_vector[0] - white_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_white_unit_vector[1] - white_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('4 white match');
                    if(teams.includes(clr) || clr === "necromancer_squares"){ //drone detected
                        update_drone(4, color, clr);
                    }else if(clr === 'barrels'){
                        handle_other_turrets();
                    }else{ //shape detected
                        update_shape('square');
                    }
                    return; //quit the function if found
                }
            }
            break
        default:
            //check red unit vectors matching
            for(let clr in red_unit_vectors){
                if(
                    (c_red_unit_vector[0] - red_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_red_unit_vector[1] - red_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('5 red match');
                    if(sides in colors_to_choose_from) update_shape(colors_to_choose_from[sides]);
                    return; //quit the function if found
                }
            }
            //check white unit vectors matching
            for(let clr in white_unit_vectors){
                if(
                    (c_white_unit_vector[0] - white_unit_vectors[clr][0]).toFixed(1).includes('0.0') &&
                    (c_white_unit_vector[1] - white_unit_vectors[clr][1]).toFixed(1).includes('0.0')
                ){
                    //console.log('5 white match');
                    if(sides in colors_to_choose_from) update_shape(colors_to_choose_from[sides]);
                    return; //quit the function if found
                }
            }
            break
    }
}

function is_color2(key, color){
    let is_strict = is_color(key, color);
    if(is_strict) return true;
    let color_rgb1 = hexToRgb(color);
    let red_vector1 = getUnitVector2d(color_rgb1.g, color_rgb1.b);
    let white_vector1 = getUnitVectorFromWhite(color_rgb1.g, color_rgb1.b);

    let color_rgb2 = hexToRgb(diep_user_colors[key]);
    let red_vector2 = getUnitVector2d(color_rgb2.g, color_rgb2.b);
    let white_vector2 = getUnitVectorFromWhite(color_rgb2.g, color_rgb2.b);
    return (
        ((red_vector1[0]-red_vector2[0]).toFixed(1).includes('0.0') &&
        (red_vector1[1]-red_vector2[1]).toFixed(1).includes('0.0')) ||
        ((white_vector1[0]-white_vector2[0]).toFixed(1).includes('0.0') &&
        (white_vector1[1]-white_vector2[1]).toFixed(1).includes('0.0'))
    );
}

function handle_proxy(type, values) {
    //console.log(`working on proxy ${type}`);
    let current = define_current(type);
    let x, y, colors;
    switch (type) {
        case 'setTransform':
            communicator.setTransform = values.args;
            handle_turrets(values.args, values.thisArgs.fillStyle);
            if(rect_ratio_debug){
                img_present = false;
                draw_rect_ratio();
            }
            if(!diep_user_colors) return;
            colors = [diep_user_colors.blue_team, diep_user_colors.red_team, diep_user_colors.purple_team, diep_user_colors.green_team];
            if(values.thisArgs.globalAlpha === 0.10000000149011612 && colors.includes(values.thisArgs.fillStyle)){
                //console.log('YES!', values.thisArgs.fillStyle, values.args);
                handle_base(values.thisArgs.fillStyle, values.args);
            }
            break
        case 'fill':
            //moved leader arrow & minimap arrow outside triangle, because apparently it has more vertices now that are also random??
            //also boss arrow is literally leader arrow in another color and both aren't changeable normally, so diepstyle is no danger
            if (values.thisArgs.fillStyle === '#641299' && communicator.lines.length > 0 && values.thisArgs.globalAlpha <= 0.3499999940395355){
                update_arrow('boss');
                values.thisArgs.fillStyle = custom_colors.boss_arrow;
            }
            if (is_arrow(values.thisArgs) && communicator.lines.length > 0) {
                switch (true) {
                    case (values.thisArgs.globalAlpha <= 0.3499999940395355):
                        update_arrow('leader');
                        values.thisArgs.fillStyle = custom_colors.leader_arrow;
                        break
                    case (values.thisArgs.globalAlpha > 0.9):
                        update_arrow('minimap');
                        values.thisArgs.fillStyle = custom_colors.minimap_arrow;
                        break
                }
            }
            if (communicator.has_pattern(patterns.arc)) {
                if(tankOrder.length > 0){
                    //console.log('circle found! color: ', values.thisArgs.fillStyle);
                    console.log(tankOrder);
                    tankOrder.length = 0;
                }
                x = communicator.setTransform[4];
                y = communicator.setTransform[5];
                let target = define_current('arc');
                target.screenXY = [x, y];

                /*
                debug({
                    x: x,
                    y: y
                });
                */

                //console.log(`arc updated coords ${target.screenXY}`);

                /*
                let temp_circle = new Map();
                temp_circle.set('type', 'circle');
                temp_circle.set('x', x);
                temp_circle.set('y', y);
                temp_circle.set('radius', communicator.setTransform[0]);
                temp_circle.set('color', target.thisArgs.fillStyle);
                */

                let temp_circle = {
                    type: 'circle',
                    x: x,
                    y: y,
                    radius: communicator.setTransform[0],
                    color: target.thisArgs.fillStyle,
                }
                fctx.beginPath();
                fctx.fillStyle = 'white';
                fctx.arc(temp_circle.x, temp_circle.y, temp_circle.radius/10, 0, Math.PI*2);
                fctx.fill();

                placeholder.circles.all.push(temp_circle);
                //console.log(circles);
                let you = find_your_tank_body();
                _player.body = you;
                //let your_radius = you instanceof Map ? you.get('radius') : 1;
                //let your_radius_unscaled = unscale(your_radius);
                //console.log(your_radius_unscaled);

            } else if (communicator.has_pattern(patterns.triangle)) {
                /*
                console.log(`
                Triangle detected!
                Color: ${values.thisArgs.fillStyle}
                Opacity: ${values.thisArgs.globalAlpha}
                `, 'diep_user_colors: ', diep_user_colors);
                */
                //console.log(values.thisArgs.fillStyle);
                //console.log(values.thisArgs.globalAlpha);
                if(is_color('smasher_and_dominator', values.thisArgs.fillStyle)){
                    //console.log('Spike?');
                    let temp_points = [define_current('moveTo').screenXY, ...communicator.lines];
                    let temp_center = get_average(temp_points);
                    let temp_addon = new Map([
                        ['type', 'spike addon'],
                        ['points', temp_points],
                        ['color', values.thisArgs.fillStyle],
                        ['x', temp_center[0]],
                        ['y', temp_center[1]]
                    ]);
                    tankOrder.push('Spike');
                    placeholder.smasher_branch_addons.spike_addons.push(temp_addon);
                }else if (is_shape('triangle', values.thisArgs)) {
                    //console.log('TRIANGLE FOUND');
                    update_shape('triangle');
                }else if (is_shape('crasher', values.thisArgs)) {
                    //console.log('TRIANGLE FOUND');
                    update_shape('crasher');
                }else if (is_drone(values.thisArgs)) {
                    let temp = ['red_team', 'green_team', 'blue_team', 'purple_team'];
                    let temp_color = '';
                    for(let t of temp){
                        if(is_color(t, values.thisArgs.fillStyle)){
                            temp_color = t;
                            break
                        }
                    }
                    update_drone(3, values.thisArgs.fillStyle, temp_color);
                }else{
                    choose_damaged_entity(3, values.thisArgs.fillStyle);
                    /* OLD + Debugging
                    //handle_damage(values.thisArgs.fillStyle, 'crasher', update_shape, 'crasher');
                    if(is_whitened(values.thisArgs.fillStyle, 'triangle')){ //DEBUG white unit vectors
                        let full = hexToRgb(diep_user_colors.triangle);
                        let full2 = hexToRgb(values.thisArgs.fillStyle);
                        if(!full || !full2) return;
                        let unit_vectors = {
                            original: getUnitVectorFromWhite(full.g, full.b),
                            whitened: getUnitVectorFromWhite(full2.g, full2.b),
                        };
                        console.log(`
                        ==TRIANGLE==
                        original: ${unit_vectors.original[0]} ${unit_vectors.original[1]}
                        whitened: ${unit_vectors.whitened[0]} ${unit_vectors.whitened[1]}
                        difference: ${unit_vectors.original[0] - unit_vectors.whitened[0]} ${unit_vectors.original[1] - unit_vectors.whitened[1]}
                        `);
                    }else{
                        let current_rgb = hexToRgb(values.thisArgs.fillStyle);
                        let current_unit_vector = getUnitVectorFromWhite(current_rgb.g, current_rgb.b);
                        const triangle_rgbs = {
                            triangle: hexToRgb(diep_user_colors.triangle),
                            crasher: hexToRgb(diep_user_colors.crasher),
                            red_drone: hexToRgb(diep_user_colors.red_team),
                            blue_drone: hexToRgb(diep_user_colors.blue_team),
                            green_drone: hexToRgb(diep_user_colors.green_team),
                            purple_drone: hexToRgb(diep_user_colors.purple_team),
                        }
                        const triangle_unit_vectors = {
                            triangle: getUnitVectorFromWhite(triangle_rgbs.triangle.g, triangle_rgbs.triangle.b),
                            crasher: getUnitVectorFromWhite(triangle_rgbs.crasher.g, triangle_rgbs.crasher.b),
                            red_drone: getUnitVectorFromWhite(triangle_rgbs.red_drone.g, triangle_rgbs.red_drone.b),
                            blue_drone: getUnitVectorFromWhite(triangle_rgbs.blue_drone.g, triangle_rgbs.blue_drone.b),
                            green_drone: getUnitVectorFromWhite(triangle_rgbs.green_drone.g, triangle_rgbs.green_drone.b),
                            purple_drone: getUnitVectorFromWhite(triangle_rgbs.purple_drone.g, triangle_rgbs.purple_drone.b),
                        }
                        //console.log('TRIANGLE LINE UNIT VECTORS', current_unit_vector, triangle_unit_vectors);
                    }
                    handle_damage(values.thisArgs.fillStyle, 'triangle', update_shape, 'triangle');
                    */
                }
            } else if (communicator.has_pattern(patterns.square)) {
                if(ratio_debug) draw_ratio();
                /* Test if it gets detected when damaged
                for(let temp_turret of turrets.other){
                    debug({x: temp_turret.points[0][0]*1.5, y: temp_turret.points[0][1]*1.5});
                }
                */

                if (is_color('barrels', values.thisArgs.fillStyle)) {
                    handle_other_turrets();
                }else if (is_shape('square', values.thisArgs)) {
                    //console.log('SQUARE FOUND');
                    update_shape('square');
                }else if (is_drone(values.thisArgs)) {
                    let temp = ['necromancer_squares', 'red_team', 'green_team', 'blue_team', 'purple_team'];
                    let temp_color = '';
                    for(let t of temp){
                        if(is_color(t, values.thisArgs.fillStyle)){
                            temp_color = t;
                            break
                        }
                    }
                    update_drone(4, values.thisArgs.fillStyle, temp_color);
                }else{
                    choose_damaged_entity(4, values.thisArgs.fillStyle);
                    /* OLD + debug
                    if(is_whitened(values.thisArgs.fillStyle, 'square')){ //DEBUG white unit vectors
                        let full = hexToRgb(diep_user_colors.square);
                        let full2 = hexToRgb(values.thisArgs.fillStyle);
                        if(!full || !full2) return;
                        let unit_vectors = {
                            original: getUnitVectorFromWhite(full.g, full.b),
                            whitened: getUnitVectorFromWhite(full2.g, full2.b),
                        };
                        console.log(`
                        ==SQUARE==
                        original: ${unit_vectors.original[0]} ${unit_vectors.original[1]}
                        whitened: ${unit_vectors.whitened[0]} ${unit_vectors.whitened[1]}
                        difference: ${unit_vectors.original[0] - unit_vectors.whitened[0]} ${unit_vectors.original[1] - unit_vectors.whitened[1]}
                        `);
                    }
                    handle_damage(values.thisArgs.fillStyle, 'square', update_shape, 'square');
                    */
                }
            } else if (communicator.has_pattern(patterns.pentagon)) {
                if (is_shape('pentagon', values.thisArgs)) {
                    //console.log('PENTAGON FOUND');
                    update_shape('pentagon');
                }else{
                    choose_damaged_entity(5, values.thisArgs.fillStyle);
                    /* OLD
                    handle_damage(values.thisArgs.fillStyle, 'pentagon', update_shape, 'pentagon');
                    */
                }
            } else if (communicator.has_pattern(patterns.hexagon)){
                if (is_shape('hexagon', values.thisArgs)) {
                    //console.log('PENTAGON FOUND');
                    update_shape('pentagon');
                }else{
                    choose_damaged_entity(6, values.thisArgs.fillStyle);
                    /* OLD
                    handle_damage(values.thisArgs.fillStyle, 'pentagon', update_shape, 'pentagon');
                    */
                }
            }else if (communicator.has_pattern(patterns.smasher_addon)){
                //console.log('found smasher addon!');
                if(is_color('smasher_and_dominator', values.thisArgs.fillStyle)){
                    //console.log('Smasher?');
                    let temp_points = [define_current('moveTo').screenXY, ...communicator.lines];
                    let temp_center = get_average(temp_points);
                    let temp_addon = new Map([
                        ['type', 'smasher addon'],
                        ['points', temp_points],
                        ['color', values.thisArgs.fillStyle],
                        ['x', temp_center[0]],
                        ['y', temp_center[1]]
                    ]);
                    tankOrder.push('Smasher');
                    placeholder.smasher_branch_addons.smasher_addons.push(temp_addon);
                }
            } else if (communicator.has_pattern(patterns.mothership)) {
                //console.log("found mothership body");
                console.log('Reminder! Damaged Mothership body detection logic needs to be updated!');
                //0-8
                let temp_points = [define_current('moveTo').screenXY, ...communicator.lines];
                let temp_center = get_average(temp_points);
                let temp_body = new Map([
                    ['type', 'hexadecagon'],
                    ['color', values.thisArgs.fillStyle],
                    ['points', temp_points],
                    ['radius', calculate_distance(communicator.lines[0][0], communicator.lines[0][1], communicator.lines[8][0], communicator.lines[8][1]) / 2],
                    ['x', temp_center[0]],
                    ['y', temp_center[1]]
                ]);
                placeholder.unusual_bodies.all.push(temp_body);
            }
            break
        case 'moveTo':
            current.screenXY = [values.args[0], values.args[1]];
            if(values.thisArgs.lineCap === "round"){
                //console.log('moveto', values.thisArgs.globalAlpha);
                //debugging...
                let og = {
                    ss: fctx.strokeStyle,
                    fs: fctx.fillStyle,
                }
                let mt = define_current('moveTo').screenXY;
                let lt = values.args;

                //fctx.strokeStyle = 'white';
                fctx.strokeStyle = values.thisArgs.strokeStyle;
                fctx.beginPath();
                //fctx.arc(...mt, values.thisArgs.lineWidth*10, 0, Math.PI*2); //circle debug
                //fctx.moveTo(...mt);
                //fctx.lineTo(...lt);
                //fctx.stroke();

                //fctx.strokeStyle = 'red';
                fctx.fillStyle = values.thisArgs.strokeStyle;
                fctx.beginPath();
                //fctx.arc(...mt, values.thisArgs.lineWidth*10, 0, Math.PI*2); //circle debug
                //fctx.moveTo(mt[0]+(lt[0]-mt[0])/2, mt[1]+(lt[1]-mt[1])/2);
                //fctx.lineTo(mt[0]+(lt[0]-mt[0])/2, mt[1]+(lt[1]-mt[1])/2 - (values.thisArgs.lineWidth)/2);
                //fctx.stroke();
                //fctx.fill();


                fctx.strokeStyle = og.ss;
                fctx.fillStyle = og.fs;
                update_fake_canvas();
            }
            break
        case 'lineTo':
            if(values.thisArgs.lineCap === "round"){
                //console.log('lineto', values.thisArgs.globalAlpha);
                //debugging...
                let og = {
                    ss: fctx.strokeStyle,
                    fs: fctx.fillStyle,
                }
                let mt = define_current('moveTo').screenXY;
                let lt = values.args;

                //fctx.strokeStyle = 'white';
                fctx.strokeStyle = values.thisArgs.fillStyle;
                fctx.beginPath();
                fctx.arc(...lt, values.thisArgs.lineWidth*10, 0, Math.PI*2); //circle debug
                //fctx.moveTo(...mt);
                //fctx.lineTo(...lt);
                //fctx.stroke();

                //fctx.strokeStyle = 'red';
                fctx.fillStyle = values.thisArgs.strokeStyle;
                fctx.beginPath();
                //fctx.arc(...lt, values.thisArgs.lineWidth*10, 0, Math.PI*2); //circle debug
                //fctx.moveTo(mt[0]+(lt[0]-mt[0])/2, mt[1]+(lt[1]-mt[1])/2);
                //fctx.lineTo(mt[0]+(lt[0]-mt[0])/2, mt[1]+(lt[1]-mt[1])/2 - (values.thisArgs.lineWidth)/2);
                //fctx.stroke();
                //fctx.fill();


                fctx.strokeStyle = og.ss;
                fctx.fillStyle = og.fs;
                update_fake_canvas();

                if(diep_user_colors){
                    //console.log(diep_user_colors.bar_background, values.thisArgs.fillStyle, values.thisArgs.strokeStyle);
                    switch(values.thisArgs.fillStyle){
                        case diep_user_colors.bar_background:
                            //console.log('normal');
                            break
                        case diep_user_colors.ui1:
                            //console.log('ui1');
                            break
                        case diep_user_colors.ui2:
                            //console.log('ui2');
                            break
                        case diep_user_colors.ui3:
                            //console.log('ui3');
                            break
                        case diep_user_colors.ui4:
                            //console.log('ui4');
                            break
                        case diep_user_colors.ui5:
                            //console.log('ui5');
                            break
                        case diep_user_colors.ui6:
                            //console.log('ui6');
                            break
                        case diep_user_colors.ui7:
                            //console.log('ui7');
                            break
                        case diep_user_colors.ui8:
                            //console.log('ui8');
                            break
                        case diep_user_colors.xp_bar:
                            //console.log('xp bar');
                            break
                        case diep_user_colors.score_bar:
                            //console.log('score bar');
                            break
                        case diep_user_colors.blue_team:
                            //console.log('blue team');
                            break
                        case diep_user_colors.red_team:
                            //console.log('red team');
                            break
                        case diep_user_colors.purple_team:
                            //console.log('purple team');
                            break
                        case diep_user_colors.green_team:
                            //console.log('green team');
                            break
                    }
                }
            }
            current.screenXY = [values.args[0], values.args[1]];
            //console.log(`lineTo updated coords ${current.screenXY}`);
            communicator.lines.push(current.screenXY);
            break
        case 'stroke':
            if(values.thisArgs.lineCap === "round"){
                let lw = values.thisArgs.lineWidth;
                let mt = define_current('moveTo').screenXY;
                let lt = define_current('lineTo').screenXY;
                let layer;
                //Health bars only apparently
                switch(values.thisArgs.strokeStyle){
                    case diep_user_colors.healthbar_back:
                        layer = 'back';
                        break
                    case diep_user_colors.healthbar_front:
                        layer = 'front';
                        break
                }
                let bar = {
                    layer: layer,
                    width: lw,
                    moveTo: mt,
                    lineTo: lt,
                    strokeStyle: values.thisArgs.strokeStyle,
                }
                placeholder.bars.health.push(bar);
                //console.log(diep_user_colors.healthbar_back, diep_user_colors.healthbar_front);
            }
            break
        case 'drawImage':{
            if(values.args[0] === fake_canvas) return;
            if(
                values.thisArgs.fillStyle === '#cdcdcd' &&
                communicator.lines.length === 4 &&
                communicator.lines[0][0] === communicator.lines[1][0] &&
                communicator.lines[2][0] === communicator.lines[3][0]
            ){
                //NEW MINIMAP DETECTION
                debug({x: communicator.lines[0][0], y: communicator.lines[0][1]}); //ru
                debug({x: communicator.lines[1][0], y: communicator.lines[1][1]}); //rd
                debug({x: communicator.lines[2][0], y: communicator.lines[2][1]}); //ld
                debug({x: communicator.lines[3][0], y: communicator.lines[3][1]}); //lu
                let _c = placeholder.minimap.corners;
                _c.top_right[0] = communicator.lines[0][0];
                _c.top_right[1] = communicator.lines[0][1];
                _c.bottom_right[0] = communicator.lines[1][0];
                _c.bottom_right[1] = communicator.lines[1][1];
                _c.bottom_left[0] = communicator.lines[2][0];
                _c.bottom_left[1] = communicator.lines[2][1];
                _c.top_left[0] = communicator.lines[3][0];
                _c.top_left[1] = communicator.lines[3][1];
            };
            const transform_matrix = communicator.setTransform;
            const [a,b,c,d,e,f] = transform_matrix;
            const px = values.args[1]; // drawImage x
            const py = values.args[2]; // drawImage y
            const angle = Math.atan2(b, a);
            let width, height;
            let tctx = values.args[0].getContext('2d');
            let unit = 15.75;
            if(angle === 0){
                x = e;
                y = f;
                width = a === 1 ? values.args[0].width : a; // Mi300 figured it out somehow bruh
                height = d === 1 ? values.args[0].height : d;
            }else{
                return; //I will add this logic later
            }
            current.screenXY = [x, y];
            if (values.args[0]._txt && x > 0 && y > 0) { //thank you Mi300 for explaining this part
                let temp = {
                    text: values.args[0]._txt,
                    drawImage: {
                        x: x,
                        y: y
                    },
                    width: width,
                    height: height,
                    center: {
                        x: x + (width / 2),
                        y: y + (height / 2),
                    },
                    angle_in_radians: angle,
                    setTransform: transform_matrix,
                    canvas: values.args[0],
                }
                placeholder.texts.all.push(temp);
                //debug({x:x+width, y:y+height}, {x: x, y: y});
                fctx.beginPath();
                fctx.fillStyle = 'yellow';
                fctx.arc(temp.center.x, temp.center.y, 5, 0, Math.PI*2);
                fctx.fill();
                for(let circle of circles.all){
                    if(hasApproxX(circle.x, temp.center.x, 4.5) && Math.abs(temp.center.y+(circle.radius*2)-circle.y) < 10){
                        fctx.beginPath();
                        fctx.strokeStyle = 'red';
                        fctx.moveTo(temp.center.x, temp.center.y);
                        fctx.lineTo(circle.x, circle.y);
                        fctx.stroke();
                        //debug({x: circle.x, y: temp.center.y+(circle.radius*2)});
                        //console.log(Math.abs(temp.center.y+(circle.radius*2)-circle.y), circle.y, temp.text);
                    }
                }
                //values.args[0].getContext('2d').fillStyle = custom_colors.text;
            }
        }
            break
        case 'fillText':
            //detect data for FOV
            if (values.args[0].startsWith("Lvl ") && isPlayerInGame()) {
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
        case 'strokeRect':{
            /* OLD MINIMAP DETECTION
            let _t = values.thisArgs.getTransform();
            let _c = placeholder.minimap.corners;
            _c.top_left[0] = _t.e;
            _c.top_left[1] = _t.f;
            debug({x: _c.top_left[0], y: _c.top_left[1]});
            _c.top_right[0] = _t.e + _t.a;
            _c.top_right[1] = _t.f;
            debug({x: _c.top_right[0], y: _c.top_right[1]});
            _c.bottom_left[0] = _t.e;
            _c.bottom_left[1] = _t.f + _t.d;
            debug({x: _c.bottom_left[0], y: _c.bottom_left[1]});
            _c.bottom_right[0] = _t.e + _t.a;
            _c.bottom_right[1] = _t.f + _t.d;
            debug({x: _c.bottom_right[0], y: _c.bottom_right[1]});
            //debug({x: _t.e, y: _t.f});
            //debug({x: _t.a, y: _t.d});
            */
            }
            break
        case 'clearRect':
            if(values.thisArgs === ctx)img_present = false;
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
        if (is_color(team, context.fillStyle) || is_gradient(context.fillStyle, diep_user_colors[team])) {
            color_found = true;
        }
    }
    for (let color of other) {
        if (is_color(color, context.fillStyle) || is_gradient(context.fillStyle, diep_user_colors[color])) {
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

/* OLD
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
*/

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

//new
function update_drone(sides, color, clr){
    //let's decide what we're dealing with
    //sides = 3 or 4, color = real color, diep_user_colors[clr] original color
    let team, shape;
    const teams = ['red_team', 'blue_team', 'green_team', 'purple_team'];
    const everything_else = ['necromancer_squares'];
    let what_shape = () => {
        if(sides == 3) return 'triangle';
        if(sides == 4) return 'square';
        return `something went wrong, sides: ${sides}`;
    }
    let what_team = () => {
        if(teams.includes(clr)) return clr;
        if(everything_else.includes(clr)) return 'necromancer_squares';
        return `something went wrong, clr: ${clr}`;
    }
    shape = what_shape();
    team = what_team();
    //now let's create the actual drone (mostly copy pasted from old function)
    let drone = new Map(); //used a map instead of Array, because I can't push a key with a value
    let moveTo = define_current('moveTo').screenXY;
    let points = [moveTo];
    let point_num = 1;
    drone.set('team', team);
    drone.set('shape', shape);
    drone.set('moveTo', moveTo);
    for (let line of communicator.lines) {
        points.push(line);
        drone.set(`lineTo${point_num}`, line);
        point_num++;
    }
    drone.set('center', get_average(points));
    //if it's a triangle drone then it can't be necromancer body, so skip
    if(shape === 'triangle'){
        placeholder.drones.over.push(drone);
        return;
    }
    //now the retarded dumbass fuck necro body detection
    let _isdrone = true; //only set it to false if it's necro body
    //console.log('loop start');
    for(let turret of turrets.other){ //Overseer turrets are from source_array: other
        //console.log(turret.name);
        if(turret.name === 'Overseer'){
            //moveTo point is always inside the body, so no need to check others for collision
            let t_point = turret.points[0];
            //console.log(t_point);
            if(pointInPolygon(t_point, points)){
                _isdrone = false
                let temp_body = new Map([
                    ['type', 'Rectangle'],
                    ['radius', calculate_distance(...drone.get('center'), ...points[0])],
                    ['x', drone.get('center')[0]],
                    ['y', drone.get('center')[1]],
                    ['points', points],
                ]);
                console.log(tankOrder);
                tankOrder.length = 0;
                unusual_bodies.all.push(temp_body);
                console.log('necro body found!');
                //console.log(temp_body);
                break
            }
        }
    }
    if(!_isdrone){
        placeholder.drones.necro.push(drone);
        //console.log(color, diep_user_colors[clr]);
        if(color != diep_user_colors[clr]){
        debug({x: moveTo[0], y: moveTo[1]*0.5});
        }else{
        debug({x: moveTo[0], y: moveTo[1]*1.5});
        }
    }
}

/* OLD
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

    //Logic to separate drones from square tank bodies & separate base drones from over drones
    let _isdrone = true;
    if(type.shape === "square"){
        for(let turret of turrets.other){
            if(turret.name === 'Overseer'){
                //moveTo point is always inside the body, so no need to check others for collision
                let t_point = turret.points[0];
                if(pointInPolygon(t_point, points)){
                    _isdrone = false
                    let temp_body = new Map([
                        ['type', 'Rectangle'],
                        ['radius', calculate_distance(...drone.get('center'), ...points[0])],
                        ['x', drone.get('center')[0]],
                        ['y', drone.get('center')[1]],
                        ['points', points],
                    ]);
                    unusual_bodies.all.push(temp_body);
                    //console.log('necro body found!');
                    break
                }
            }
        }
        if(_isdrone) placeholder.drones.necro.push(drone);//console.log('necro drone found!');
    }
    //placeholder.drones;
    if(!_isdrone){ //TEST IF GRADIENT IS APPLIED ON BODY
        debug({x: drone.get('center')[0]*1.5, y: drone.get('center')[1]*1.5});
    }

    // !!!debug!!!
    let f, cent, vector, p0, p1, p2, p3, left, right;
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
            if(!_isdrone) return
    f = 2.5;
    p0 = drone.get('moveTo');
    p1 = drone.get('lineTo1');
    p2 = drone.get('lineTo2');
    p3 = drone.get('lineTo3');

    left = {
        x: (p0[0] + p3[0]) / 2,
        y: (p0[1] + p3[1]) / 2
    };
    right = {
        x: (p1[0] + p2[0]) / 2,
        y: (p1[1] + p2[1]) / 2
    };

    cent = {
        x: drone.get('center')[0],
        y: drone.get('center')[1]
    };

    vector = {
        x: left.x - right.x,
        y: left.y - right.y
    };

    drone.set('vector', vector);

    debug(cent, {
        x: cent.x + (vector.x * f),
        y: cent.y + (vector.y * f)
    });
    break;
    }
    // !!!debug!!!
}
*/


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
    //adding the new made shape inside global array of shapes
    placeholder.shapes[plural].push(shape);

    //let a = calculate_distance(points[0][0], points[0][1], points[1][0], points[1][1]);
    //sizes.shapes[type] = a;
    //console.log(`length of ${type} shape is ${unscale(a)} with _player.FOV`);;
}

function update_arrow(type) {
    const moveTo = define_current('moveTo');
    const points = [moveTo.screenXY, ...communicator.lines];
    if(type === 'minimap'){
        const raw_center = get_average(points);
        const real_center = [
            minimap.corners.top_left[0] + raw_center[0],
            minimap.corners.top_left[1] + raw_center[1]
        ];
        placeholder.arrows[type].center = real_center;
    }else{
        placeholder.arrows[type].center = get_average(points);
    }
    debug({
        x: placeholder.arrows[type].center[0],
        y: placeholder.arrows[type].center[1]
    });
    /* OLD
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
    */
}

let clear_keys_instructions = [
    {
        dynamic: placeholder.smasher_branch_addons,
        static: smasher_branch_addons,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.bosses,
        static: bosses,
        scenario: 'single',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.circles,
        static: circles,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.texts,
        static: texts,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.unusual_bodies,
        static: unusual_bodies,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.turrets,
        static: turrets,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.drones,
        static: drones,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.shapes,
        static: shapes,
        scenario: 'arrays',
        arr_type: 'empty',
        },
    {
        dynamic: placeholder.arrows,
        static: arrows,
        scenario: 'nested arrays',
        arr_type: 'coords',
        },
    {
        dynamic: placeholder.minimap,
        static: minimap,
        scenario: 'nested arrays',
        arr_type: 'coords',
        },
    {
        dynamic: placeholder.bases,
        static: bases,
        scenario: 'nested arrays',
        arr_type: 'coords',
    },
    {
        dynamic: placeholder.bars,
        static: bars,
        scenario: 'arrays',
        arr_type: 'empty',
    }
];

function clear_keys(dynamic, static, scenario, arr_type){
    switch(scenario){
        case 'single':
            for(let key in static){
                static[key] = dynamic[key];
                dynamic[key] = null;
            }
            break
        case 'arrays':
            for(let key in static){
                if(arr_type === 'empty'){
                    //if(dynamic[key].length < static[key].length) static[key].length = 0; //clean before using
                    static[key].length = 0; //clean before using
                    //console.log('before: ', dynamic, static);
                    let l = dynamic[key].length;
                    for(let i = 0; i<l; i++){
                        //console.log('during: ', dynamic, static);
                        static[key][i] = dynamic[key][i];
                    }
                    dynamic[key].length = 0;
                    //console.log('after: ', dynamic, static);
                }else if(arr_type === 'coords'){
                    static[key][0] = dynamic[key][0];
                    static[key][1] = dynamic[key][1];
                    dynamic[key][0] = 0;
                    dynamic[key][1] = 0;
                }
            }
            break
        case 'nested arrays':
            //console.log('static, dynamic arrays: ', static, dynamic);
            for(let key in static){
                for(let subkey in static[key]){
                    //console.log('key, subkey: ', key, subkey);
                    //console.log('dynamic[key]: ', dynamic[key]);
                    //console.log('dynamic[key][subkey]: ', dynamic[key][subkey]);
                    if(arr_type === 'empty'){
                        static[key][subkey].length = 0; //clean before using
                        let l = dynamic[key][subkey].length;
                        for(let i = 0; i<l; i++){
                            static[key][subkey][i] = dynamic[key][subkey][i];
                        }
                        dynamic[key][subkey].length = 0;
                    }else if(arr_type === 'coords'){
                        static[key][subkey][0] = dynamic[key][subkey][0];
                        static[key][subkey][1] = dynamic[key][subkey][1];
                        dynamic[key][subkey][0] = 0;
                        dynamic[key][subkey][1] = 0;
                    }
                }
            }
            break
    }
}

function placeholder_apply() {
    //old logic
    // Ensure `placeholder` properties exist before copying
    /*
    if (!placeholder.smasher_branch_addons) placeholder.smasher_branch_addons = {
        smasher_addons: [],
        spike_addons: [],
    }
    if (!placeholder.circles) placeholder.circles = {
        all: [],
    };
    if (!placeholder.unusual_bodies) placeholder.unusual_bodies = {
        all: [],
    }
    if (!placeholder.turrets) placeholder.turrets = {
        rectangular: [],
        other: [],
    };
    if (!placeholder.texts) placeholder.texts = {
        all: [],
    };
    if (!placeholder.bosses) placeholder.bosses = {
        fallen_booster: null,
        fallen_ol: null,
        necromancer: null,
        guardian: null,
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
    smasher_branch_addons = structuredClone(placeholder.smasher_branch_addons);
    circles = structuredClone(placeholder.circles);
    unusual_bodies = structuredClone(placeholder.unusual_bodies);
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
    */
    //new logic
    let l = clear_keys_instructions.length;
    for(let i = 0; i < l; i++){
        clear_keys(clear_keys_instructions[i].dynamic, clear_keys_instructions[i].static, clear_keys_instructions[i].scenario, clear_keys_instructions[i].arr_type);
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

//helper function [NEW!]
function polygon_to_circle(points){
    let center = get_average(points);
    let circle = {
        x: center[0],
        y: center[1],
        radius: Math.hypot(center[0] - points[0][0], center[1] - points[0][1])
    }
    return circle;
}

//new logic
function check_turret_body_collision(turret, body, bodyRadiusFactor = 1) { //bodyRadiusFactor increases the body radius value passed to collision detection, but not the radius itself
    let bool = false;
    const b_type = body instanceof Map ? body.get('type') : body.type;
    //console.log(b_type);
    switch (turret.source_array) {
        case "rectangular":
            //console.log('1. Outer switch');
            //console.log(body);
            switch (b_type) {
                case "Rectangle":
                    //console.log('Turret: rectangular Body: Rectangle');
                    //console.warn('missing logic. Reason: At the time of developing this code, there is no known tank with that combination');
                    return false;
                    break
                case "hexadecagon":
                    //console.log('Turret: rectangular Body: hexadecagon');
                    //console.warn('missing logic. Reason: At the time of developing this code, there is no known tank with that combination');
                    return false;
                case "circle":
                    //console.log('Turret: rectangular Body: circle');
                    bool = is_point_inside_circle({
                        x: turret.coords.startX,
                        y: turret.coords.startY
                    }, {
                        radius: body.radius * bodyRadiusFactor,
                        x: body.x,
                        y: body.y,
                    });
                    break
            }
            break
        case "other":
            //console.log('2. Outer switch');
            //console.log(body);
            switch (b_type) {
                case "Rectangle":{
                    //console.log('Turret: other Body: Rectangle');
                    let new_body = polygon_to_circle(body.get('points'));
                    for (let point of turret.points) {
                        bool = (is_point_inside_circle({
                            x: point[0],
                            y: point[1]
                        }, {
                            radius: new_body.radius * bodyRadiusFactor,
                            x: new_body.x,
                            y: new_body.y,
                        }));
                        if(bool) break; //if we don't quit here bool=true -> bool=false can happen
                    }
                }break
                case "hexadecagon":{
                    //console.log('Turret: other Body: hexadecagon');
                    //since it's almost a circle, I will turn it into one
                    let new_body = polygon_to_circle(body.get('points'));
                    for (let point of turret.points) {
                        bool = (is_point_inside_circle({
                            x: point[0],
                            y: point[1]
                        }, {
                            radius: new_body.radius * bodyRadiusFactor,
                            x: new_body.x,
                            y: new_body.y,
                        }));
                        if(bool) break; //if we don't quit here bool=true -> bool=false can happen
                    }
                }break
                case "circle":
                    //console.log('Turret: other Body: circle');
                    for (let point of turret.points) {
                        bool = (is_point_inside_circle({
                            x: point[0],
                            y: point[1]
                        }, {
                            radius: body.radius * bodyRadiusFactor,
                            x: body.x,
                            y: body.y,
                        }));
                        if(bool) break; //if we don't quit here bool=true -> bool=false can happen
                    }
                    break
            }
            break
    }
    //console.log(turret, body, bool);
    return bool; //almost forgot that lol
}

function determine_the_tank_name(body_type, turrets, addons){
    //handle smasher branch
    let is_smasher = (addons.length > 0);
    switch(addons.length){
        case 2:
            if(addons[0].get('type') === 'smasher addon' && addons[1].get('type') === 'smasher addon') return 'Landmine';
            break
        case 4:
            if(
                addons[0].get('type') === 'spike addon' &&
                addons[1].get('type') === 'spike addon' &&
                addons[2].get('type') === 'spike addon' &&
                addons[3].get('type') === 'spike addon'
            ) return 'Spike';
            break
    }
    if(is_smasher){
        switch(turrets.length){
            case 0: return 'Smasher';
            case 1: if(turrets[0].name === 'Auto') return 'Auto Smasher';
        }
    }
    //format the turrets [ [turret_type, amount], [...] ]
    let temp_map = new Map();
    for(let turret of turrets){
        let temp_name = turret.name;
        if(temp_map.has(temp_name)){
            let temp_value = temp_map.get(temp_name);
            temp_map.set(temp_name, temp_value+1);
        }else{
            temp_map.set(temp_name, 1);
        }
    }
    //now we go through the array with tank definitions
    for(let checking_tank in turrets_of_tank){
        let arr = turrets_of_tank[checking_tank].turrets;
        let l = arr.length;
        //in out map we have (temp_map.size) amount of different turrets
        //and the tank definition we are checking, has (arr.length) amount of different turrets
        //so we can just skip if they're not the same
        if(l === temp_map.size){
            let matches = 0;
            for(let i = 0; i < l; i++){ //loop through turrets and their amounts inside tank definition
                let temp_value = arr[i][0];
                let temp_name = arr[i][1];
                //if either 1 tank type is missing, is different or the amount of turrets is different, then we can exist the tank definition
                if(!temp_map.has(temp_name) || temp_map.get(temp_name) != temp_value) break
                //if we didn't quit this for loop yet, that means we got the turret type and the correct amount
                matches++;
            }
            //console.log(matches, l, checking_tank);
            if(matches === l) {
                //Rectangle body: (1 turret) -> Factory, (2 turrets) -> necro. Circle body: (1 turret) -> Manager, (2 turrets) -> Overseer
                let result = checking_tank; //we can just use the tank definition key, since it's always the tank name
                if(checking_tank === 'Overseer'){
                    (body_type==='Rectangle') ? result = 'Necromancer' : result = 'Overseer';
                }else if(checking_tank === 'Manager'){
                    (body_type==='Rectangle') ? result = 'Factory' : result = 'Manager';
                }
                //console.log(result, body_type);
                return result;
            }
        }
    }
    //if we failed to get any tank, we return Unknown Tank by default
    return 'Unknown Tank';
}

function filter_out_addons(body, addons){
    if(body.type != 'circle') return [];
    let _r = body.radius;
    let inside = [];
    for(let temp_addon of addons){
        if(calculate_distance(temp_addon.get('x'), temp_addon.get('y'), body.x, body.y) <= _r){
            inside.push(temp_addon);
        }
    }
    return inside;
}

function merge_identical_tanks(tanks) {
    const merged = [];
    const used = new Set();

    for (let i = 0; i < tanks.length; i++) {
        if (used.has(i)) continue;

        const tankA = tanks[i];
        const newTank = {
            name: tankA.name,
            turrets: tankA.turrets,
            body: [tankA.body], // Start with the first body
        };

        for (let j = i + 1; j < tanks.length; j++) {
            if (used.has(j)) continue;
            const tankB = tanks[j];

            // Simple reference match for turrets (same object)
            if (tankA.turrets.length === tankB.turrets.length &&
                tankA.turrets.every((t, idx) => t === tankB.turrets[idx])) {
                newTank.body.push(tankB.body);
                used.add(j);
            }
        }
        //check for fallen overlord & fallen booster
        let is_fallen = false;
        for(let temp_body of newTank.body){
            if(is_color('fallen_bosses', temp_body.color)){
                is_fallen = true;
                break;
            }
        }
        if(is_fallen){
            switch(newTank.name){
                case 'Overlord':
                    newTank.name = 'Fallen Overlord';
                    placeholder.bosses.fallen_ol = newTank;
                    break
                case 'Booster':
                    newTank.name = 'Fallen Booster';
                    placeholder.bosses.fallen_booster = newTank;
                    break
            }
        }else{
            merged.push(newTank);
        }
        used.add(i);
    }

    return merged;
}


function construct_tanks() {
    let potential_tanks = []; //store tanks here
    let temp_turrets = [...turrets.rectangular, ...turrets.other]; //combine both turret types in 1 array
    let temp_smasher_addons = [...smasher_branch_addons.smasher_addons, ...smasher_branch_addons.spike_addons]; //the spinning thingies for smasher
    let temp_circles = [...unusual_bodies.all, ...circles.all];

    for (let circle of temp_circles) { //go through all circles
        let found_addons = filter_out_addons(circle, temp_smasher_addons);
        if (!is_color('barrels', circle.color)) { //gray circles overlap with auto turrets, this is not a tank!
            let found_turrets = []; // store all turrets colliding with the current circle here
            for (let temp_turret of temp_turrets) { //go through all combined turrets
                if (check_turret_body_collision(temp_turret, circle)) found_turrets.push(temp_turret); //check collision between circle and turret & store if colliding
            }
            //now let's actually construct the tank
            if (found_turrets.length != 0 || found_addons.length != 0) { //Tanks need to have at least 1 turret, or it's a bullet. (except for smashers)
                const c_type = circle instanceof Map ? circle.get('type') : circle.type;
                let temp_tank = {
                    name: determine_the_tank_name(c_type, found_turrets, found_addons),
                    turrets: found_turrets,
                    smasher_addons: found_addons,
                    body: circle,
                }
                potential_tanks.push(temp_tank);
            }
        }
    }
    //and finally bingo, your tanks are ready
    return merge_identical_tanks(potential_tanks);
}

function debug(to, from = {
    x: canvas.width / 2,
    y: canvas.height / 2,
}) {
    if (!debug_visible) {
        return;
    }
    //let ctx = canvas.getContext('2d');
    let original_ga = fctx.globalAlpha;
    let original_lw = fctx.lineWidth;
    fctx.globalAlpha = 1;
    fctx.lineWidth = 1;
    fctx.moveTo(from.x, from.y);
    fctx.lineTo(to.x, to.y);
    fctx.stroke();
    fctx.globalAlpha = original_ga;
    fctx.lineWidth = original_lw;
    update_fake_canvas();
}

/* === external operations === */

class API {
    constructor(version) {
        this.version = ripsaw_api_version;
    }
    help(){
        console.log(`%c--<=[ Canvas API by r!PsAw v. ${this.version} ]=>--

[Introduction]
Welcome dear canvas API user. It took me a few years to start learning about Canvas in JavaScript deeper, but I managed to do it!
I came as far as making this huge project. It took me countless hours to connect everything in a way that makes sense, even the bypass
that makes this entire thing work was discovered by me. I am forced to obfuscate it so other people like Mi300 don't steal it and
make it look like they made it, effectively ruining my weeks of searching. So if you don't trust me or this script you're free to leave.
Well since you're seeing this message that doesn't even matter anymore. But trust me fr, I would never try to ruin my reputation by
placing some rat inside of this script. In fact I don't even know how to code stuff like this lol, all I ever made was a zip bomb.
Lmao. Anyways I reverse engineered diep.io for a few years now, learning JavaScript at the same time so I have a lot of knowledge.

[Command List]
You can write any of these after 'ripsaw_api.'
version;
help();
toggle_debug();
toggle_rect_ratio_debug();
get_canvas_method(method);
get_bases();
get_minimap();
get_texts();
get_your_lvl();
get_your_tank_name();
get_your_body();
get_FOV();
get_arrows();
get_bosses();
get_shapes();
get_turrets();
get_circles();
get_drones();
get_tanks();
set_custom_color(where, color);

[Each Command Explained]
(I'm too lazy to make it right now — you basically get either numeric values for calculations or coordinates of things on your screen)
--<======================================================>--`,
"font-weight: bold; font-size: 25px;color: lightgray; text-shadow: 2px 2px 2px black; margin-bottom: 5px; padding: 1%");
    }
    get_closest(array) {
        if(array[0] && array[0].turrets) return console.warn('player Array not supported yet');
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
    toggle_ratio_debug() {
        ratio_debug = !ratio_debug;
    }
    toggle_rect_ratio_debug() {
        rect_ratio_debug = !rect_ratio_debug;
        if(rect_ratio_debug) input.inGameNotification('Warning this debugging function is laggy');
    }
    get_canvas_method(method){
        return define_current(method);
    }
    get_bases(){
        return bases;
    }
    get_minimap(){
        return minimap;
    }
    get_texts(){
        return texts;
    }
    get_your_lvl(){
        return _player.level;
    }
    get_your_tank_name(){
        return _player.tank
    }
    get_your_body(){
        return _player.body;
    }
    get_FOV() {
        return _player.FOV;
    }
    get_arrows() {
        return arrows;
    }
    get_bosses() {
        return bosses;
    }
    get_shapes() {
        return shapes;
    }
    get_turrets() {
        return turrets;
    }
    get_circles() {
        return circles
    }
    get_drones() {
        return drones;
    }
    get_bars() {
        return bars;
    }
    get_tanks() {
        return construct_tanks();
    }
    set_custom_color(where, color){
        if(!custom_colors[where]) return;
        custom_colors[where] = color;
    }
}

window.ripsaw_api = new API();

function update_api_values(){
    window.requestAnimationFrame(update_api_values);
    //...
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
    //console.log(unusual_bodies);
}
setInterval(test_external_operations, 500);

//init
start_proxies();