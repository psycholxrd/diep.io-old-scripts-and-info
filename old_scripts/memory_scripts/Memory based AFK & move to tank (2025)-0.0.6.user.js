// ==UserScript==
// @name         Memory based AFK & move to tank (2025)
// @namespace    http://tampermonkey.net/
// @version      0.0.6
// @description  set Afk spot with Q, toggle afk with R, toggle move2Tank with T, switch Follow mode: Body/Mouse with G
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// @license      MIT
// ==/UserScript==

//define win
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

//keys bypass
/*
(function() {
    win.frozenHasFocus = {
        hasFocus: () => true
    };
    document.hasFocus = () => true;
})();
*/

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
const basevalue = 6.099992345052361e-41;
const offsets = {x: 101, y: 91};
let baseindex;


function find_index() {
    //console.log('called find_index');
    if(baseindex && baseindex != -1){
        //console.log('FOUND baseindex: ', baseindex);
        return
    }
    if(win.exists){
        //console.log('win exists');
        baseindex = window.__wasm_HEAPF32.indexOf(basevalue);
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
            this.current_pos.x = window.__wasm_HEAPF32[baseindex+offsets.x];
            this.current_pos.y = window.__wasm_HEAPF32[baseindex+offsets.y];
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