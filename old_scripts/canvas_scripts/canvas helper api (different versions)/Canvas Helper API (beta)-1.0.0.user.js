// ==UserScript==
// @name         Canvas Helper API (beta)
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  old code rewritten
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* CURRENT FUNCTIONALITY:

Element detection:
- Minimap
- ui Texts

TODO:
- entity text detection
*/

//custom console logs for debugging
const logger = {
    function_calls: false,
};

function func_log(function_name){
    if(!logger.function_calls) return;
    console.log(`%c${function_name} called!`, 'font-weight: bold; font-size: 20px;color: orange;');
}

//helper functions
function calc_transform(point, transformation){
    let [x, y] = point;
    let [a, b, c, d, e, f] = transformation;
    return [a*x + c*y + e, b*x + d*y + f];
}

//DATA
const minimap = {
    canvas_context: undefined,
    points: {
        ru: {
            x: 0,
            y: 0,
        },
        rd: {
            x: 0,
            y: 0,
        },
        ld: {
            x: 0,
            y: 0,
        },
        lu: {
            x: 0,
            y: 0,
        },
    },
};

const texts = {
    entity: [],
    ui: [],
};
window.txt = texts;

//create fake canvas for debugging
const fake_canvas = document.createElement('canvas');
const fake_ctx = fake_canvas.getContext('2d');

function render_fake_debug(){
    func_log('render_fake_debug');
    window.requestAnimationFrame(render_fake_debug);
    //first adjust the size
    if(main_canvas === undefined) return;
    fake_canvas.width = main_canvas.width;
    fake_canvas.height = main_canvas.height;
}
window.requestAnimationFrame(render_fake_debug);

//AWAIT MAIN CANVAS
let main_canvas, main_ctx;
function await_main_canvas(){
    func_log('await_main_canvas');
    let temp_canvas = document.getElementById('canvas');
    if(temp_canvas === undefined || !(temp_canvas instanceof HTMLCanvasElement)){
        return setTimeout(await_main_canvas, 100);
    }else{
        console.log('%cMain canvas loaded successfully', 'color:purple', temp_canvas);
        main_canvas = temp_canvas;
        main_ctx = main_canvas.getContext('2d');
        main_ctx.imageSmoothingEnabled = false;
        fake_ctx.imageSmoothingEnabled = false;
    }
}
await_main_canvas();

//PROXY LOGIC
const canvas_prototype = CanvasRenderingContext2D.prototype;
const methods = [
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
    'createPattern',
    'rect',
];

const clearing_methods = ['beginPath', 'clearRect'];

const function_to_method_map = new WeakMap(); //I need this because target in proxy holds reference to the function, instead of the function's name
for(let method of methods){
    function_to_method_map.set(canvas_prototype[method], method);
}

class CanvasContext{
    constructor(context){
        this.ctx = context;
        this.local_order = [];
        this.line_args = [];
        this.local_methods = {};
        for(let method of methods){
            this.local_methods[method] = [];
        };
    };
    reset_order(){
        this.local_order.length = 0;
    }
    reset_line_args(){
        this.line_args.length = 0;
    }
};

class Communicator{
    constructor(){
        this.contextMap = new WeakMap(); //this is where canvas contexts are being stored
        this.global_order = [];
    }
    reset_order(){
        this.global_order.length = 0;
    }
};

const communicator = new Communicator();
window._c = communicator;

function get_drawImage_sizes(args, target_canvas){
    let x, y, w, h;
     switch(args.length){
        case 2:
            x = args[0];
            y = args[1];
            w = target_canvas.width;
            h = target_canvas.height;
            break;
        case 4:
            x = args[0];
            y = args[1];
            w = args[2];
            h = args[3];
            break;
        case 8:
            x = args[4];
            y = args[5];
            w = args[6];
            h = args[7];
            break;
    }
    return [x, y, w, h];
};

