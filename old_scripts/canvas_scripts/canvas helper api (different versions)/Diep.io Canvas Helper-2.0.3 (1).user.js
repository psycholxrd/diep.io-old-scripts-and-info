// ==UserScript==
// @name         Diep.io Canvas Helper
// @namespace    http://tampermonkey.net/
// @version      2.0.3
// @description  canvas manipulation
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==
let debug_visible = true; //turn this on to draw lines to shapes & Arrows
/*
- Arrow detection √
- Shapes detection √
- Drones detection (√)
- Player Detection (√)

(Work in progress...)
- different Drones Detection
- Bosses Detection
- Turrets Detection
- Text coordinates detect
- Scoreboard reader
*/

//COLOR GETTER SCRIPT (by r!Psaw, aka me :P )
let ui_color_range = {
    min: 1,
    max: 7
}

let net_color_range = {
    min: 0,
    max: 27
}

function get_style_color(property){
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
}

//single use
//let diep_user_colors = update_your_colors();
//loop
let diep_user_colors;
function update_colors(){
    window.requestAnimationFrame(update_colors);
if(input && window.lobby_ip){
  diep_user_colors = update_your_colors();
  //console.log("updated colors:");
  //console.log(diep_user_colors);
}
}
window.requestAnimationFrame(update_colors);

function get_hex(convar){
    let diep_hex = input.get_convar(convar);
    let normal_hex = "#"+diep_hex.split("x")[1];
    return normal_hex;
}

function get_hidden(type, number){
    type === "UI"?(ui_color_range.min <= number && number <= ui_color_range.max)?null:console.log("illegal Number!"):type === "NET"?(net_color_range.min <= number && number <= net_color_range.max)?null:("illegal Number!"):console.log("illegal Type!");
    switch (type){
        case "UI":
            return get_style_color(`--uicolor${number}`);
            break
        case "NET":
            return get_style_color(`--netcolor${number}`);
            break
    }
}

