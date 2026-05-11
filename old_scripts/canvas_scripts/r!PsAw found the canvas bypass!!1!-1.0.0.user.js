// ==UserScript==
// @name         r!PsAw found the canvas bypass!!1!
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  fuck Mi300
// @author       PRAISE r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

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

function proxy_method(ctx, method){
    Object.defineProperty(ctx, method, {
        value: new Proxy(ctx[method], {
            apply(ctxTarget, ctxThis, ctxArgs) {
                const _method = Reflect.apply(ctxTarget, ctxThis, ctxArgs);
                console.log(`${method} arguments: ${ctxArgs}`);
                window.___method = method;
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