const { Text, Attr, Num, Url, findSys } = require('./utils')

function getData($) {
    // const st = new Date()
    let listData = []
    $('.search_result_row').each((idx, e) => {
        let game = {}

        // url
        game.url = Url($(e), '', 'href')
        // 判断是否合集，并跳过
        if (game.url.includes('/sub/')) return

        // id，由于 data-ds-appid 属性获取 id 会有重复，所以从 url 里面拿 id
        const idStr = game.url.match(/\/app\/\d*/g)
        if (!idStr || !idStr[0]) return
        game.gId = idStr[0].replace('/app/', '')
        if (!game.gId) return
        // 注入 _id
        game._id = `list-${game.gId}`
        // 游戏首图
        game.imgHeaderUrl = `https://media.st.dl.eccdnx.com/steam/apps/${game.gId}/header.jpg`
        // 游戏名
        game.title = Text($(e), '.title')
        // 发布时间
        game.released = Text($(e), '.search_released')
        // 简易评论图标
        // game.reviewImg = ''
        game.review = ''
        let reviewClassNames = Attr($(e), '.search_review_summary', 'class')
        // 碰到这里为空的错误, 做一下判断
        if (reviewClassNames) {
            let reviewClass = reviewClassNames.split(' ')
            let reviewList = ['positive', 'mixed', 'negative']
            reviewList.some(item => {
                if (reviewClass.indexOf(item) !== -1) {
                    // game.reviewImg = `https://store.steampowered.com/public/images/v6/user_reviews_${item}.png`
                    game.review = item
                    return true
                }
            })
        }
        // 系统图标
        game.sys = []
        game.sys = findSys($(e), ['win', 'mac', 'linux'])
        // 折扣信息
        game.discount = Num($(e), '.search_discount')
        // 折扣价格
        let discounted = Text($(e), '.search_price.discounted')
        if (discounted) {
            // 有折扣
            game.price = Num($(e), 'strike') || 0 // 原价
            game.strike = Number(discounted.slice(discounted.lastIndexOf('¥')).replace(/[^\d]/g, '')) || 0 // 实际价格
        } else {
            // 无折扣
            game.price = Num($(e), '.search_price') || 0 // 原价
            game.strike = game.price // 实际价格
        }
        if (!game.strike) {
            game.strike = 0
        }

        listData.push(game)
    })

    // 打印解析数据时间
    // console.log('parse: ', new Date() - st + 'ms')
    return listData
}

module.exports = getData
