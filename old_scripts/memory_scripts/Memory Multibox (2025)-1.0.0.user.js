// ==UserScript==
// @name         Memory Multibox (2025)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Multibox, AFK, FOV
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @license      MIT
// ==/UserScript==

const basevalue = 37899;
const offsets = {x: 108, y: 117, fov: 130};
let baseindex;

//define win
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

//keys bypass
(function() {
    win.frozenHasFocus = {
        hasFocus: () => true
    };
    document.hasFocus = () => true;
})();


const prop = '_cp5_destroy';
Object.defineProperty(Object.prototype, prop, {
    get: function(){
        return undefined
    },
    set: function(new_val){
        if(this.pauseMainLoop){
            win.N = this;
            console.log('N found! Deleting Object hook for N...');
            delete Object.prototype[prop]
            //not required but nice to have for debugging
            if(!(prop in Object.prototype) && !(prop in {})){
                console.log('%cN Object hook successfully deleted!', 'color: green');
            }else{
                console.warn('N Object hook was not removed, despite N being found! Checking cases...');
                let msg = [prop in Object.prototype, prop in {}];
                msg[0]? console.log('%cObject.prototype still has _cp5_destroy', 'color: red') : null;
                msg[1]? console.log('%cnew created Object still has _cp5_destroy', 'color: red') : null;
            }
        }
    },
    configurable: true,
});

function N_exists(){
    return !!win.N;
}

function dist(x1, y1, x2, y2){
    return Math.hypot(x2 - x1, y2 - y1);
}

//memory hook
    const W = WebAssembly,
        expose = e => {
            try {
                const m = e.memory || Object.values(e).find(x => x instanceof W.Memory);
                if (!m) return;
                const b = m.buffer;
                window.__wasm_memory__ = m;
                window.__wasm_HEAP8 = new Int8Array(b);
                window.__wasm_HEAPU8 = new Uint8Array(b);
                window.__wasm_HEAP16 = new Int16Array(b);
                window.__wasm_HEAPU16 = new Uint16Array(b);
                window.__wasm_HEAP32 = new Int32Array(b);
                window.__wasm_HEAPU32 = new Uint32Array(b);
                window.__wasm_HEAPF32 = new Float32Array(b);
                window.__wasm_HEAPF64 = new Float64Array(b);
                console.log("[wasm-capture] HEAPF32 ready");
                win.exists = true;
            } catch {}
        };
    const wrap = f => async (...a) => {
        const r = await f(...a),
            i = r.instance || r;
        expose(i.exports || {});
        return r;
    };
    W.instantiate = wrap(W.instantiate.bind(W));
    if (W.instantiateStreaming) {
        W.instantiateStreaming = wrap(W.instantiateStreaming.bind(W));
    }


//helper functions
const floatToHex = function (f) { //123.12524e5235 -> 0x...
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setFloat32(0, f, false); // false = big endian (IEEE 754 standard order)
    return '0x' + view.getUint32(0, false).toString(16).padStart(8, '0');
}

const hexToFloat = function(hex) { // 0x... -> 12314.235234e-623523
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    const value = parseInt(hex, 16);
    view.setUint32(0, value, false); // false = big endian
    return view.getFloat32(0, false);
}

//XOR-Shift decoded by Shadam
const buffer = new ArrayBuffer(4);
const int32View = new Int32Array(buffer);
const float32View = new Float32Array(buffer);

const encodeFov = (fovValue) => {
    float32View[0] = fovValue;

    let decoded = (int32View[0] ^ -587202360) + 1577058304;

    const p0 = decoded & 255;
    const p1 = (decoded >>> 8) & 255;
    const p2 = (decoded >>> 16) & 255;
    const p3 = (decoded >>> 24) & 255;

    const B3 = (p0 - 192) & 255;
    const B0 = ((p1 ^ 73) - (21 * B3) - 95) & 255;
    const B2 = ((p2 ^ 214) - (99 * B0) - 88) & 255;
    const B1 = (p3 - (109 * B2)) & 255;

    return ((B3 << 24) | (B2 << 16) | (B1 << 8) | B0) >>> 0;
};

