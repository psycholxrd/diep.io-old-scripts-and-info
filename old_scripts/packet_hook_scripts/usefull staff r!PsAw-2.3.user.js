// ==UserScript==
// @name         usefull staff r!PsAw
// @namespace    http://tampermonkey.net/
// @version      2.3
// @description  try to take over the world!s
// @author       MysteriousImage300, r!PsAw
// @match        https://diep.io/
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      MIT
// @grant        none
// ==/UserScript==
//other
var locked=true;

(function() {
	var isActive = true;

	function f(e){
		if (!isActive) return;
		var a = new KeyboardEvent("keydown", {
			bubbles: true,
			cancelable: true,
			shiftKey: false
		});
		delete a.keyCode;
		Object.defineProperty(a, "keyCode", {
			"value": 75
		});
		dispatchEvent(a);
	}
	function a(e) {
		addEventListener(e, f);
	}

	for (var i of ["focus", "blur", "keyup"]) {
		a(i);
	}

	addEventListener("keydown", function(e) {
		if (e.keyCode == 75 && e.isTrusted) {
			isActive ^= true;
		}
	});
}());
//modes
var smashy=false;
var realshotgun=false;
var triflank=false;
var twintriplet=false;
var trapperM=false;
var bomber=false;
var deathstar=false;
var trappers=false;
var overlordM=false;
var twinbasic=false;
var autorespawn=false;
var freeze=false;
// tank ids
function magicNum(build) {
  for (var i = 0, seed = 1, res = 0, timer = 0; i < 40; i++) {
   let nibble = parseInt(build[i], 16);
   res ^= ((nibble << ((seed & 1) << 2)) << (timer << 3));
   timer = (timer + 1) & 3;
   seed ^= !timer;
  };

  return res >>> 0; // unsigned
}
let t = {
    tank: 0,
    twin: 1,
    triplet:2,
    tripleshot: 3,
    quad: 4,
    octo: 5,
    sniper: 6,
    machine: 7,
    flank: 8,
    triangle: 9,
    destroyer: 10,
    overseer: 11,
    overlord: 12,
    twinflank: 13,
    penta: 14,
    assasin: 15,
    arenacloser: 16,
    necro: 17,
    tripletwin: 18,
    hunter: 19,
    gunner: 20,
    stalker: 21,
    Ranger: 22,
    booster: 23,
    fighter: 24,
    hybrid: 25,
    manager: 26,
    mothership: 27,
    predator: 28,
    sprayer: 29,
    predatorx: "", // Deleted : Probably Predator X
    trapper: 31,
    gunnertrapper: 32,
    overtrapper: 33,
    megatrapper: 34,
    tritrapper: 35,
    smasher: 36,
    megasmasher: "", // Deleted : Probably Mega Smasher
    landmine: 38,
    autogunner: 39,
    auto5: 40,
    auto3: 41,
    spreadshot: 42,
    streamliner: 43,
    autotrapper: 44,
    dominator3: "Dominator", // Destroyer
    dominator1: "Dominator", // Gunner
    dominator2: "Dominator", // Trapper
    battleship: 48,
    anni: 49,
    autosmasher: 50,
    Spike: 51,
    fac: 52,
    ball: "", // Nameless and the "initial tank" value. Looks like the Ball tank
    skimmer: 54,
    rocketeer: 55,

    length: 56
};
var mnumber = magicNum('3c536b647b9580265512bfe7214558bd48945ef9') % 54;
var tank = ( t.tank ^ mnumber) <<1
var twin = ( t.twin ^ mnumber) <<1
var triplet = ( t.triplet ^ mnumber) <<1
var tripleshot = ( t.tripleshot ^ mnumber) <<1
var quad = ( t.quad ^ mnumber) <<1
var octo = ( t.octo ^ mnumber) <<1
var sniper= ( t.sniper ^ mnumber) <<1
var machine= ( t.machine ^ mnumber) <<1
var flank= ( t.flank ^ mnumber) <<1
var triangle= ( t.triangle ^ mnumber) <<1
var destroyer= ( t.destroyer ^ mnumber) <<1
var overseer= ( t.overseer ^ mnumber) <<1
var overlord= ( t.overlord ^ mnumber) <<1
var twinflank= ( t.twinflank ^ mnumber) <<1
var penta= ( t.penta ^ mnumber) <<1
var assasin= ( t.assasin ^ mnumber) <<1
var necro= ( t.necro ^ mnumber) <<1
var tripletwin= ( t.tripletwin ^ mnumber) <<1
var hunter= ( t.hunter ^ mnumber) <<1
var gunner= ( t.gunner ^ mnumber) <<1
var stalker= ( t.stalker ^ mnumber) <<1
var Ranger= ( t.Ranger ^ mnumber) <<1
var booster= ( t.booster ^ mnumber) <<1
var fighter= ( t.fighter ^ mnumber) <<1
var hybrid= ( t.hybrid ^ mnumber) <<1
var manager= ( t.manager ^ mnumber) <<1
var predator= ( t.predator ^ mnumber) <<1
var sprayer= ( t.sprayer ^ mnumber) <<1
var trapper= ( t.trapper ^ mnumber) <<1
var tritrapper= ( t.tritrapper ^ mnumber) <<1
var megatrapper= ( t.megatrapper ^ mnumber) <<1
var gunnertrapper= ( t.gunnertrapper ^ mnumber) <<1
var overtrapper= ( t.overtrapper ^ mnumber) <<1
var smasher= ( t.smasher ^ mnumber) <<1
var landmine= ( t.landmine ^ mnumber) <<1
var autogunner= ( t.autogunner ^ mnumber) <<1
var auto5= ( t.auto5 ^ mnumber) <<1
var auto3= ( t.auto3 ^ mnumber) <<1
var spreadshot= ( t.spreadshot ^ mnumber) <<1
var streamliner= ( t.streamliner ^ mnumber) <<1
var autotrapper= ( t.autotrapper ^ mnumber) <<1
var battleship= ( t.battleship ^ mnumber) <<1
var anni= ( t.anni ^ mnumber) <<1
var autosmasher= ( t.autosmasher ^ mnumber) <<1
var Spike= ( t.Spike ^ mnumber) <<1
var fac= ( t.fac ^ mnumber) <<1
var skimmer= ( t.skimmer ^ mnumber) <<1
var rocketeer= ( t.rocketeer ^ mnumber) <<1
// actual code
document.addEventListener("keydown", function(zEvent) {
    if ( zEvent.code === "KeyP") {
        function fire(t, w) {
            setTimeout(function() {
                input.keyDown(32);
            }, t * 1000);
            setTimeout(function() {
                input.keyUp(32);
            }, t * 1000 + w);
        }
        fire(0, 100);
        setTimeout(function() {
            input.keyDown(69);
        }, 200);
    }
});
document.addEventListener("keydown", function(zEvent) {
    if ( zEvent.code === "Minus") {
        function fire(t, w) {
            setTimeout(function() {
                input.keyDown(32);
            }, t * 1000);
            setTimeout(function() {
                input.keyUp(32);
            }, t * 1000 + w);
        }
        fire(0, 100);
        fire(0.75, 200);
        fire(1.5, 750);
        setTimeout(function() {
            input.keyDown(69);
        }, 2000);
    }
});

