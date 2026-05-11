// ==UserScript==
// @name         leader locator 2025 (old)
// @namespace    http://tampermonkey.net/
// @version      1.0.4
// @description  try to take over the world!
// @author       w-ccc (Modified by r!PsAw)
// @match        https://diep.io/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    //config
    const opacities = {
        d_txt: 0.2,
        arc: 0.5,
        line: 0.3,
    };
    const prediction_offset_factor = 30;

    //logic
    let baseIndex;
    let playerPosition;
    let fov;
    let minimapData = {
        x: null,
        y: null,
        width: null,
        height: null
    };

    let region = "";
    let gamemode = "";

    //const ARENA_WIDTH = 22700;
    //const ARENA_HEIGHT = 22700;
    const ARENA_WIDTH = 22400;
    const ARENA_HEIGHT = 22400;
    const interval = 60;
    const TARGET_HEAP_VALUE = 0xb00b;
    //const LEADER_X_INDEX = 19128; //Map center?
    const LEADER_X_INDEX = 53856;
    const LEADER_Y_INDEX = LEADER_X_INDEX + 1;
    const PLAYER_X_OFFSET = 16;
    const PLAYER_Y_OFFSET = 172;
    const FOV_OFFSET = 166;
    const win = typeof unsafeWindow !== "undefined" ? unsafeWindow : window;

    /* old memory hook
    win.Object.defineProperty(win.Object.prototype, "HEAPF32", {
        get: function() {
            return undefined;
        },
        set: function(newHeapF32) {
            if (!newHeapF32 || !this.HEAPU32) return;
            delete win.Object.prototype.HEAPF32;
            window.Module = this;
            window.__wasm_HEAPF32 = newHeapF32;
            win.Module = window.Module;
            win.aim = false;
            initialize();
        },
        configurable: true,
        enumerable: true
    });
    */

    //rest of the logic

    setInterval(() => {
        if (win.__common__ && win.__common__.active_region && win.__common__.active_gamemode) {
            region = win.__common__.active_region;
            gamemode = win.__common__.active_gamemode;
        }
    }, 1000);

    function initialize() {
        console.log('START');
        setInterval(() => {
            if (!window.__wasm_HEAPF32) return;
            //console.log(1);
            baseIndex = Array.prototype.findIndex.call(window.__wasm_HEAP32, value => value === TARGET_HEAP_VALUE);
        }, 1000);

        setInterval(() => {
            if (!window.__wasm_HEAPF32) return;
            //console.log(2);
            playerPosition = [
                window.__wasm_HEAPF32[baseIndex + PLAYER_X_OFFSET],
                window.__wasm_HEAPF32[baseIndex + PLAYER_Y_OFFSET]
            ];
            fov = window.__wasm_HEAPF32[baseIndex + FOV_OFFSET];
            win.fov = fov;
            win.playerPosition = playerPosition
        }, 1000 / interval);

        setInterval(() => {
            if (!window.__wasm_HEAPF32) return;
            //console.log(3);
            const leaderX = window.__wasm_HEAPF32[LEADER_X_INDEX];
            const leaderY = window.__wasm_HEAPF32[LEADER_Y_INDEX];
            if (Math.hypot(leaderX - playerPosition[0], leaderY - playerPosition[1]) > 3000) {
                GM_setValue(region + gamemode, JSON.stringify([leaderX, leaderY]));
            }
        }, 1000 / interval);
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

    function setupCanvas() {
        let canvas = document.getElementById("canvas2");
        if (!canvas) {
            canvas = document.createElement("canvas");
            canvas.id = "canvas2";
            canvas.style = "position:fixed;top:0;left:0;z-index:9999;pointer-events:none";
            document.body.appendChild(canvas);
        }
        resizeCanvas();
        return canvas;
    }

    function resizeCanvas() {
        const canvas = document.getElementById("canvas2");
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    }

    const scaling_method = 'new';

    function worldToScreenPosition(x, y) {
        if (!playerPosition || playerPosition.length < 2) return [1, 1];
        const deltaX = x - playerPosition[0];
        const deltaY = y - playerPosition[1];
        let screenX, screenY;
        switch (scaling_method) {
            case "old": {
                const scaleFactor = fov / computeY(fov);
                console.log(scaleFactor);
                screenX = window.innerWidth / 2 + deltaX * scaleFactor;
                screenY = window.innerHeight / 2 + deltaY * scaleFactor;
            }
            break;
            case 'new': {
                const scaleFactor = (Math.max(window.innerWidth / 1920, window.innerHeight / 1080) * fov);
                screenX = window.innerWidth / 2 + (deltaX * scaleFactor);
                screenY = window.innerHeight / 2 + (deltaY * scaleFactor);
            }
            break;
        }
        return [screenX, screenY];
    }

    function computeY(x) {
        if (x === 0) {
            return 2.8;
        }
        return 0.947 / x + 1.507;
    }

    let distance = 0;
    let leaderData = [0, 0];
    let [leaderX, leaderY] = leaderData;

    function renderFrame() {
        requestAnimationFrame(renderFrame);
        if (!playerPosition || playerPosition.length < 2) return;
        const canvas = setupCanvas();
        const ctx = canvas.getContext("2d");

        leaderData = JSON.parse(GM_getValue(region + gamemode, "[]"));
        if (!ctx || !leaderData.length) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let [old_leaderX, old_leaderY] = [leaderX, leaderY];
        [leaderX, leaderY] = leaderData;
        let [diffX, diffY] = [(leaderX - old_leaderX) * prediction_offset_factor, (leaderY - old_leaderY) * prediction_offset_factor];
        let [predictX, predictY] = worldToScreenPosition(leaderX + diffX, leaderY + diffY);
        const [targetX, targetY] = worldToScreenPosition(leaderX, leaderY);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        ctx.globalAlpha = opacities.line;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
        ctx.globalAlpha = 1;

        const circleRadius = (window.innerWidth / 256 + window.innerHeight / 144) / 2;
        ctx.globalAlpha = opacities.arc;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(targetX, targetY, circleRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "lightblue";
        ctx.beginPath();
        ctx.arc(predictX, predictY, circleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        let new_distance = Math.hypot(leaderX - playerPosition[0], leaderY - playerPosition[1]).toFixed(1);
        let emoji = (diffX == 0 && diffY == 0) ? "😴" : "";
        distance = new_distance;
        ctx.globalAlpha = opacities.d_txt;
        ctx.fillStyle = "black";
        ctx.font = "20px sans-serif";
        ctx.fillText(`Distance: ${distance} ${emoji}`, centerX + 10, centerY - 10);
        ctx.globalAlpha = 1;

        const scaledX = minimapData.x + (minimapData.width * (leaderX + (ARENA_WIDTH / 2)) / ARENA_WIDTH);
        const scaledY = minimapData.y + (minimapData.height * (leaderY + (ARENA_HEIGHT / 2)) / ARENA_HEIGHT);
        ctx.globalAlpha = opacities.arc;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        const miniCircleRadius = (window.innerWidth / 512 + window.innerHeight / 288) / 2;
        ctx.arc(scaledX, scaledY, miniCircleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (win.extern && win.aim) win.extern.onTouchMove(-1, targetX, targetY);
    }

    window.addEventListener("resize", resizeCanvas);

    //new better and cleaner frfr
    CanvasRenderingContext2D.prototype.strokeRect = new Proxy(CanvasRenderingContext2D.prototype.strokeRect, {
        apply: function(target, thisArgs, args){
            const transform = thisArgs.getTransform();
            console.log(transform);
            minimapData.x = transform.e;
            minimapData.y = transform.f;
            minimapData.width = transform.a;
            minimapData.height = transform.d;
            return Reflect.apply(target, thisArgs, args);
        }
    });

    const onWheel = e => {
        //console.log(baseIndex, window.__wasm_HEAPF32[baseIndex+55]);
        if (!window.__wasm_HEAPF32 || !baseIndex || baseIndex === -1) return;
        const heap = window.__wasm_HEAPF32;
        const current = heap[baseIndex + FOV_OFFSET];
        const delta = -Math.sign(e.deltaY) * 0.05 * Math.log10(current / 0.55 + 1);
        heap[baseIndex + FOV_OFFSET] = current + delta;
    };

    document.addEventListener("wheel", onWheel, {
        passive: true
    });

    requestAnimationFrame(renderFrame);
})();