const decodeFov = (value) => {
    const top16 = value >>> 16;
    const top8 = value >>> 24;

    const decoded = (255 & (value + 21 * top8 + 95 ^ 73)) << 8 |
                    (192 + top8 & 255) |
                    (255 & (top16 + 99 * value + 88 ^ 214)) << 16 |
                    (109 * top16 + (value >>> 8)) << 24;

    int32View[0] = decoded - 1577058304 ^ -587202360;
    return float32View[0];
};

function decodeWorldCoords(obf){
    return decodeFov(parseInt(floatToHex(obf)));
}

//keys definition
let diepKeys = {
    KeyA: 65,
    KeyB: 66,
    KeyC: 67,
    KeyD: 68,
    KeyE: 69,
    KeyF: 70,
    KeyG: 71,
    KeyH: 72,
    KeyI: 73,
    KeyJ: 74,
    KeyK: 75,
    KeyL: 76,
    KeyM: 77,
    KeyN: 78,
    KeyO: 79,
    KeyP: 80,
    KeyQ: 81,
    KeyR: 82,
    KeyS: 83,
    KeyT: 84,
    KeyU: 85,
    KeyV: 86,
    KeyW: 87,
    KeyX: 88,
    KeyY: 89,
    KeyZ: 90,
    Digit0: 48,
    Digit1: 49,
    Digit2: 50,
    Digit3: 51,
    Digit4: 52,
    Digit5: 53,
    Digit6: 54,
    Digit7: 55,
    Digit8: 56,
    Digit9: 57,
    Numpad0: 96,
    Numpad1: 97,
    Numpad2: 98,
    Numpad3: 99,
    Numpad4: 100,
    Numpad5: 101,
    Numpad6: 102,
    Numpad7: 103,
    Numpad8: 104,
    Numpad9: 105,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    Space: 32,
    Enter: 13,
    Tab: 9,
    Escape: 27,
    Backspace: 8,
    Delete: 46,
    Insert: 45,
    Home: 36,
    End: 35,
    PageUp: 33,
    PageDown: 34,
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    ShiftLeft: 16,
    ShiftRight: 16,
    ControlLeft: 17,
    ControlRight: 17,
    AltLeft: 18,
    AltRight: 18,
    MetaLeft: 91,
    MetaRight: 93,
    CapsLock: 20,
    NumLock: 144,
    ScrollLock: 145,
    Semicolon: 186,
    Equal: 187,
    Comma: 188,
    Minus: 189,
    Period: 190,
    Slash: 191,
    Backquote: 192,
    BracketLeft: 219,
    Backslash: 220,
    BracketRight: 221,
    Quote: 222
}

function key_down(Key){
    if(!N_exists()) return;
    win.N._set_key_down(diepKeys[Key]);
    //console.log('pressing', Key);
}

function key_up(Key){
    if(!N_exists()) return;
    win.N._set_key_up(diepKeys[Key]);
    //console.log('unpressing', Key);
}

win.key_down = key_down;
win.key_up = key_up;

//generate TAB ID
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

//find index
function find_index() {
    //console.log('called find_index');
    if(baseindex && baseindex != -1){
        //console.log('FOUND baseindex: ', baseindex);
        return
    }
    if(win.exists){
        //console.log('win exists');
        baseindex = window.__wasm_HEAPU32.indexOf(basevalue);
    }
    setTimeout(find_index, 100);
}
find_index();

//movement control
function unpress_all(){
    key_up("KeyW");
    key_up("KeyA");
    key_up("KeyS");
    key_up("KeyD");
}

class MovementControl{
    constructor(){
        this.afk = false;
        this.move2tank = false;
        this.moving = false;
        this.pressed_keys = [0, 0, 0, 0];
        this.afk_goal = {x: 0, y: 0};
        this.tank_goal = {x: 0, y:0};
    }
    toggle_afk(){
        unpress_all();
        this.afk = !this.afk;
        this.move2tank = false;
    }
    toggle_move2tank(){
        unpress_all();
        this.move2tank = !this.move2tank;
        this.afk = false;
    }
}
const mc = new MovementControl();

