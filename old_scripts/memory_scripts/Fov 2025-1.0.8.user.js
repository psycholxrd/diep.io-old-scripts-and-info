// ==UserScript==
// @name         Fov 2025
// @namespace    http://tampermonkey.net/
// @version      1.0.8
// @description  If you switch server, make sure to reload the page
// @author       r!PsAw, w-ccc
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @run-at       document-start
// ==/UserScript==

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
}

//FOV part
let baseValue = 37899;
let FOV_offset = 130;
let FOV_index = -1;
function get_FOV_index(){
    const base_index = window.__wasm_HEAPU32.indexOf(baseValue);
    if(base_index === -1) return -1;
    return base_index+FOV_offset;
}

function init(){
    if(!window.__wasm_HEAPF32) return setTimeout(init, 100);
    FOV_index = get_FOV_index();
    if(FOV_index === -1) return setTimeout(init, 100);
    console.log('found FOV at', FOV_index);
}
init();

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

window.print_FOV = () => {
    if (!window.__wasm_HEAPU32 || FOV_index === -1) return;
    console.log(decodeFov(window.__wasm_HEAPU32[FOV_index]));
};

const onWheel = e => {
    if (!window.__wasm_HEAPU32 || FOV_index === -1) return;
    const heap = window.__wasm_HEAPU32;

    const cur = decodeFov(heap[FOV_index]);

    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    heap[FOV_index] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, { passive: true });