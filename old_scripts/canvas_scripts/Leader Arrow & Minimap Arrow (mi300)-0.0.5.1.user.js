// ==UserScript==
// @name         Leader Arrow & Minimap Arrow (mi300)
// @namespace    http://tampermonkey.net/
// @version      0.0.5.1
// @description  updated using mi300's method
// @author       r!PsAw
// @match        https://diep.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// @license      MIT
// ==/UserScript==
window.choose_color = "#000000";
window.arrowv2_debug = false;
function windowScaling() {
  const a = canvas.height / 1080;
  const b = canvas.width / 1920;
  return b < a ? a : b;
}

//credits to mi300
const ARENA_WIDTH = 26000;
const ARENA_HEIGHT = 26000;
let playerPos = [0, 0];
function hook(target, callback){

  function check(){
    window.requestAnimationFrame(check)

    const func = CanvasRenderingContext2D.prototype[target]

    if(func.toString().includes(target)){

      CanvasRenderingContext2D.prototype[target] = new Proxy (func, {
        apply (method, thisArg, args) {
          callback(thisArg, args)

        return Reflect.apply (method, thisArg, args)
        }
      });
    }
  }
  window.requestAnimationFrame(check)
}

function getPlayerPos(){
  const dX = minimapArrow[0] - minimapPos[0];
  const dY = minimapArrow[1] - minimapPos[1];

  const x = (dX / minimapDim[0]) * ARENA_WIDTH;
  const y = (dY / minimapDim[1]) * ARENA_HEIGHT;

  return [x, y]
}

function main(){
  window.requestAnimationFrame(main)
  playerPos = getPlayerPos();
}
window.requestAnimationFrame(main)

let minimapArrow = [0, 0];
let square_pos = [0, 0]
let leaderArrow = [0, 0];
let minimapPos = [0, 0];
let minimapDim = [0, 0];

let calls = 0;
let points = [];

  hook('beginPath', function(thisArg, args){
    calls = 1;
    points = [];
  });
  hook('moveTo', function(thisArg, args){
    if (calls == 1) {
      calls+=1;
      points.push(args)
    } else {
      calls = 0;
    }
  });
  hook('lineTo', function(thisArg, args){
    if (calls >= 2 && calls <= 6) {
      calls+=1;
      points.push(args)
    } else {
      calls = 0;
    }
  });


function getCentre(vertices) {
  let centre = [0, 0];
  vertices.forEach (vertex => {
    centre [0] += vertex[0]
    centre [1] += vertex[1]
  });
  centre[0] /= vertices.length;
  centre[1] /= vertices.length;
  return centre;
}

hook('fill', function(thisArg, args){
    if(calls >= 4 && calls <= 6) {
    if(thisArg.fillStyle === "#000000" && thisArg.globalAlpha > 0.9){
          minimapArrow = getCentre(points);
          window.M_X = minimapArrow[0];
          window.M_Y = minimapArrow[1];
          square_pos = [minimapArrow[0]-(12.5*windowScaling()), minimapArrow[1]-(7*windowScaling())];
        return;
      }else if(thisArg.fillStyle === "#000000" && thisArg.globalAlpha === 0.3499999940395355 || thisArg.fillStyle === window.choose_color && thisArg.globalAlpha === 0.3499999940395355){
          thisArg.fillStyle = window.choose_color;
          leaderArrow = getCentre(points);
          window.L_X = leaderArrow[0];
          window.L_Y = leaderArrow[1];
        return;
      }
    } else {
    calls = 0;
  }
});
/*
hook('fill', function(thisArg, args){
    if(calls >= 4 && calls <= 6) {
    if(thisArg.fillStyle === "#000000"){
        thisArg.globalAlpha = 0.3499999940395355;
      }
    } else {
    calls = 0;
  }
});
*/

hook('strokeRect', function(thisArg, args) {
  const t = thisArg.getTransform();
  minimapPos = [t.e, t.f];
  minimapDim = [t.a, t.d];
});

const ctx = canvas.getContext('2d');
function ctx_arc(x, y, r, sAngle, eAngle, counterclockwise, c) {
    ctx.beginPath();
    ctx.arc(x, y, r, sAngle, eAngle, counterclockwise);
    ctx.fillStyle = c;
    ctx.fill();
}

function draw_arrow(x, y, c) {
    ctx_arc(x, y, 2, 0, 2 * Math.PI, false, c);
}

function draw_viewport(){
    ctx.beginPath();
        ctx.stokeStyle = "black";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(square_pos[0], square_pos[1], 25*windowScaling(), 14*windowScaling());
        ctx.stroke();
}

setTimeout(() => {
    let gui = () => {
      if(window.arrowv2_debug){
        draw_arrow(minimapArrow[0], minimapArrow[1], "lime");
        draw_viewport();
        draw_arrow(leaderArrow[0], leaderArrow[1], "pink");
        draw_arrow(minimapPos[0], minimapPos[1], "purple");
      }
        window.requestAnimationFrame(gui);
    };
    gui();
    setTimeout(() => {
        gui();
    }, 5000);
}, 1000);