//store info about your tab
class Tab{
    constructor(){
        this.id = generate_ID(20);
        this.master = false;
        this.last_pos = {x:0, y:0};
        this.current_pos = {x:0, y:0};
        this.predicted_pos = {x:0, y:0};
    }
    update(){
        if(baseindex && baseindex != -1){
            this.last_pos.x = this.current_pos.x;
            this.last_pos.y = this.current_pos.y;
            this.current_pos.x = decodeWorldCoords(window.__wasm_HEAPF32[baseindex+offsets.x]);
            this.current_pos.y = decodeWorldCoords(window.__wasm_HEAPF32[baseindex+offsets.y]);
        }
    }
    predict(){
        this.predicted_pos.x = this.current_pos.x+((this.current_pos.x-this.last_pos.x)*100);
        this.predicted_pos.y = this.current_pos.y+((this.current_pos.y-this.last_pos.y)*100);
    }
    save(){
        GM_setValue(this.id, this.predicted_pos);
    }
}

const you = new Tab();

//handle focus
window.addEventListener("focus", () => {
    if (typeof you !== "undefined" && you) {
        you.master = true;
        unpress_all();
        GM_setValue("Master", you.id);
    }
});

window.addEventListener("blur", () => {
    if (typeof you !== "undefined" && you) {
        you.master = false;
    }
});

//handle movement
function move(goal){
    const your_coords = you.current_pos;
    if (!goal.x || !goal.y) return;
    const distance = dist(goal.x, goal.y, your_coords.x, your_coords.y);
    //console.log('DISTANCE: ', distance);
    //console.log(mc.move2tank, !you.master, distance < 200);
    if(mc.move2tank && !you.master && distance < 300) return unpress_all();
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
    //console.log(quadrant);
    mc.pressed_keys = directionKeys[quadrant];
    //console.log(mc.pressed_keys, quadrant);
    mc.pressed_keys[0] ? key_down("KeyW") : key_up("KeyW");
    mc.pressed_keys[1] ? key_down("KeyA") : key_up("KeyA");
    mc.pressed_keys[2] ? key_down("KeyS") : key_up("KeyS");
    mc.pressed_keys[3] ? key_down("KeyD") : key_up("KeyD");
}

function handle_movement(){
    if(mc.afk){ //AFK logic
        move(mc.afk_goal);
    }else if(mc.move2tank && !you.master){ //move to tank logic
        move(mc.tank_goal);
    }
}

setInterval(handle_movement, 100);

//handle toggling
function set_goal(){
    mc.afk_goal.x = you.current_pos.x;
    mc.afk_goal.y = you.current_pos.y;
}

function handle_world_pos(){
    window.requestAnimationFrame(handle_world_pos);
    you.update();
    you.predict();
    you.save();
    if(!you.master){
        let master = GM_getValue("Master");
        if(!master) return;
        let raw_pos = GM_getValue(master);
        //console.log(raw_pos);
        //if(!raw_pos) return;
        //let parsed_pos = JSON.parse(raw_pos);
        //console.log(raw_pos);
        if(!raw_pos || !raw_pos.x || !raw_pos.y) return;
        mc.tank_goal.x = raw_pos.x;
        mc.tank_goal.y = raw_pos.y;
    }
}
window.requestAnimationFrame(handle_world_pos);

/*
document.onkeydown = function(e) {
    if(!N_exists() && !win.N._has_tank()) return;
    //console.log(e.key);
    if(e.key === "q" || e.key === "Q"){
        console.log(`New position selected at x: ${Math.floor(you.current_pos.x)} y: ${Math.floor(you.current_pos.y)}`);
        set_goal();
    }else if(e.key === "r" || e.key === "R"){
        mc.toggle_afk();
        let message = mc.afk? "ON" : "OFF";
        console.log(`AFK: ${message}`);
    }else if(e.key === "t" || e.key === "T"){
        mc.toggle_move2tank();
        let message = mc.move2tank? "ON" : "OFF";
        console.log(`move to Tank: ${message}`);
    }
};
*/

function debug(){
    console.log(`
    you.master: ${you.master}
    you.id: ${you.id}
    your pos x: ${you.current_pos.x}
    your pos y: ${you.current_pos.y}
    baseindex: ${baseindex}
    real master: ${GM_getValue("Master")}
    move2Tank goal x: ${GM_getValue(GM_getValue("Master")+" Body").x}
    move2Tank goal y: ${GM_getValue(GM_getValue("Master")+" Body").y}
    `);
}
//setInterval(debug, 5000);

//PRIVATE!!!

