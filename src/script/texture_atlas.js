
function addImageProcess(src) {
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function loadImage(imageUrl) {
  return addImageProcess(imageUrl);
}

async function loadImages(urls) {
    let imgs = [];
    for (let url of urls) {
        imgs.push(loadImage(url));
    }
    res = await Promise.all(imgs);
    return res;
}

function imgs2Rects(imgs, padding) {
    rects = [];
    for (let img of imgs) {
        rects.push([img.width + 2 * padding, img.height + 2 * padding]);
    }
    return rects;
}

async function buildAtlas(urls) {
    imgs = await loadImages(urls);
    const padding = 2;
    rects = imgs2Rects(imgs, padding);
    console.log(rects);

    cur_h = 32;
    res_pos = [];

    while (true) {
        res = fit_rects(rects, cur_h);
        res_w = res[0];
        if (res_w > cur_h || res_w == -1) {
            cur_h *= 2;
            continue;
        }

        res_pos = res[1];
        break;
    }

    console.log(cur_h);

    // tex_url = 

    // tex_atlas = await loadImage(tex_url);

    tex_atlas = drawAtlas(imgs, res_pos, cur_h, padding);

    let coords = [];
    for (let p of res_pos) {
        // x0, y0, dx, dy
        coords.push([0, 0, 0, 0]);
    }

    for (let p of res_pos) {
        [x0, y0, idx, rotated] = p;
        coords[idx] = [x0 + padding, y0 + padding, imgs[idx].width, imgs[idx].height];
    }

    return [tex_atlas, coords];
}

function drawAtlas(imgs, pos, h, padding) {
    const canvas = new OffscreenCanvas(h, h);
    // const canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    // canvas.width  = h;
    // canvas.height = h;
    
    const ctx = canvas.getContext("2d");

    for (let p of pos) {
        let x0, y0, idx, rotated;
        [x0, y0, idx, rotated] = p;
        ctx.drawImage(imgs[idx], x0 + padding, y0 + padding);
    }

    // return createImageBitmap(ctx.getImageData(0, 0, h, h));
    return canvas.transferToImageBitmap();
}

// async function test() {
//     urls = [
//         "src/img/atlas_test/1.png",
//         "src/img/atlas_test/2.png",
//         "src/img/atlas_test/3.png",
//         "src/img/atlas_test/4.png",
//         "src/img/atlas_test/5.png",
//         "src/img/atlas_test/6.png",
//         "src/img/atlas_test/7.png",
//         "src/img/atlas_test/8.png",
//         "src/img/atlas_test/9.png",
//         "src/img/atlas_test/10.png",
//         "src/img/atlas_test/11.png"
//     ];
//     buildAtlas(urls);
// }

/*
function asyncThing1() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(20), 2000);
  });
}

async function f() {
    let a = [];
    for (let i = 0; i < 10; i++) {
        a.push(asyncThing1());
    }
    let b = await Promise.all(a);
    console.log(b);
}

f();
*/
