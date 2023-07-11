
function sort_rotate_rects(rect_array) {
    r_rects = [];
    for (let i = 0; i < rect_array.length; i++) {
        r = rect_array[i];
        dx = r[0];
        dy = r[1];
        rotated = false;
        // if (dx < dy) {
        //     r_rects.push([dy, dx, i, true]);
        // } else {
            r_rects.push([dx, dy, i, false]);
        // }
    }
    return r_rects.sort(function(a, b) {
        dx = a[0] - b[0];
        dy = a[1] - b[1];
        if (dx) {
            return -dx;
        }
        return -dy;
    });
}

// rect_array = [[dx, dy]]
function fit_rects(rect_array, box_h) {
    // rects = [[dx, dy, idx, is_rotated]]
    let rects = sort_rotate_rects(rect_array);
    console.log("sorted & rotated:");
    console.log(rects);

    let output_pos = [];

    let cur_height = 0;
    let cur_width = 0;
    let max_w = rects[0][0];
    for (let i = 0; i < rects.length; i++) {
        let cur_rect = rects[i];
        let w = cur_rect[0];
        let h = cur_rect[1];
        let c = cur_rect[2];
        let d = cur_rect[3];
        if (cur_height + h > box_h) {
            if (h > box_h) {
                return [-1, []];
            }
            cur_width += max_w;
            cur_height = 0;
            max_w = w;
        }
        max_w = Math.max(max_w, w);
        output_pos.push([cur_width, cur_height, c, d]);
        cur_height += h;
    }
    return [cur_width + max_w, output_pos];
}