let your_clicks = {left: false, right: false};
let your_mouse = {x:0, y:0};
let copy_mouse = false;
let copy_clicks = false;

//PRIVATE!!! Left/Right Click copy
document.body.addEventListener('mousedown', (e) => {
    switch(e.button){
        case 0:
            your_clicks.left = true;
            break
        case 2:
            your_clicks.right = true;
            break
    }
});

document.body.addEventListener('mouseup', (e) => {
    switch(e.button){
        case 0:
            your_clicks.left = false;
            break
        case 2:
            your_clicks.right = false;
            break
    }
});

function save_clicks(){
    window.requestAnimationFrame(save_clicks);
    if(!you.master) return;
    GM_setValue('Master Click Left', your_clicks.left);
    GM_setValue('Master Click Right', your_clicks.right);
};
window.requestAnimationFrame(save_clicks);

function simulate_clicks(){
    window.requestAnimationFrame(simulate_clicks);
    if(you.master || !copy_clicks) return;
    let left = GM_getValue('Master Click Left');
    let right = GM_getValue('Master Click Right');
    if(left === undefined || right === undefined) return;
    left ? key_down('Space') : key_up('Space');
    right ? key_down('ShiftLeft') : key_up('ShiftLeft');
}
window.requestAnimationFrame(simulate_clicks);

//PRIVATE!!! GUI
//config
const config = {
    colors: {
        text: "black",
        main: [
            "orange",
            "green",
            "black",
            "black",
            "black",
        ],
        sett: {
            default: this.default = "yellow",
            mousein: "gold",
            mouseout: this.default,
            text: "Indigo",
            border: {
                true: '4px solid OliveDrab',
                false: '4px solid Crimson'
            }
        },
        title: {
            text: "white",
            stroke: "black",
        }
    },
    sizes: {
        menu_back: {
            width: '300px',
            height: 'auto',
        },
        sett: {
            width: "150px",
            height: "50px",
            font: "20px",
        },
        title: {
            font: "30px",
            stroke: "1.5px",
        }
    },
    margins: {
        sett: {
            top: "20px",
            left: "15px",
            bottom: '20px',
        },
        title: {
            top: "20px",
            left: "15px",
            bottom: '20px',
        }
    },
    paddings: {
        sett: {
            top: '10px',
            bottom: '10px',
        }
    },
    animation_speed: {
        close: 20,
        open: 15,
    }
}

//GUI creation
function n2id(string) {
  return string.toLowerCase().replace(/ /g, "-");
}

class El {
  constructor(
    name,
    type,
    el_color,
    width,
    height,
    opacity = "1",
    zindex = "100"
  ) {
    this.el = document.createElement(type);
    this.el.style.backgroundColor = el_color;
    this.el.style.width = width;
    this.el.style.height = height;
    this.el.style.opacity = opacity;
    this.el.style.zIndex = zindex;
    this.el.id = n2id(name);
  }
  setPosition(position, display, top, left, translate) {
    this.el.style.position = position;
    this.el.style.display = display;
    this.el.style.top = top;
    this.el.style.left = left;
    this.el.style.transform = "translate(" + translate + ")";
    this.display = display; //store last display
  }
  margin(top, left, right, bottom) {
    this.el.style.marginTop = top;
    this.el.style.marginLeft = left;
    this.el.style.marginRight = right;
    this.el.style.marginBottom = bottom;
  }
  setText(text, txt_color, font, fontsize, stroke, align) {
    this.el.innerHTML = text;
    this.el.style.color = txt_color;
    this.el.style.fontFamily = font;
    this.el.style.fontSize = fontsize;
    this.el.style.textShadow = stroke;
    this.el.style.textAlign = align;
  }
  add(parent) {
    parent.appendChild(this.el);
  }
  remove(parent) {
    parent.removeChild(this.el);
  }
  toggle(showOrHide) {
    switch (showOrHide) {
      case "hide":
        this.el.display = "none";
        break;
      case "show":
        this.el.display = this.display;
        break;
    }
  }
}

class Title{
    constructor(name, text){
        this.self = new El(name, 'div', 'transparent', "auto", "auto");
        this.self.margin(config.margins.title.top, config.margins.title.left, '', config.margins.title.bottom);
        this.self.setText(text, config.colors.title.text, '', config.sizes.title.font, `0px 0px ${config.sizes.title.stroke} ${config.colors.title.stroke}`);
    }
}