function trick() {
        input.keyDown(32);
        Hook.send([4, machine]);
        Hook.send([4, destroyer]);
       setTimeout(() => {
        Hook.send([4, anni]);
       }, 100);
        setTimeout(() => {
        input.keyUp(32);
       }, 150);
    };
function drones() {
    if(freeze) {
        input.keyDown(16);
        setTimeout(() => {
        input.keyUp(16);
        }, 500);
    }
};
function script() {
    if (smashy) {
        Hook.send([4, smasher]);
        Hook.send([4, landmine]);
        input.keyDown(220);
        input.keyUp(220);
    }
    if (triflank) {
        Hook.send([4, triangle]);
        setTimeout(() => {
        }, 350);
        input.keyDown(220);
        input.keyUp(220);
    }
    if (twintriplet) {
        Hook.send([4, triplet])
         input.keyDown(220);
            input.keyUp(220);
        Hook.send([4, tripleshot]);
    }
    if (trapperM) {
            Hook.send([4, gunnertrapper]);
        setTimeout(() => {
            }, 75);
        input.keyDown(220);
        input.keyUp(220);
    }
    if (deathstar) {
        Hook.send([4, octo]);
       setTimeout(() => {
            input.keyDown(220);
            input.keyUp(220);
       }, 350);
       setTimeout(() => {
       }, 350);
   }
    if (bomber) {
        input.keyDown(220); input.keyUp(220);
        Hook.send([4, machine]);
        Hook.send([4, destroyer]);
        setTimeout(() => {
        }, 75);
    }
    if (trappers) {
        Hook.send([4, megatrapper]);
       setTimeout(() => {
        input.keyDown(220); input.keyUp(220);
       }, 25);
    }
    if (overlordM) {
        input.keyDown(220); input.keyUp(220);
        Hook.send([4, sniper]); Hook.send([4, overseer]); Hook.send([4, overlord])
    }
    if (realshotgun) {
        Hook.send([4, twin]);
        input.keyDown(220); input.keyUp(220);
            setTimeout(() => {
           }, 50);
    }
    if (autorespawn) {
       input.execute("game_spawn Somebody");
        input.execute('game_stats_build 555555566666667777777888888844444');
            }
    }
