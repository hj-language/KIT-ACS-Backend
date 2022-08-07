const paging = (page, totalPost, limit) => {
    page = parseInt(page)
    totalPost = parseInt(totalPost)
    limit = parseInt(limit)

    let pageNum = page || 1
    let postLimit = limit || 20
    const pagination = 10
    const hidePost = page === 1 ? 0 : (page - 1) * postLimit
    const totalPages = Math.ceil((totalPost - 1) / postLimit)
    const startPage = Math.floor((pageNum - 1) / pagination) * pagination + 1
    let endPage = startPage + pagination - 1

    if (pageNum > totalPages) pageNum = totalPages
    if (endPage > totalPages) endPage = totalPages
    if (totalPages === 0) endPage = 1

    return { startPage, endPage, hidePost, postLimit, totalPages, pageNum }
}

module.exports = paging