class Category{
    constructor(name, type, text, category_type, callbackFunc = () => {}, args){
        this.self = new El(name, type, config.colors.sett.default, "70%", "auto");
        let el = this.self.el;
        if(category_type==="bool"){
            this.active = false;
            el.style.border = config.colors.sett.border.false;
        };
        this.self.margin(config.margins.sett.top, config.margins.sett.left, '', config.margins.sett.bottom);
        el.style.textAlign = 'center';
        el.style.paddingTop = config.paddings.sett.top;
        el.style.paddingBottom = config.paddings.sett.bottom;
        this.self.setText(text, config.colors.sett.text, '', config.sizes.sett.font);
        el.style.borderRadius = "15px";
        el.onmouseover = (e) => {
            el.style.backgroundColor = config.colors.sett.mousein;
            el.style.cursor = "pointer";
        };
        el.onmouseout = (e) => {
            el.style.backgroundColor = config.colors.sett.mouseout;
            el.style.cursor = "default";
        };
        el.onmousedown = (e) => {
            switch(category_type){
                case "bool":
                    this.active = !this.active;
                    this.active ?
                        el.style.border = config.colors.sett.border.true :
                        el.style.border = config.colors.sett.border.false;
                    break;
                case "oneTime":
                    callbackFunc(...args);
                    break;
            }
        }
    }
}

let menu_container = new El("menu cont", 'div', 'transparent', 'auto', 'auto');
menu_container.setPosition('absolute', 'flex', '50%', '100%', '-100%, -50%');
menu_container.el.style.flexDirection = "row";
let menu_back = new El("menu back", "div", config.colors.main[0], config.sizes.menu_back.width, config.sizes.menu_back.height);
menu_back.el.style.flexDirection = "column";

let animation_active = false;
function start_animation(speed = 20, type) {
    if (animation_active) return;
    animation_active = true;

    let value = parseInt(menu_back.el.style.width, 10);
    function step_close(){
        value -= speed;
        if (value < 0) {
            value = 0;
            animation_active = false;
            return;
        }
        menu_back.el.style.width = value + 'px';
        requestAnimationFrame(step_close);
    }
    function step_open(){
        value += speed;
        if (value > parseInt(config.sizes.menu_back.width, 10)) {
            value = config.sizes.menu_back.width;
            animation_active = false;
            return;
        }
        menu_back.el.style.width = value + 'px';
        requestAnimationFrame(step_open);
    }
    switch(type){
        case "open":
            requestAnimationFrame(step_open);
            break
        case "close":
            requestAnimationFrame(step_close);
            break
    }
}

let close_open_btn = new El('menu toggle', 'div', "black", '25px', 'auto');
close_open_btn.setPosition('relative', 'flex');
close_open_btn.el.style.alignItems = 'center';
close_open_btn.setText('<•>', 'white', '', '15px');
close_open_btn.el.style.textAlign = 'center';
close_open_btn.el.addEventListener('mouseover', (e) => {
    close_open_btn.el.style.cursor = 'pointer';
    close_open_btn.el.style.backgroundColor = 'gray';
});
close_open_btn.el.addEventListener('mouseout', (e) => {
    close_open_btn.el.style.cursor = 'default';
    close_open_btn.el.style.backgroundColor = 'black';
});
close_open_btn.el.addEventListener('mousedown', (e) => {
    switch(menu_back.el.style.width){
        case '0px':
            start_animation(config.animation_speed.open,'open');
            break
        case config.sizes.menu_back.width:
            start_animation(config.animation_speed.close,'close');
            break
    }
});

let categories = [];