function update_your_colors(){
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
let methods = [
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
let patterns = { //set debug_visible to false when using these
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
let sizes = {
    shapes: {
        square: 0,
        triangle: 0,
        pentagon: 0,
        big_pentagon: 0,
        crasher: 0,
        big_crasher: 0,
    },
    drones: {
        over: 0,
        necro: 0,
        battleship: 0,
        base: 0,
        summoner: 0,
        guardian: 0,
    }
}

let bosses = {
    fallen_booster: {x: null, y: null},
    fallen_ol: {x: null, y: null},
    necromancer: {x: null, y: null},
    guardian: {x: null, y: null}
}
let drones = {
    over: [], //overlord, overseer, manager, hybrid, overtrapper
    necro: [],
    battleship: [],
    base: [],
    summoner: [],
    guardian: []
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
    dimension: {//invisible arrow, used to determine minimap size
        moveTo: [0, 0],
        lineTo1: [0, 0],
        lineTo2: [0, 0],
        center: [0, 0]
    },
}

let placeholder = [// script will work with this data, to store it in the actual one. This is done, because canvas api is retarded
    bosses,
    drones,
    shapes,
    arrows
];

//classes
class Proxy_communicator {
    constructor(){
        this.last = null;
        this.order = [];
        this.lines = []; //store xy from lineTo's here, because lineTo proxy class can only save 1 at the time
        this.transform = [0, 0, 0, 0, 0, 0];
    }
    announce(proxy_class){
        if(is_beginPath(proxy_class.name)){
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
    has_pattern(pattern){
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
        if(o_l != p_l){
            return false;
        }

        //console.log('first condition met!');

        for(let i = 0; i < o_l; i++){
            /*
            console.log(`
            i ${i}
            pattern[i] ${pattern[i]}
            this.order[i] ${this.order[i]}
            counter ${counter}
            `);
            */

            if(pattern[i] === this.order[i]){
                counter++;
            }
        }

        //console.log(`final ${counter === p_l}`);

        return (counter === p_l);
    }
}

class Proxy_class {
    constructor(method){
        this.name = method;
        this.calls = 0;
        this.target = null;
        this.thisArgs = null;
        this.args = null;
        this.screenXY = [null, null];
    }
    update_tta(target, thisArgs, args){
        if(is_beginPath(this.name)){
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

const communicator = new Proxy_communicator();
let method_classes = [];

//functions
function calculate_distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function is_beginPath(name){
    //console.log(`is_beginPath called with ${name}`);

    return (name === 'beginPath');
}

function start_proxies(){
    //console.log('start_proxies called');

    methods.forEach(start_proxy);
    Object.freeze(crx);
}

function define_current(method){
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

function start_proxy(method){
    //console.log(`start_proxy called with ${method}`);

    //define class outside proxies, to avoid repetition
    let current = new Proxy_class(method);
    method_classes.push(current);

    //console.log(`${current} created a new Proxy_class & pushed inside method_classes, check:`);
    //console.log(method_classes);

    crx[method] = new Proxy(crx[method], {
        apply(target, thisArgs, args) {
            /*
            if(diep_user_colors && thisArgs.fillStyle === diep_user_colors.triangle){
                console.log(`color detected at ${method}. Args: ${args}`);
            }
            */
            current = define_current(method);

            //console.log(`current redefined inside proxy: ${method} to ${current}`);

            current.update_tta(target, thisArgs, args);
            current.calls++;
            communicator.announce(current);

            handle_proxy(method, {target: target, thisArgs: thisArgs, args: args});
            //logic
            return Reflect.apply(target, thisArgs, args);
        }
    });
}

function handle_proxy(type, values){
    //console.log(`working on proxy ${type}`);
    let current = define_current(type);
    let x, y;
    switch(type){
        case 'setTransform':
            communicator.setTransform = values.args;
            break
        case 'fill':
            if(communicator.has_pattern(patterns.arc)){
                x = communicator.setTransform[4];
                y = communicator.setTransform[5];
                let target = define_current('arc');
                target.screenXY = [x, y];
                debug({x:x,y:y});
                //console.log(`arc updated coords ${target.screenXY}`);
            }else if(communicator.has_pattern(patterns.triangle)){
                //console.log(values.thisArgs.fillStyle);
                //console.log(values.thisArgs.globalAlpha);
                if(is_arrow(values.thisArgs)){
                    switch(true){
                        case (values.thisArgs.globalAlpha === 0.3499999940395355):
                            update_arrow('leader');
                            break
                        case (values.thisArgs.globalAlpha > 0.9):
                            update_arrow('minimap');
                            break
                    }
                }

                if(is_shape('triangle', values.thisArgs)){
                    //console.log('TRIANGLE FOUND');
                    update_shape('triangle');
                }

                if(is_shape('crasher', values.thisArgs)){
                    //console.log('TRIANGLE FOUND');
                    update_shape('crasher');
                }

                if(is_drone(values.thisArgs)){
                    update_drone(values.thisArgs.fillStyle);
                }
            }else if(communicator.has_pattern(patterns.square)){
                if(is_shape('square', values.thisArgs)){
                    //console.log('SQUARE FOUND');
                    update_shape('square');
                }

                if(is_drone(values.thisArgs)){
                    update_drone(values.thisArgs.fillStyle);
                }
            }else if(communicator.has_pattern(patterns.pentagon)){
                if(is_shape('pentagon', values.thisArgs)){
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
            break
        default:{
            //add logic
        }
    }
}

function is_drone(context){
    let teams = ['red_team', 'blue_team', 'green_team', 'purple_team'];
    let other = ['necromancer_squares'];
    if(diep_user_colors){
        let color_found = false;
        for(let team of teams){
            if(diep_user_colors[team] === context.fillStyle){
                color_found = true;
            }
        }
        for(let color of other){
            if(diep_user_colors[color] === context.fillStyle){
                color_found = true;
            }
        }
        //console.log(color_found);
        return color_found;
    }
    return false;
}

function is_arrow(context){
    return (context.fillStyle === '#000000');
}

function is_shape(type, context){
    if(diep_user_colors){
        return (diep_user_colors[type] === context.fillStyle);
    }
    return false;
}

function find_drone_type(drone_color){
    let shape = (communicator.lines.length === 2) ? 'triangle' : 'square';
    let colors = ['red_team', 'blue_team', 'green_team', 'purple_team', 'necromancer_squares'];
    let output, drone;
    for(let color of colors){
        (diep_user_colors[color] === drone_color) ? output = color : null;
    }
    if(output === 'necromancer_squares' && shape != 'square'){
        throw Error(`shape: ${shape} expected: square`);
    }
    drone = {team: output, shape: shape};
    //console.log(drone);
    return drone;
}

function get_percent(hundred, snippet){
    return (snippet/hundred)*100;
}

function get_percentage(percent, of){
    return (of/100)*percent;
}

function get_average(points){
    let result = [0, 0];
    for(let point of points){
        result[0] += point[0];
        result[1] += point[1];
    }
    result[0] /= points.length;
    result[1] /= points.length;
    return result;
}

function compare_sizes_in_percent(a){
    let percents = [];
    for(let shape in sizes.shapes){
        if(sizes.shapes[shape] != 0){
            let percent = Math.floor(get_percent(sizes.shapes[shape], a));
            percents.push(percent);
        }else{
            percents.push(-1);
        }
    }
    return percents;
}

function check_bigger_percent(shape, value, a){
    let percents = compare_sizes_in_percent(a);
    let index = sizes.shapes.indexOf(sizes.shapes[shape]);
    return (value > percents[index]);
}

function check_smaller_percent(shape, value, a){
    let percents = compare_sizes_in_percent(a);
    let index = sizes.shapes.indexOf(sizes.shapes[shape]);
    return (value < percents[index]);
}

function update_drone(color){ //Necromancer & Factory body gets detected too
    let type = find_drone_type(color);
    let moveTo = define_current('moveTo').screenXY;
    let points = [moveTo];
    let point_num = 1;
    let drone = new Map(); //used a map instead of Array, because I can't push a key with a value
    drone.set('team', type.team);
    drone.set('shape', type.shape);
    drone.set('moveTo', moveTo);

    for(let line of communicator.lines){
        points.push(line);
        drone.set(`lineTo${point_num}`, line);
        point_num++;
    }
    //console.log(points);
    drone.set('center', get_average(points));

    // !!!debug!!!
    let f, cent, vector;
    switch(type.shape){
        case 'triangle':
            f = 2.5;
            cent = {x: drone.get('center')[0], y: drone.get('center')[1]};
            vector = {x: moveTo[0] - cent.x, y: moveTo[1] - cent.y};
            debug({x: moveTo[0] + (vector.x*f), y: moveTo[1] + (vector.y*f)}, {x: drone.get('center')[0], y: drone.get('center')[1]});
            break
        case 'square':
            cent = {x: drone.get('center')[0], y: drone.get('center')[1]};
            debug({x: cent.x, y: cent.y});
            break
    }
    // !!!debug!!!

    let a = calculate_distance(points[0][0], points[0][1], points[1][0], points[1][1]);
    let percents = compare_sizes_in_percent(a);

    console.log(`
    Checking ${type.team} ${type.shape} ...
    a: ${a}
    square ${sizes.shapes.square} | ${percents[0]}%
    triangle ${sizes.shapes.triangle} | ${percents[1]}%
    pentagon ${sizes.shapes.pentagon} | ${percents[2]}%
    big_pentagon ${sizes.shapes.big_pentagon} | ${percents[3]}%
    crasher ${sizes.shapes.crasher} | ${percents[4]}%
    big_crasher ${sizes.shapes.big_crasher} | ${percents[5]}%
    `);
    //console.log(a);

    //Logic to separate drones from square tank bodies & separate base drones from over drones
    //placeholder.drones;
}

let mistakes = 0;
function update_shape(type){
    let plural = type + 's'; //triangle = shapes.triangles
    //basically constructing the shape from information stored
    let moveTo = define_current('moveTo').screenXY;
    let points = [moveTo];
    let point_num = 1;
    let shape = new Map(); //used a map instead of Array, because I can't push a key with a value
    shape.set('moveTo', moveTo);

    for(let line of communicator.lines){
        points.push(line);
        shape.set(`lineTo${point_num}`, line);
        point_num++;
    }
    //console.log(points);
    shape.set('center', get_average(points));
    debug({x: shape.get('center')[0], y: shape.get('center')[1]});
    //console.log(shape);
    //adding the new made shape inside global array of shapes
    placeholder.shapes[plural].push(shape);
    //console.log(shapes[plural]);

    let a = calculate_distance(points[0][0], points[0][1], points[1][0], points[1][1]);
    let difference = a-sizes.shapes[type];
    if(difference>get_percentage(35, a) && sizes.shapes[type] != 0){
        //console.log(`diff ${difference} is ${get_percent(a, difference)}% from ${a}`);
        //console.log(`shape ${type} difference ${difference}`);
        if(type != 'crasher' && type != 'pentagon'){
            console.warn('Mistake at update_shape!', mistakes);
            mistakes++;
        }else{
            sizes.shapes['big_'+type] = a;
            console.log(sizes);
            if(sizes.shapes[type] > sizes.shapes['big_'+type]){
                console.warn(`${type} should be smaller than big_${type}`);
            }
            return;
        }
    };
    sizes.shapes[type] = a;
    //console.log(`length of ${type} shape is ${a}`);;
}

function update_arrow(type){
    let moveTo = define_current('moveTo');
    let points = [moveTo.screenXY, communicator.lines[0], communicator.lines[1]];
    placeholder.arrows[type].moveTo = points[0];
    placeholder.arrows[type].lineTo1 = points[1];
    placeholder.arrows[type].lineTo2 = points[2];
    placeholder.arrows[type].center = get_average(points);
    debug({x: placeholder.arrows[type].center[0], y: placeholder.arrows[type].center[1]});
    //let ctx = canvas.getContext('2d');
    //ctx.fillRect(Arrows[type].center[0], Arrows[type].center[1], 150, 150);
    //console.log(Arrows[type]);
}

function placeholder_apply() {
    // Ensure `placeholder` properties exist before copying
    if (!placeholder.bosses) placeholder.bosses = {};
    if (!placeholder.shapes) placeholder.shapes = { squares: [], crashers: [], triangles: [], pentagons: [] };
    if (!placeholder.drones) placeholder.drones = { over: [], necro: [], battleship: [], base: [], summoner: [], guardian: [] };
    if (!placeholder.arrows) placeholder.arrows = { leader: {}, minimap: {}, dimension: {} };

    // Manually deep copy objects to avoid JSON issues
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

function reset_coords(){
    window.requestAnimationFrame(reset_coords);
    //console.log('called reset_coords');
    placeholder_apply();

    method_classes.forEach(reset_coord);
}
window.requestAnimationFrame(reset_coords);

function reset_coord(method_class){
    //console.log(`called reset_coord with ${method_class}`);

    method_class.screenXY = [null, null];
}

function reset_calls(){
    //console.log(`called reset_calls`);

    communicator.lines = [];
    method_classes.forEach(reset_call);
}

function reset_call(method_class){
    //console.log(`called reset_call with ${method_class}`);

    method_class.calls = 0;
}

function array_or_map(object){
    let answer = 'neither';
    (object instanceof Map) ? answer = 'Map' : (object instanceof Array)? answer = 'Array' : null;
    return answer;
}

function debug(to, from = {x: canvas.width/2, y: canvas.height/2}){
    if(!debug_visible){
        return;
    }
    let ctx = canvas.getContext('2d');
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}

/* === external operations === */

function get_closest(array){
    let pos = {
        x: canvas.width/2,
        y: canvas.height/2
    };
    let smallest = {
        element: null,
        distance: canvas.width + canvas.height
    }
    let l = array.length;
    for(let i = 0; i < l; i++){
        let target = array[i];
        if(array_or_map(target) === 'Map'){
            target = array[i].get('center');
        }
        let d = calculate_distance(pos.x, pos.y, target[0], target[1]);
        if(smallest.distance > d){
            smallest.element = target;
            smallest.distance = d;
        }
    }
    return smallest.element;
}

function get_side_length(category, type){
    let size = (sizes[category][type] != 0) ? sizes[category][type] : 'not found yet';
    return size;
}

function find_text(text, mode = 'strict', save = 'no'){
    //Note: text that is being updated very quickly (like Lvl 1 Tank) will not get detected properly
    let current = define_current('fillText');
    let result;
    if(mode === 'strict'){
        (current.args[0]===text) ? result = current.args[0] : null;
    }else{
        (current.args[0].includes(text)) ? result = current.args[0] : null;
    }
    return result;
}

function test_external_operations(){
    let test = get_side_length('shapes', 'square');
    //console.log(test);
}
setInterval(test_external_operations, 500);

//init
start_proxies();