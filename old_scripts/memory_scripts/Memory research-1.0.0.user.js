// ==UserScript==
// @name         Memory research
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

//define win
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

//memory hook
win.exists = false;
win.Object.defineProperty(win.Object.prototype, "HEAPF32", {
    get: function() {
        return undefined;
    },
    set: function(newHeapF32) {
        if (!newHeapF32 || !this.HEAPU32) return;
        delete win.Object.prototype.HEAPF32;
        window.Module = this;
        window.Module.HEAPF32 = newHeapF32;
        win.Module = window.Module;
        win.exists = true;
    },
    configurable: true,
    enumerable: true
});

//logic
let basevalue = 4.593316236210318e-41;//0x800b
let baseindex;
let found_values = false;
let i = {
    world_x: {
        offset: 65,
        ptr: undefined
    },
    world_y: {
        offset: 69,
        ptr: undefined
    },
    level_score: { // level_score = your_score - score_to_reach_your_level
        offset: 85,
        ptr: undefined
    },
    level: { //in hex
        offset: 87,
        ptr: undefined
    },
    score: {
        offset: 89,
        ptr: undefined
    },
    tank_size: { //not sure about that one, but it grows slowly as I gain score
        offset: 92,
        ptr: undefined
    },
    score_minus_ten: {
        offset: 94,
        ptr: undefined
    },
    available_points: { //in hex
        offset: 97,
        ptr: undefined
    },
    max_regen: { //in hex
        offset: 108,
        ptr: undefined
    },
    max_health: { //in hex
        offset: 107,
        ptr: undefined
    },
    max_body_dmg: { //in hex
        offset: 106,
        ptr: undefined
    },
    max_bullet_speed: { //in hex
        offset: 105,
        ptr: undefined
    },
    max_bullet_penetration: { //in hex
        offset: 104,
        ptr: undefined
    },
    max_bullet_dmg: { //in hex
        offset: 103,
        ptr: undefined
    },
    max_reload: { //in hex
        offset: 102,
        ptr: undefined
    },
    max_movement_speed: { //in hex
        offset: 101,
        ptr: undefined
    },
}

function floatToHex(f) {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, f, false); // false = big endian (IEEE 754 standard order)
  return '0x' + view.getUint32(0, false).toString(16).padStart(8, '0');
}

function log(){
    if(!win.exists) return;
    if(baseindex && baseindex != -1){
        win.baseindex = baseindex;
        win.i = i;
        console.log('found baseindex! ', baseindex);
        if(!found_values){
            for(let val in i){
                i[val].ptr = baseindex+i[val].offset;
            }
            found_values = true;
            console.log('offsets applied to find pointers!');
        }
        //console.log('========[ name, pointer, value_decimal, value_hex ] =======');
        for(let val in i){
            let num = Module.HEAPF32[i[val].ptr];
            let hex = floatToHex(num);
            //console.log(`[ ${val}, ${i[val].ptr}, ${num}, ${hex} ]`);
        }
    }else{
        baseindex = Module.HEAPF32.indexOf(basevalue);
        //console.log('found baseindex: ', baseindex);
    }
}
setInterval(log, 1000);