function draw_image_on_fake_canvas(canvas_context){
    func_log('draw_image_on_fake_canvas');
    let target_canvas = canvas_context.local_methods.drawImage[0];
    let target_ctx = target_canvas.getContext('2d');
    let args = canvas_context.local_methods.drawImage.slice(1); //first argument is always canvas, so remove it
    let [x, y, w, h] = get_drawImage_sizes(args, target_canvas);
    let [scaled_x, scaled_y] = calc_transform([x, y], canvas_context.local_methods.setTransform);
    //create rect at the scaled drawImage
    fake_ctx.clearRect(0, 0, fake_canvas.width, fake_canvas.height);//of course clean everything before that
    fake_ctx.beginPath();
    fake_ctx.lineWidth = 5;
    fake_ctx.strokeStyle = 'white';
    fake_ctx.strokeRect(scaled_x, scaled_y, w, h);
    //now apply everything on main_ctx
    main_ctx.beginPath();
    main_ctx.drawImage(fake_canvas, 0, 0);
}

function redraw_minimap(){
    func_log('redraw_minimap');
    fake_ctx.beginPath();
    fake_ctx.strokeStyle = 'lime';
    fake_ctx.font = "50px Arial";
    fake_ctx.moveTo(minimap.points.lu.x, minimap.points.lu.y);
    let keys = Object.keys(minimap.points);
    for(let i = 0; i < minimap.canvas_context.line_args.length; i++){
        let {x, y} = minimap.canvas_context.line_args[i].transformed;
        if(keys[i] != 'lu'){
            minimap.points[keys[i]].x = x;
            minimap.points[keys[i]].x = y;
        }
        fake_ctx.lineTo(x, y);
    }
    fake_ctx.stroke();
    main_ctx.beginPath();
    main_ctx.drawImage(fake_canvas, 0, 0);
};

function save_ui_text(obj){
    func_log('save_ui_text');
    texts.ui.push(obj);
}

function reset_texts(){
    func_log('reset_texts');
    texts.entity.length = 0;
    texts.ui.length = 0;
}

function analyse_drawImage_based_on_color(canvas_context){
    func_log('analyse_drawImage_based_on_color');
    const target_canvas = canvas_context.local_methods.drawImage[0];
    const target_ctx = target_canvas.getContext('2d');
    const color = canvas_context.ctx.fillStyle;
    const target_canvas_context = communicator.contextMap.get(target_ctx);
    const args = canvas_context.local_methods.drawImage.slice(1); //first argument is always canvas, so remove it
    //console.log(`%c source! ${color}`, `color: ${color}`);
    switch(color){
        case '#fcad76':
            //console.log(canvas_context.local_methods, communicator.contextMap.get(target_ctx).local_methods);
            break;
        case '#cdcdcd':
            fake_ctx.clearRect(0, 0, fake_canvas.width, fake_canvas.height);//of course clean everything before that
            //MINIMAP
            if(target_canvas_context.line_args.length === 0){
                minimap.canvas_context = canvas_context;
                minimap.points.lu.x = canvas_context.local_methods.setTransform[4];
                minimap.points.lu.y = canvas_context.local_methods.setTransform[5];
                redraw_minimap();
                return;
            }
            break;
        case "#000000":
            if(target_canvas_context.local_methods.fillText.length === 3){ //ui texts
                const text_string = target_canvas_context.local_methods.fillText[0];
                const [x, y, w, h] = get_drawImage_sizes(args, target_canvas);
                const [scaled_x, scaled_y] = calc_transform([x, y], canvas_context.local_methods.setTransform);
                const ui_text = {
                    text: text_string,
                    at: {
                        unscaled: {
                            x: x,
                            y: y,
                        },
                        scaled: {
                            x: scaled_x,
                            y: scaled_y,
                        },
                    },
                    size: {
                        width: w,
                        height: h,
                    }
                };
                save_ui_text(ui_text);
                draw_image_on_fake_canvas(canvas_context); //visualise the ui text
            }
            break;
    }
};

