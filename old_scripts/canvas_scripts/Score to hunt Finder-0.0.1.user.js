// ==UserScript==
// @name         Score to hunt Finder
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  try to take over the world!
// @author       r!PsAw
// @match        https://diep.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=diep.io
// @grant        none
// ==/UserScript==

//config
let scores_count = 9; //how many number scores[] is storing.
let min_for_hunt = 100; //for example 500 is 500k minimum to detect it as huntable. Use a number between 1 and 999, or it won't work

//actual script
let scores = [];
let score_to_hunt;
CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
    apply(fillText, ctx, args) {
        let text = args[0];
        if(!text.endsWith(' FPS') && !text.startsWith('Lvl ')){
            if(text.endsWith('k') || text.endsWith('m')){
              if(scores.includes('.')){
                if(scores.length < scores_count){
                scores.push(text);
                }else if(scores.length === scores_count){
                    check_scores();
                    scores = [];
                }
              }
            }
        }

        return fillText.apply(ctx, args);
    }
});

function check_scores(){
    for(let i = 0; i < scores_count; i++){
        if(scores[i].endsWith('k')){
            let f = scores[i].split('.')[0];
            if(f >min_for_hunt){
                score_to_hunt = scores[i];
               console.log(`found valid score to hunt: ${score_to_hunt}`);
                input.inGameNotification(`found valid score to hunt: ${score_to_hunt}`);
            }
        }else if(scores[i].endsWith('m')){
            score_to_hunt = scores[i];
           console.log(`found valid score to hunt: ${score_to_hunt}`);
            input.inGameNotification(`found valid score to hunt: ${score_to_hunt}`);
        }
    }
}