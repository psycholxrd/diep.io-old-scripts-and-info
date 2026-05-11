// ==UserScript==
// @name         Doppelganger Tracker (use with Canvas Helper API)
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Continuously track and aim at closest player to last click
// @author       r!PsAw
// @match        https://diep.io/*
// @grant        none
// ==/UserScript==

let tracking_active = false;
let animation_frame_id = null;
let last_target = null;

function get_closest_tank(tanks, x, y) {
    let closest = null;
    let min_d = Infinity;
    for (let tank of tanks) {
        let dx = tank.body[0].x - x;
        let dy = tank.body[0].y - y;
        let dist = Math.hypot(dx, dy);
        if (dist < min_d) {
            closest = tank;
            min_d = dist;
        }
    }
    return closest;
}

function copy_aim_towards_angle(angle_radians) {
    const start = {
        x: canvas.width / 2,
        y: canvas.height / 2,
    };
    const length = Math.min(start.x, start.y);
    input.onTouchMove(
        -1000,
        start.x + Math.cos(angle_radians) * length,
        start.y + Math.sin(angle_radians) * length
    );
}

function tracking_loop() {
    if (!tracking_active) return;

    const tanks = window.ripsaw_api?.get_tanks?.();
    if (!tanks?.length) return;

    last_target = get_closest_tank(
        tanks,
        last_target ? last_target.body[0].x : 0,
        last_target ? last_target.body[0].y : 0
    );

    if (last_target) {
        for (const turret of last_target.turrets) {
            const angle = turret.reversedAngle ?? -turret.angle;
            if (turret.source_array === "rectangular" && typeof angle === "number") {
                copy_aim_towards_angle(angle);
                break;
            }
        }
    }

    animation_frame_id = requestAnimationFrame(tracking_loop);
}

function start_tracking(x, y) {
    if (!window.ripsaw_api) {
        input.inGameNotification("Missing Canvas Helper API. Join Discord: https://discord.gg/S3ZzgDNAuG");
        return;
    }

    cancel_tracking();

    tracking_active = true;
    last_target = get_closest_tank(window.ripsaw_api.get_tanks(), x, y);
    animation_frame_id = requestAnimationFrame(tracking_loop);
}

function cancel_tracking() {
    tracking_active = false;
    if (animation_frame_id) {
        cancelAnimationFrame(animation_frame_id);
        animation_frame_id = null;
    }
    last_target = null;
}

window.addEventListener("mousedown", function (e) {
    if (window.input && window.input.doesHaveTank() && e.button === 0) {
        start_tracking(e.clientX, e.clientY);
    }
});

window.addEventListener("keydown", function (e) {
    if (e.key.toLowerCase() === "x") {
        cancel_tracking();
        input.inGameNotification("Tracking stopped.");
    }
});