const pagination=({page, limit=4, count})=> {
    page=page || 1
    const skip = page ? (page - 1) * limit : 0;
    // console.log({limit, count})   
    let pages=0
    if (count > 0) {
        if (limit) {
            pages = Math.ceil(count / limit);
        } else {
            pages = 1;
        }
    }
    const result = {};
    limit = limit - 0;

    if (page * 1 < pages) {
        result.next = { limit, page: page * 1 + 1 };
    }
    if (page * 1 <= pages && page - 1 != 0) {
        result.previous = { limit, page: page - 1 };
    }
    return {...result,count,pages, skip, limit};
}

export default pagination;