// activation
document.addEventListener("keydown", (kc) => {
  if (kc.keyCode===89) locked=!locked;
   if(!locked) {
    if (kc.keyCode===48) smashy=!smashy;
    if (kc.keyCode===78) {
        triflank=!triflank;
            Hook.send(new Uint8Array([4, flank]));
    };
    if (kc.keyCode===70) {
        twintriplet=!twintriplet;
            Hook.send(new Uint8Array([4, twin]));
           Hook.send(new Uint8Array([4, tripleshot]));
    };
    if (kc.keyCode===81) {
        trapperM=!trapperM;
            Hook.send(new Uint8Array([4, sniper]));
           Hook.send(new Uint8Array([4, trapper]));
    };
    if (kc.keyCode===84) realshotgun=!realshotgun;
    if (kc.keyCode===86) bomber=!bomber;
    if (kc.keyCode===90) {
        deathstar=!deathstar;
            Hook.send(new Uint8Array([4, twin]));
           Hook.send(new Uint8Array([4, quad]));
    };
    if (kc.keyCode===71) {
        trappers=!trappers;
           Hook.send(new Uint8Array([4, sniper]));
           Hook.send(new Uint8Array([4, trapper]));
    };
    if (kc.keyCode===66) overlordM=!overlordM;
   };
    if (kc.keyCode===73) autorespawn=!autorespawn;
    if (kc.keyCode===88) trick();
    if (kc.keyCode===57) freeze=!freeze;
});
// interval
setInterval(script, 100);
setInterval(drones, 1000);
// gui
const ctx = canvas.getContext("2d");
setTimeout(() => {
    let gui = () => {
        ctx.fillStyle = "white";
        ctx.lineWidth = 8;
        ctx.font = 2 + "em Ubuntu";
        ctx.strokeStyle = "black";
        ctx.strokeText(`[Y]:unlock sandbox: ${!locked}`, 2250, 50);
        ctx.fillText(`[Y]:unlock sandbox: ${!locked}`, 2250, 50);
        ctx.fillStyle = "lime";
        ctx.lineWidth = 5;
        ctx.font = 1 + "em Ubuntu";
        ctx.strokeStyle = "green";
        ctx.strokeText(`[0]:Smashy: ${smashy}`, 20, 250);
        ctx.fillText(`[0]:Smashy: ${smashy}`, 20, 250);
        ctx.strokeText(`[N]:Triflank: ${triflank}`, 20, 270);
        ctx.fillText(`[N]:Triflank: ${triflank}`, 20, 270);
        ctx.strokeText(`[Z]:Deathstar: ${deathstar}`, 20, 290);
        ctx.fillText(`[Z]:Deathstar: ${deathstar}`, 20, 290);
        ctx.strokeText(`[F]:TwinTriplet: ${twintriplet}`, 20, 310);
        ctx.fillText(`[F]:TwinTriplet: ${twintriplet}`, 20, 310);
        ctx.strokeText(`[V]:Bomber: ${bomber}`, 20, 330);
        ctx.fillText(`[V]:Bomber: ${bomber}`, 20, 330);
        ctx.strokeText(`[Q]:Trapper: ${trapperM}`, 20, 350);
        ctx.fillText(`[Q]:Trapper: ${trapperM}`, 20, 350);
        ctx.strokeText(`[G]:Trappers: ${trappers}`, 20, 370);
        ctx.fillText(`[G]:Trappers: ${trappers}`, 20, 370);
        ctx.strokeText(`[T]:TwinBasic: ${realshotgun}`, 20, 390);
        ctx.fillText(`[T]:TwinBasic: ${realshotgun}`, 20, 390);
        ctx.strokeText(`[B]:Overlord: ${overlordM}`, 20, 410);
        ctx.fillText(`[B]:Overlord: ${overlordM}`, 20, 410);
        ctx.fillStyle = "lightBlue";
        ctx.lineWidth = 5;
        ctx.font = 1 + "em Ubuntu";
        ctx.strokeStyle = "blue";
        ctx.strokeText(`[9]:Freeze Drones: ${freeze}`, 20, 450);
        ctx.fillText(`[9]:Freeze Drones: ${freeze}`, 20, 450);
         ctx.fillStyle = "yellow";
         ctx.lineWidth = 5;
         ctx.font = 1 + "em Ubuntu";
         ctx.strokeStyle = "red";
        ctx.strokeText(`[X]Trickshot`, 20, 470);
        ctx.fillText(`[X]Trickshot`, 20, 470);
        ctx.strokeText(`[i]:AutoRespawn: ${autorespawn}`, 20, 490);
        ctx.fillText(`[i]:AutoRespawn: ${autorespawn}`, 20, 490);
        ctx.strokeText(`[P]BulletStack`, 20, 510);
        ctx.fillText(`[P]BulletStack`, 20, 510);
        ctx.strokeText(`[-]Predator`, 20, 530);
        ctx.fillText(`[-]Predator`, 20, 530);
         ctx.fillStyle = "pink";
         ctx.lineWidth = 5;
         ctx.font = 1 + "em Ubuntu";
         ctx.strokeStyle = "purple";
        ctx.strokeText(`[Tab]Toggle UI Settings`, 20, 550);
        ctx.fillText(`[Tab]Toggle UI Settings`, 20, 550);
         ctx.fillStyle = "white";
         ctx.lineWidth = 5;
         ctx.font = 1 + "em Ubuntu";
         ctx.strokeStyle = "black";
        ctx.strokeText(`Made By MI300#4401 and r!PsAw/6b6#6368`, 30, 580);
        ctx.fillText(`Made By MI300#4401 and r!PsAw/6b6#6368`, 30, 580);
        window.requestAnimationFrame(gui);
    }
    gui();
    setTimeout(() => {
        gui();
    },5000);
}, 1000);

