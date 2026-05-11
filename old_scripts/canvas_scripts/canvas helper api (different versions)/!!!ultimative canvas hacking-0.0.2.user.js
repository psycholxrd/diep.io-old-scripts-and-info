// ==UserScript==
// @name         !!!ultimative canvas hacking
// @namespace    http://tampermonkey.net/
// @version      0.0.2
// @description  proxying into everything used in canvas and making it work together
// @author       r!PsAw
// @match        https://diep.io/*
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
    'stroke',
    'strokeRect',
    'clearRect',
];
/*
let last_method = {
    name: null,
    target: null,
    thisArgs: null,
    args: null
};
*/
let sT = [0, 0, 0, 0, 0, 0];
let last_m = [];
let calls = {
    'beginPath': 0,
    'setTransform': 0,
    'drawImage': 0,
    'arc': 0,
    'moveTo': 0,
    'lineTo': 0,
    'fill': 0,
    'fillRect': 0,
    'stroke': 0,
    'strokeRect': 0,
    'clearRect': 0,
};
const ctx = canvas.getContext('2d');

function ctx_text(fcolor, scolor, lineWidth, font, text, textX, textY) {
    ctx.lineWidth = lineWidth;
    ctx.font = font;
    ctx.strokeStyle = scolor;
    ctx.strokeText(text, textX, textY);
    ctx.stroke();
    ctx.fillStyle = fcolor;
    ctx.fillText(text, textX, textY);
    ctx.fill();
}

function args_to_xy(args) {
    let result = {
        x: null,
        y: null,
        angle: null,
        width: null
    };
    result.angle = Math.atan2(args[2] || 0, args[3] || 0);
    result.width = Math.hypot(args[3] || 0, args[2] || 0);
    result.x = Math.floor((args[4] || 0) - Math.cos(result.angle + Math.PI / 2) * result.width / 2);
    result.y = Math.floor((args[5] || 0) + Math.sin(result.angle + Math.PI / 2) * result.width / 2);
    return result;
}

/*
function save_last_method(name, target, thisArgs, args){
    last_method.name = name;
    last_method.target = target;
    last_method.thisArgs = thisArgs;
    last_method.args = args;
}
*/

//pattern logic isn't finished yet
function check_pattern(pattern){
    let l1 = last_m.length;
    let l2 = pattern.length;
    let bool = false;
    let counter = 0;
    if(l1 != l2){
        return bool;
    }
    for(let i = 0; i < l1; i++){
        if(last_m[i] === pattern[i]){
            counter++;
        }
    }
    bool = (counter === l2);
    console.log(`Found ${counter} out of ${l2}`);
    console.log(bool);
    return bool;
}

function pattern_finder(){
    //arc pattern:
    /*
    diep.io defines coords for circle using .setTransform(bla, bla, bla, bla, x, y);
    then calls, to set a shape for a circle
    and finally fill, to draw the shape that was set
    */
    if(check_pattern(['setTransform', 'arc', 'fill'])){
        ctx.fillText('fill (arc)', sT[4], sT[5]);
    }
}

function start_proxies(){
methods.forEach(method => {
    CanvasRenderingContext2D.prototype[method] = new Proxy(CanvasRenderingContext2D.prototype[method], {
        apply(target, thisArgs, args) {
console.log(`Method called: ${method}`);
            console.log(`thisArgs:`, thisArgs);
            console.log(`args:`, args);
            switch (method) {
                case 'beginPath':
                    calls[method] = 1; //begin Path gets called
                    //console.log(last_m);
                    last_m = []; //reset previous methods
                    for (let i = 1; i < methods.length; i++) {
                        calls[methods[i]] = 0;
                    }
                    //console.log(method);
                    break
                case 'setTransform':
                    calls['beginPath'] = 0; //reset begin Path calls every time a different method comes
                    calls[method]++; //add 1 to calls of this method
                    last_m.push(method); //store previously called methods
                    sT = args;
                    //console.log(method);
                    break
                case 'drawImage':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //console.log(method);
                    ctx.fillText('drawImage', sT[4], sT[5]);
                    break
                case 'arc':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //console.log(method);
                    break
                case 'moveTo':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    ctx.fillText('moveTo', args[0], args[1]);
                    //console.log(method);
                    break
                case 'lineTo':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    ctx.fillText('lineTo', args[0], args[1]);
                    //console.log(method);
                    break
                case 'fill':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //console.log(method);
                    pattern_finder();
                    break
                case 'fillRect':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //let coords = args_to_xy(args);
                    ctx.fillText('fillRect', args[0], args[1]);
                    //console.log(method);
                    break
                case 'strokeRect':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //let coords = args_to_xy(args);
                    ctx.fillText('strokeRect', args[0], args[1]);
                    //console.log(method);
                    break
                case 'clearRect':
                    calls['beginPath'] = 0;
                    calls[method]++;
                    last_m.push(method);
                    //console.log(method);
                    break
            }
            //console.log(calls);
            //save_last_method(method, target, thisArgs, args);
            return Reflect.apply(target, thisArgs, args);
        }
    });
});
}

function wait_for_spawn(){
    if(window.lobby_ip){
        start_proxies();
        return;
    }
    setTimeout(() => {
        wait_for_spawn();
    }, 100);
}
wait_for_spawn();