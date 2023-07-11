
function genRects(n, a, b) {
    rects = [];

    for (let i = 0; i < n; i++) {
        rects.push([Math.floor((a - 2) * Math.random() + 2),
            Math.floor((b - 2) * Math.random() + 2)]);
    }
    return rects;
}

function test() {
    rects = genRects(50, 100, 100);

    console.log(rects);

    

    res = fit_rects(rects, 400);
    height = res[0];
    pos_array = res[1];

    console.log(pos_array);

    drawResult(rects, pos_array);

    // drawRects(rects);
}

function drawRects(rects) {
    const canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    canvas.width  = 400;
    canvas.height = 400;
    
    const ctx = canvas.getContext("2d");

    for (let rect of rects) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(0, 0, rect[0], rect[1]);
    }
}

function drawResult(rect_array, pos_array) {
    const canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    canvas.width  = 400;
    canvas.height = 400;

    const ctx = canvas.getContext("2d");

    for (let i = 0; i < rect_array.length; i++) {
        
        x0 = pos_array[i][0];
        y0 = pos_array[i][1];
        
        idx = pos_array[i][2];
        rotated = pos_array[i][3];

        a = rect_array[idx][0];
        b = rect_array[idx][1];

        if (rotated) {
            [a, b] = [b, a];
        }
        // ctx.rect(x0, y0, a, b);
        // ctx.fillStyle = getRndColor();
        ctx.strokeStyle = "red";
        // ctx.fill();
        ctx.strokeRect(x0, y0, a, b);
        
    }
}

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}