//extra

const HTML = `
<table style="width:100%">
<tr>
    <td>Upgrades</td>
    <td><button onclick='input.execute("ren_upgrades true")'>On</button></td>
    <td><button onclick='input.execute("ren_upgrades false")'>Off</button></td>
  </tr>
  <tr>
    <td>Stats</td>
    <td><button onclick='input.execute("ren_stats true")'>On</button></td>
        <td><button onclick='input.execute("ren_stats false")'>Off</button></td>
  </tr>

    <tr>
    <td>Ui</td>
    <td><button onclick='input.execute("ren_ui true")'>On</button></td>
    <td><button onclick='input.set_convar("ren_ui", false)'>Off</button></td>
  </tr>
      <tr>
    <td>Scoreboard</td>
    <td><button onclick='input.execute("ren_scoreboard true")'>On</button></td>
        <td><button onclick='input.execute("ren_scoreboard false")'>Off</button></td>
  </tr>
      <td>Scoreboard(Names)</td>
    <td><button onclick='input.execute("ren_scoreboard_names true")'>On</button></td>
        <td><button onclick='input.execute("ren_scoreboard_names false")'>Off</button></td>
  </tr>
    </tr>
      <td>Names</td>
    <td><button onclick='input.execute("ren_names true")'>On</button></td>
        <td><button onclick='input.execute("ren_names false")'>Off</button></td>
  </tr>
    </tr>
        </tr>
</table>
    `
const styles = `
div#dt-menu > table, th, td {
  border: 1px solid green;
  padding-left:10px;
  padding-right:10px;
  border-collapse: collapse;
  overflow-y:auto;
  word-wrap:break-all;
}
div#dt-menu > button {
    font-family: inherit;
    font-size: 1em;
}

`
const menuStyles = {
    position: "absolute",
    top: "40%",
    width:"12vw",
    height:"12vh",
    left: "0%",
    display: "none",
    "background-color": "rgba(0, 20, 20, 20)",
    "font-family":'"Montserrat","Verdana"'
}
// <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat">
const menu = document.createElement("div")
for (var prop in menuStyles) {
    menu.style[prop] = menuStyles[prop]
}
menu.innerHTML = HTML
menu.id = "dt-menu"
const styleElement = document.createElement("style")
const font = document.createElement("link")
font.rel = "stylesheet"
font.href = "https://fonts.googleapis.com/css?family=Montserrat"
styleElement.innerHTML = styles
document.head.appendChild(styleElement)
document.head.appendChild(font)
document.body.appendChild(menu)
const myEvent = function(event) {
switch (event.key) {
    case "Tab":
        if (menu.style.display == "none") {
            menu.style.display = "block"
            console.log("Menu Enabled!")
        }
        else {
            menu.style.display = "none"
            console.log("Menu Disabled!")
        }
        break

    }
}
window.addEventListener("keydown",myEvent)
console.log("Key functions loaded!")