function create_categories(){
    let test_title = new Title('menu text', 'memory Multibox by r!PsAw');
    categories.push(test_title);

    let afk_toggle = new Category('afk toggle', 'div', 'Toggle AFK', 'bool');
    afk_toggle.self.el.addEventListener('mousedown', (e) => {
        mc.toggle_afk();
    });
    categories.push(afk_toggle);

    let afk_set = new Category('afk set', 'div', 'set AFK position', 'oneTime', set_goal, ['']);
    categories.push(afk_set);

    let mouse_toggle = new Category('mouse toggle', 'div', 'Toggle Aim', 'bool');
    mouse_toggle.self.el.addEventListener('mousedown', (e) => {
        copy_mouse = mouse_toggle.active;
    });
    categories.push(mouse_toggle);

    let keys_toggle = new Category('keys toggle', 'div', 'Toggle Move to Tank', 'bool');
    keys_toggle.self.el.addEventListener('mousedown', (e) => {
        mc.toggle_move2tank();
    });
    categories.push(keys_toggle);

    let clicks_toggle = new Category('clicks toggle', 'div', 'Toggle Clicks', 'bool');
    clicks_toggle.self.el.addEventListener('mousedown', (e) => {
        copy_clicks = clicks_toggle.active;
    });
    categories.push(clicks_toggle);
}

function load_categories(){
    for(let category of categories){
        category.self.add(menu_back.el);
    }
}

function load_GUI(){
    load_categories();
    close_open_btn.add(menu_container.el);
    menu_back.add(menu_container.el);
    menu_container.add(document.body);
}
create_categories();
load_GUI();

//PRIVATE!!! FOV
const onWheel = e => {
    if (!window.__wasm_HEAPU32 || baseindex === -1 || !baseindex) return;
    const heap = window.__wasm_HEAPU32;

    const cur = decodeFov(heap[baseindex + offsets.fov]);

    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    heap[baseindex + offsets.fov] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, {
    passive: true
});

//PRIVATE!!! mouse
const mouse_export = '_cpp__o3b9b039435c';
function move_mouse_at(x, y){
    if(!N_exists() || !Object.keys(win.N).includes(mouse_export)) return console.warn('mouse export outdated!');
    win.N[mouse_export](x, y);
}

function mouse_screen_to_world(x, y){
    //console.log('screen -> world: ',!window.__wasm_HEAPF32, baseindex === -1, !baseindex, !x, !y);
    if(!window.__wasm_HEAPF32 || baseindex === -1 || !baseindex || !x || !y) return {x:1, y:1};
    const center = {
        x: win.innerWidth/2,
        y: win.innerHeight/2
    };
    const delta = {
        x: x-center.x,
        y: y-center.y
    };
    const fov = decodeFov(window.__wasm_HEAPU32[baseindex+offsets.fov]);
    const scaleFactor = (Math.max(win.innerWidth / 1920, win.innerHeight / 1080) * fov);
    return {
        x: you.current_pos.x + (delta.x/scaleFactor),
        y: you.current_pos.y + (delta.y/scaleFactor)
    }
}

function mouse_world_to_screen(x, y){
    if(!window.__wasm_HEAPF32 || baseindex === -1 || !baseindex || !x || !y) return {x:1, y:1};
    const center = {
        x: win.innerWidth/2,
        y: win.innerHeight/2
    };
    const delta = {
        x: x-you.current_pos.x,
        y: y-you.current_pos.y
    };
    const fov = decodeFov(window.__wasm_HEAPU32[baseindex+offsets.fov]);
    const scaleFactor = (Math.max(win.innerWidth / 1920, win.innerHeight / 1080) * fov);
    return {
        x: center.x + (delta.x*scaleFactor),
        y: center.y + (delta.y*scaleFactor)
    }
}

function handle_copy_mouse(){
    win.requestAnimationFrame(handle_copy_mouse);
    if(!you.master){
        if(copy_mouse){
            let target_mouse = mouse_world_to_screen(GM_getValue('MOUSE X'), GM_getValue('MOUSE Y'));
            if(target_mouse) move_mouse_at(target_mouse.x, target_mouse.y);
        }
    }else{
        let world_mouse = mouse_screen_to_world(your_mouse.x, your_mouse.y);
        if(world_mouse){
            GM_setValue('MOUSE X', world_mouse.x);
            GM_setValue('MOUSE Y', world_mouse.y);
        }
    }
}
win.requestAnimationFrame(handle_copy_mouse);

document.addEventListener('mousemove', (e) => {
    your_mouse.x = e.clientX;
    your_mouse.y = e.clientY;
});

document.addEventListener('keydown', (e) => {
    if(e.key === 'g' || e.key === 'G'){
        copy_mouse = !copy_mouse;
        let bool = copy_mouse?'ON':'OFF';
        console.log('turned mouse copying ', bool);
    }
});
console.log('end: ', performance.now());