function handle_drawImage(canvas_context){
    func_log('handle_drawImage');
    const target_canvas = canvas_context.local_methods.drawImage[0];
    const target_ctx = target_canvas.getContext('2d');
    if(target_ctx === fake_ctx) return; //I use main_ctx.drawImage(fake_canvas) so it should be ignored.
    if(communicator.contextMap.has(target_ctx)){
        //console.log(communicator.contextMap.get(target_ctx));
        if(main_ctx !== undefined && canvas_context.ctx === main_ctx){
            //draw_image_on_fake_canvas(canvas_context);
        }else{
            analyse_drawImage_based_on_color(canvas_context);
        }
    }
}

function handle_rect(canvas_context){
    if(canvas_context.ctx.fillStyle === "#000000" && canvas_context.ctx.globalAlpha === 1){
        //console.log(canvas_context);
        //now apply everything on main_ctx
    }
}

function handle_fillRect(canvas_context){
    if (canvas_context.ctx.fillStyle === "#0000ff"){
        //get the text from drawImage
        const target_canvas = canvas_context.local_methods.drawImage[0];
        const target_ctx = target_canvas.getContext('2d');
        const target_canvas_context = communicator.contextMap.get(target_ctx);
        const notification_text = target_canvas_context.local_methods.fillText[0];
        canvas_context.ctx.fillStyle = 'red';
        console.log(notification_text, canvas_context.ctx.fillStyle, communicator.global_order);
        //let's draw where it points at
        fake_ctx.beginPath();
        fake_ctx.moveTo(0, 0);
        fake_ctx.lineTo(canvas_context.local_methods.setTransform[4], canvas_context.local_methods.setTransform[5]);
        fake_ctx.stroke();
        //now apply everything on main_ctx
        main_ctx.beginPath();
        main_ctx.drawImage(fake_canvas, 0, 0);
    }
}

function handle_method_logic(canvas_context, method){
    switch(method){
        case 'drawImage':
            handle_drawImage(canvas_context);
            break;
        case 'rect':
            handle_rect(canvas_context);
            break;
        case 'fillRect':
            handle_fillRect(canvas_context);
            break;
    }
}

const canvas_proxy_handler = {
    apply: function(target, thisArgs, args){
        if(thisArgs === fake_ctx) return Reflect.apply(target, thisArgs, args); //ignore fake canvas entirely, since it only has information from this script, not from the game.
        let cc;
        let method = function_to_method_map.get(target);
        if (!communicator.contextMap.has(thisArgs)){
            cc = new CanvasContext(thisArgs);
        } else {
            cc = communicator.contextMap.get(thisArgs);
        }
        //local_methods update
        cc.local_methods[method] = args;
        if(clearing_methods.includes(method)){
            //data reset
            reset_texts();
            //local reset
            cc.reset_order();
            cc.reset_line_args();
            //global reset
            communicator.reset_order();
        }else{
            //local update
            cc.local_order.push(method);
            if(method === 'lineTo'){
                let {a, b, c, d, e, f} = cc.ctx.getTransform();
                //ax + cy + e, bx + dy + f

                let raw = {x: args[0], y: args[1]};
                let transformed = calc_transform([raw.x, raw.y], [a, b, c, d, e, f]);
                let args_object = {
                    raw: raw,
                    transformed: {
                        x: transformed[0],
                        y: transformed[1],
                    }
                };
                cc.line_args.push(args_object);
            }
            //global update
            communicator.global_order.push(method);
        }
        //finally push updates to contextMap
        communicator.contextMap.set(thisArgs, cc);
        //handle method logic
        handle_method_logic(cc, method);
        return Reflect.apply(target, thisArgs, args);
    }
};

function start_proxies(){
    func_log('start_proxies');
    for(let method of methods){
        if(typeof canvas_prototype[method] === 'function'){
            canvas_prototype[method] = new Proxy(canvas_prototype[method], canvas_proxy_handler);
        }else{
            console.warn('failed to proxy inside non function method', method);
        }
    }
};

start_proxies();
