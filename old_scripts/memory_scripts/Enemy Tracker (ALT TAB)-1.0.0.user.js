// ==UserScript==
// @name         Enemy Tracker (ALT TAB)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  USE THIS TAB ONLY TO RAM INTO ENEMIES
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

//
let loaded = {
    hook: false,
};

//
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
const basevalue = 5.382527531318055e-41;
const offsets = {x: 82, y: 35, fov: 28};
let player_world = {x:undefined, y:undefined};
let ptrs = {basevalue:undefined, x:undefined, y:undefined, fov:undefined};
let FOV = 0.55;

win.alt_tab_active = true;

setInterval(() => {
    if(win.main_tab_active){
        alert('You have both alt and main tab scripts active on one window.\n Please read the instructions carefully, and try again!');
    }
}, 5000);

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
    initialize();
    loaded.hook = true;
}
//

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
};

//XOR-Shift decoded by Shadam
const _buf = new ArrayBuffer(4);
    const _i32 = new Int32Array(_buf);
    const _u32 = new Uint32Array(_buf);
    const _f32 = new Float32Array(_buf);

    const K = -939524096; // 0xC8000000

    const decodeFov = (x) => {
        x = x | 0;
        const v1 = (x << 8) | 0;
        const v2 = (x >>> 8) & 255;
        const xt = (x >>> 24) | 0;

        // B0 (pos 0): ((x_B1 + 68) ^ 94)
        const b0 = ((v2 + 68) ^ 94) & 255;
        // B1 (pos 8): ((x_B0 + (v1|v2)*66 - 11) ^ 34)
        const b1 = ((x + Math.imul(v1 | v2, 66) - 11) ^ 34) & 255;
        // B2 (pos 16): ((x_B3 + x*18 + 70) ^ 207)
        const b2 = ((xt + Math.imul(x, 18) + 70) ^ 207) & 255;
        // B3 (pos 24): (x_B2 + x_B3*0x3A - 0x41)
        const b3 = (v1 + Math.imul(xt, 973078528) - 1090519040) & -16777216;

        _i32[0] = (b0 | (b1 << 8) | (b2 << 16) | b3) ^ K;
        return _f32[0];
    };

    const encodeFov = (f) => {
        _f32[0] = f;
        const fb = _i32[0] ^ K;
        const B0 = fb & 255, B1 = (fb >>> 8) & 255, B2 = (fb >>> 16) & 255, B3 = (fb >>> 24) & 255;

        const x_B1 = ((B0 ^ 94) - 68) & 255;
        const x_B0 = ((B1 ^ 34) + 11 - Math.imul(x_B1, 66)) & 255;
        const x_B3 = ((B2 ^ 207) - 70 - Math.imul(x_B0, 18)) & 255;
        const x_B2 = (B3 + 0x41 - Math.imul(x_B3, 0x3A)) & 255;

        _u32[0] = (x_B0 | (x_B1 << 8) | (x_B2 << 16) | (x_B3 << 24));
        return _u32[0];
    };
//modified version for world coords
function decodeWorldCoords(obf) {
  return decodeFov(parseInt(floatToHex(obf)));
}

//logic

function update_loop(){
    win.requestAnimationFrame(update_loop);
    if(!win.player_world) win.player_world = player_world;
    if(!win.__wasm_HEAPU32) win.__wasm_HEAPU32 = window.__wasm_HEAPU32;
    if(!win.__wasm_HEAPF32) win.__wasm_HEAPF32 = window.__wasm_HEAPF32;
    if(!window.__wasm_HEAPF32) return;
    if(!ptrs.basevalue){
        //console.log('1st time baseValue');
        let result = window.__wasm_HEAPF32.indexOf(basevalue);
        if(result === -1) return;
        ptrs.basevalue = result;
        //console.log('found basevalue!: ', result);
    }
    if(!ptrs.x){
        //console.log('1st time x');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.x];
        if(!result || result === -1) return;
        ptrs.x = ptrs.basevalue+offsets.x;
        player_world.x = decodeWorldCoords(result);
        //console.log('found x! ', result);
    }else{
        player_world.x = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.x]);
    }
    if(!ptrs.y){
        //console.log('1st time y');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.y];
        if(!result || result === -1) return;
        ptrs.y = ptrs.basevalue+offsets.y;
        player_world.y = decodeWorldCoords(result);
        //console.log('found y! ', result);
    }else{
        player_world.y = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.y]);
    }
    if(!ptrs.fov){
        //console.log('1st time fov');
        let result = window.__wasm_HEAPU32[ptrs.basevalue+offsets.fov];
        if(!result || result === -1) return;
        ptrs.fov = ptrs.basevalue+offsets.fov;
        FOV = decodeFov(result);
        //console.log('found FOV! ', FOV, ' with adress: ', ptrs.fov);
    }else{
        FOV = decodeFov(window.__wasm_HEAPU32[ptrs.fov]);
    }
}

//canvas
function canvas_loop(){
    //console.log('looping canvas!');
};

let ctx = win.canvas?.getContext('2d');
function await_canvas(){
    if(!win.canvas){
        return setTimeout(await_canvas, 100);
    }else{
        setTimeout(() => {
            ctx = win.canvas.getContext('2d');
            //console.log('%cctx loaded!', 'color:purple', ctx);
            requestAnimationFrame(canvas_draw);
        }, 1000);
    }
}
await_canvas();
function canvas_draw(){
    requestAnimationFrame(canvas_draw);
    //console.log(`x ${player_world.x} y ${player_world.y}`);
    if (ctx && ctx instanceof CanvasRenderingContext2D) {
        canvas_loop();
    }
}

//init
function initialize(){
    win.requestAnimationFrame(update_loop);
    win.requestAnimationFrame(canvas_draw);
};

// Communication
const myID = 'Bot-' + Math.random().toString(36).substr(2, 4).toUpperCase();
const channel = new BroadcastChannel('diep_swarm_channel');

console.log(`[Sender] Started. My ID is ${myID}`);

setInterval(() => {
    const killedByElement = document.querySelector("#game-over-killed-by-info");
    const nameText = killedByElement ? killedByElement.innerText : '';
    const dataToSend = {
        x: player_world.x,
        y: player_world.y,
        name: nameText
    };

    channel.postMessage({
        id: myID,
        value: dataToSend,
        timestamp: Date.now()
    });

}, 100);