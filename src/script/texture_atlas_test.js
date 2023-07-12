
var TEX_IDX = {};

async function test() {
    HEIGHT = 512;
    WIDTH = 512;

    DEPTH = 100;

    // urls = [
    //     "src/img/cowboy_0.png",
    //     "src/img/cowboy_0r.png",
    //     "src/img/cowboy_0j.png",
    //     "src/img/cowboy_0jr.png",
    //     "src/img/tile_1.png",
    //     "src/img/dust_00.png",
    //     "src/img/dust_01.png",
    //     "src/img/dust_02.png",
    //     "src/img/dust_03.png"
    //     // "src/img/atlas_test/1.png",
    //     // "src/img/atlas_test/2.png",
    //     // "src/img/atlas_test/3.png",
    //     // "src/img/atlas_test/4.png",
    //     // "src/img/atlas_test/5.png",
    //     // "src/img/atlas_test/6.png",
    //     // "src/img/atlas_test/7.png",
    //     // "src/img/atlas_test/8.png",
    //     // "src/img/atlas_test/9.png",
    //     // "src/img/atlas_test/10.png",
    //     // "src/img/atlas_test/11.png"
    // ];

    tex_urls = [
        ["player_0", "src/img/cowboy_0.png"],
        ["player_0r", "src/img/cowboy_0r.png"],
        ["player_0j", "src/img/cowboy_0j.png"],
        ["player_0jr", "src/img/cowboy_0jr.png"],
        ["tile_0", "src/img/tile_2.png"],
        ["tile_0r", "src/img/tile_2r.png"],
        ["tile_0l", "src/img/tile_2l.png"],
        ["dust_00", "src/img/dust_00.png"],
        ["dust_01", "src/img/dust_01.png"],
        ["dust_02", "src/img/dust_02.png"],
        ["dust_03", "src/img/dust_03.png"],
        ["bush_00", "src/img/desert_bush.png"],
        ["cactus_0", "src/img/cactus_0.png"]
    ];

    urls = [];

    for (let i = 0; i < tex_urls.length; i++) {
        let elem = tex_urls[i];
        urls.push(elem[1]);
        TEX_IDX[elem[0]] = i;
    }

    res = await buildAtlas(urls);
    // imageData:
    tex_atlas = res[0];

    TEX_H = tex_atlas.height;
    TEX_W = tex_atlas.width;

    const canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log('canvas failed');
        return;
    }
    canvas.width  = TEX_W;
    canvas.height = TEX_H;
    
    const ctx = canvas.getContext("2d");

    ctx.drawImage(tex_atlas, 0, 0);

    // var download = function(){
    //   var link = document.createElement('a');
    //   link.download = 'filename.png';
    //   link.href = document.getElementById('canvas').toDataURL()
    //   link.click();
    // }

    // download();


    // coords: [tex_x0, tex_y0, dx, dy]
    tex_coords = res[1];

    // render_info = [
    //     [TEX_IDX.bear, 0, 0, 0],
    //     [TEX_IDX.melon, 100, 100, 0],
    //     [TEX_IDX.stone, 200, 200, 0],
    //     [TEX_IDX.bomb, 300, 300, 0],
    //     [TEX_IDX.lemon, 400, 400, 0]
    // ];

    // // 
    // gl_info = [];

    // for (let elem of render_info) {
    //     [idx, x0, y0, z] = elem;
    //     [tex_x0, tex_y0, dx, dy] = tex_coords[idx];
    //     x0 = x0 

    //     x0 = (x0 - WIDTH / 2) / (WIDTH / 2);
    //     y0 = ((HEIGHT / 2) - y0) / (HEIGHT / 2);
    //     dx = dx / (WIDTH / 2);
    //     dy = dy / (HEIGHT / 2);

    //     tex_dx = dx / (TEX_W / 2);
    //     tex_dy = dy / (TEX_H / 2);
    //     new_vertex = [
    //         x0,    y0,    z, tex_x0, tex_y0,
    //         x0,    y0+dy, z, tex_x0, tex_y0 + tex_dy,
    //         x0+dx, y0+dy, z, tex_x0 + tex_dy, tex_y0 + tex_dy,
    //         x0+dx, y0,    z, tex_x0 + tex_dy, tex_y0
    //     ];
    //     gl_info.push(...new_vertex);
    // }

    // console.log(res);
}

