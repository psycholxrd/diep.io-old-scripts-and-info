// ==UserScript==
// @name         !!!WeakMap test
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  fuck Mi300
// @author       PRAISE r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

//modify here
const new_font = 'Fredoka One';

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

//efficient way to store things?
let current_contexts;
let contexts = new WeakMap();
let texts_on_screen = new Map();

//WTF ENTITY TRACKING???
function proxy_method(ctx, method){
    let map = new Map();
    Object.defineProperty(ctx, method, {
        value: new Proxy(ctx[method], {
            apply(ctxTarget, ctxThis, ctxArgs) {
                //text detection
                if(method === 'drawImage' && ctxArgs[0]._text) {
                    let fontSize = ctxThis.font.split(' ')[0];
                    ctxThis.font = `${fontSize} ${new_font}`;
                    ctx.canvas._text = ctxArgs[0];
                    //console.log(ctxArgs[0]._text);
                    const transform = ctx.getTransform();
                    //console.log(`text: ${ctxArgs[0]._text} x: ${transform.e} y: ${transform.f}`);
                    texts_on_screen.set(ctxArgs[0]._text, {x: transform.e, y:transform.f});
                }
                if(method === 'fillText') {
                    let fontSize = ctxThis.font.split(' ')[0];
                    ctxThis.font = `${fontSize} ${new_font}`;
                    ctx.canvas._text = ctxArgs[0];
                }
                if(method === 'strokeText') {
                    let fontSize = ctxThis.font.split(' ')[0];
                    ctxThis.font = `${fontSize} ${new_font}`;
                    ctx.canvas._text = ctxArgs[0];
                }
                //changing arguments of methods for every known context
                const _method = Reflect.apply(ctxTarget, ctxThis, ctxArgs);
                map.set(method, ctxArgs);
                if(contexts.has(ctx)){
                    contexts.get(ctx).set(method, ctxArgs);
                }else{
                    contexts.set(ctx, map);
                }
                window.__c = contexts;
                window.__cc = current_contexts;
                window.__t = texts_on_screen;
                //console.log(`${method} arguments: ${ctxArgs}`);
                return _method;
            }
        }),
        configurable: true,
        writable: true
    });
}

function proxy_methods(ctx){
    methods.forEach(method => proxy_method(ctx, method));
}

Array.prototype.push = new Proxy(Array.prototype.push, {
    apply: function(target, thisArgs, args){
        if(args[0] instanceof CanvasRenderingContext2D){
            current_contexts = thisArgs;
            let main_ctx = canvas.getContext('2d');
            if(!main_ctx.proxied) {
                proxy_methods(main_ctx);
                main_ctx.proxied = true;
            }
            if(!args[0].proxied){
                proxy_methods(args[0]); // pass in the context
                args[0].proxied = true;
            }
        }
        return Reflect.apply(target, thisArgs, args);
    }
});