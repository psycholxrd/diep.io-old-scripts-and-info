// ==UserScript==
// @name         visualise points
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  updated everything
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==
const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;
const disable_vector = true;
const debug_return = false;
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
    }
    //
function sync_windows(){
    if(!win.__wasm_HEAPF32){
        win.__wasm_HEAPF32 = window.__wasm_HEAPF32;
        return setTimeout(sync_windows, 100);
    }
    if(!win.__wasm_HEAPU32){
        win.__wasm_HEAPU32 = window.__wasm_HEAPU32;
        return setTimeout(sync_windows, 100);
    }
}

//define things
const basevalue = 5.382527531318055e-41;
const camera_ptrs = {x: 155810, y: 155806}; //static
const leader_ptrs = {x: 155829,y: 155824}; //static
const offsets = {x: 82, y: 35, fov: 28};
let ptrs = {basevalue:undefined, x:undefined, y:undefined, fov:undefined};
let player_world = {x:undefined, y:undefined};
let camera_world = {x:undefined, y:undefined};
let offset_vector = {x:undefined, y:undefined};
let FOV = 0.55;
win.points = [
    {x: 10, y: 10, color: "green", dimension: 'screen'}, //true tank position
];

win.get_sizes = () => {
  return {
      width: Math.abs(camera_world.x-player_world.x),
      height: Math.abs(camera_world.y-player_world.y),
  }
};

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
function world_to_screen(point){
    if(point.x === undefined || point.y === undefined) return {x:10, y:10};
    const screen_center = {x: win.innerWidth/2, y: win.innerHeight/2};
    const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * FOV);
    const deltaX = point.x - player_world.x;
    const deltaY = point.y - player_world.y;
    //console.log('sc:', screen_center, 'sf:', scaleFactor, 'dx:', deltaX, 'dy:', deltaY);
    return {
        x: screen_center.x + (deltaX*scaleFactor),
        y: screen_center.y + (deltaY*scaleFactor)
    };
}

function screen_to_world(point){
    if(point.x === undefined || point.y === undefined) return {x:10, y:10};

    const screen_center = { x: win.innerWidth / 2, y: win.innerHeight / 2 };
    const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * FOV);

    const deltaX = (point.x - screen_center.x) / scaleFactor;
    const deltaY = (point.y - screen_center.y) / scaleFactor;

    return {
        x: player_world.x + deltaX,
        y: player_world.y + deltaY
    };
}

// CREDITS TO SNOWY FOR THIS
function get_entities() {
    const val = window.__wasm_HEAP32[52058];
    let address = val >> 2;
    let output = [];

    while (window.__wasm_HEAPF32[address] !== 0) {
        const pointer = window.__wasm_HEAP32[address];
        const addr = pointer >> 2;
        const x = window.__wasm_HEAPF32[addr + 34];
        const y = window.__wasm_HEAPF32[addr + 35];
        output.push({ ptr: pointer, index: addr + 34, x: x, y: y });

        address = address + 1;
    }
    return output;
}

const identity = (ptr) => {
    let pointer = ptr - 34
    pointer = pointer << 2
    pointer = window.__wasm_HEAP32[pointer >> 2]
    pointer = pointer >> 2
    pointer = pointer + 32
    pointer = window.__wasm_HEAP32[pointer]
    pointer += 24

    // todp made the cstr function
    function cstr(ptr) {
        if (!window.__wasm_HEAPU8) return "";
        let strAt = ptr;
        let length = window.__wasm_HEAPU8[ptr + 11];
        if (length === 0x80) {
            length = window.__wasm_HEAP32[(ptr + 4) >> 2];
            strAt = window.__wasm_HEAP32[ptr >> 2];
        }
        return new TextDecoder().decode(window.__wasm_HEAPU8.subarray(strAt, strAt + length));
    }

    return cstr(pointer)
}

const get_shapes = () => {
    const colorMap = {
        'Square': 'yellow',
        'Triangle': 'red',
        'Pentagon': 'blue',
        'Hexagon': 'lightblue',
    }
    let entities = get_entities();
    let shapes = {};
    for (let entity of entities) {
        const type = identity(entity.index);
        if (type !== "" && type !== " ") {
            let point = {
                x: entity.x,
                y: entity.y,
                color: (type in colorMap)?colorMap[type]:'black',
                dimension: 'world',
            }
            if(type in shapes){
                shapes[type].push(point);
            }else{
                shapes[type] = [point];
            }
        }

    }
    return shapes;
};

win.get_shapes = get_shapes;
// CREDITS END

function canvas_loop(){
    if(disable_vector){
        if(!win.canvas || !player_world.x || !player_world.y || !FOV) return;
    }else{
        if(!win.canvas || !player_world.x || !player_world.y || !FOV || !camera_world.x || !camera_world.y) return;
    }
    //console.log('canvas loop did not quit');
    //console.log(camera_world);
    const screen_center = {x: win.innerWidth/2, y: win.innerHeight/2};
    for(let point of win.points){
        //console.log('world point ', world_point);
        const screen_point = (point.dimension && point.dimension === "screen")? point : world_to_screen(point);
        //console.log('screen point ', screen_point);
        //console.log('ctx exists?', !!ctx, 'screen_point', screen_point, 'point', point);
        ctx.beginPath();
        ctx.strokeStyle = point.color?point.color:"purple";
        ctx.lineWidth = 5;
        ctx.moveTo(screen_center.x, screen_center.y);
        if(disable_vector){
            ctx.lineTo(screen_point.x, screen_point.y);
        }else{
            ctx.lineTo(screen_point.x+offset_vector.x, screen_point.y+offset_vector.y);
        }
        ctx.stroke();
    }
};

function update_loop(){
    win.requestAnimationFrame(update_loop);
    if(!win.player_world) win.player_world = player_world;
    if(!win.__wasm_HEAPU32) win.__wasm_HEAPU32 = window.__wasm_HEAPU32;
    if(!win.__wasm_HEAPF32) win.__wasm_HEAPF32 = window.__wasm_HEAPF32;
    if(!window.__wasm_HEAPF32) return debug_return ? console.warn('Missing window HEAPF32') : null;
    if(!ptrs.basevalue){
        //console.log('1st time baseValue');
        let result = window.__wasm_HEAPF32.indexOf(basevalue);
        if(result === -1) return debug_return ? console.warn('result -1') : null;
        ptrs.basevalue = result;
        //console.log('found basevalue!: ', result);
    }
    if(!ptrs.x){
        //console.log('1st time x');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.x];
        if(!result || result === -1) return debug_return ? console.warn('result -1 (2)') : null;
        ptrs.x = ptrs.basevalue+offsets.x;
        player_world.x = decodeWorldCoords(result);
        console.log('found x! ', result);
    }else{
        player_world.x = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.x]);
    }
    if(!ptrs.y){
        //console.log('1st time y');
        let result = window.__wasm_HEAPF32[ptrs.basevalue+offsets.y];
        if(!result || result === -1) return debug_return ? console.warn('result -1 (3)') : null;
        ptrs.y = ptrs.basevalue+offsets.y;
        player_world.y = decodeWorldCoords(result);
        console.log('found y! ', result);
    }else{
        player_world.y = decodeWorldCoords(window.__wasm_HEAPF32[ptrs.y]);
    }
    if(!ptrs.fov){
        //console.log('1st time fov');
        let result = window.__wasm_HEAPU32[ptrs.basevalue+offsets.fov];
        if(!result || result === -1) return debug_return ? console.warn('result -1 (4)') : null;;
        ptrs.fov = ptrs.basevalue+offsets.fov;
        FOV = decodeFov(result);
        console.log('found FOV! ', FOV, ' with adress: ', ptrs.fov);
    }else{
        FOV = decodeFov(window.__wasm_HEAPU32[ptrs.fov]);
    }
    camera_world.x = window.__wasm_HEAPF32[camera_ptrs.x];
    camera_world.y = window.__wasm_HEAPF32[camera_ptrs.y];
    const camera_screen = world_to_screen(camera_world);
    const screen_center = {x: win.innerWidth/2, y: win.innerHeight/2};
    //console.log(camera_world, camera_screen);
    //console.log(camera_screen, win.innerWidth, win.innerHeight);
    if(!disable_vector){
        offset_vector.x = (win.innerWidth) - camera_screen.x;
        offset_vector.y = -camera_screen.y;
        win.points[0].x = screen_center.x + offset_vector.x;
        win.points[0].y = screen_center.y + offset_vector.y;
    }else{
        win.points[0].x = 0;
        win.points[0].y = 0;
    }
    win.points.length = 1;
    win.points.push({x: window.__wasm_HEAPF32[camera_ptrs.x], y: window.__wasm_HEAPF32[camera_ptrs.y]});
    win.points.push({x: decodeWorldCoords(window.__wasm_HEAPF32[leader_ptrs.x]), y: decodeWorldCoords(window.__wasm_HEAPF32[leader_ptrs.y]), color: 'pink'});
    /*
    let shapes = get_shapes();
    //console.log(shapes);
    for(let type in shapes){
        for(let arr of shapes[type]){
            win.points.push(arr);
        }
    };
    */
}

//canvas
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
    sync_windows();
    win.requestAnimationFrame(update_loop);
    win.requestAnimationFrame(canvas_draw);
};

const onWheel = e => {
    if (!window.__wasm_HEAPU32 || ptrs.fov === -1) return;
    const heap = window.__wasm_HEAPU32;

    const cur = decodeFov(heap[ptrs.fov]);

    const next = e.deltaY > 0 ? (cur * 1.05) : (cur * 0.95);
    heap[ptrs.fov] = encodeFov(next);
};

document.addEventListener("wheel", onWheel, { passive: true });

//NEW DEBUG
const tankOffset = 119;
const getFov = () => decodeFov(window.__wasm_HEAPU32[ptrs.fov]);
win.getFov = getFov;
const getID = () => window.__wasm_HEAPU32[window.__wasm_HEAPF32.indexOf(basevalue)+tankOffset];
win.getID = getID;
const getWidth = () => Math.abs(camera_world.x - player_world.x) * 2;
const getHeight = () => Math.abs(camera_world.y - player_world.y) * 2;

let obj = {};
win.obj = obj;

document.addEventListener("keydown", (e) => {
    if(e.code !== 'Backslash') return;
    setTimeout(() => {
        const w = getWidth();
        const h = getHeight();
        const id = getID();
        console.log(id, w, h);
        obj[id] = {width: w, height: h};
    }, 2000);
});