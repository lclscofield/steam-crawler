const Crawler = require('crawler')
const fs = require('fs')

const { Text, Attr, Num, Url, findSys } = require('./utils')
const getGameList = require('./getGameList')

console.time('总耗时')

// 总的列表数据
const mapList = [
    {
        type: 'all',
        pageTotal: 0,
        url: 'https://store.steampowered.com/search/results?l=schinese&count=100&start=',
        gIds: new Set(), // 游戏 gId 集合
        data: []
    },
    {
        type: 'discount',
        pageTotal: 0,
        url: 'https://store.steampowered.com/search/results?l=schinese&specials=1&count=100&start=',
        gIds: new Set(),
        data: []
    },
    {
        type: 'hot',
        pageTotal: 0,
        url: 'https://store.steampowered.com/search/results?l=schinese&filter=topsellers&count=100&start=',
        gIds: new Set(),
        data: []
    },
    {
        type: 'new',
        pageTotal: 0,
        url: 'https://store.steampowered.com/search/results?l=schinese&filter=popularnew&count=100&start=',
        gIds: new Set(),
        data: []
    }
]

// 总的详情数据
const detailList = []

// 列表类型
const listType = ['all', 'discount', 'hot', 'new']

// 获取各类型总页数
function fetchPage() {
    mapList.forEach(item => {
        c.queue({
            uri: item.url + 1,
            type: item.type,
            callback: function(err, res, done) {
                if (err) {
                    console.log(err)
                } else {
                    const $ = res.$
                    const { type } = res.options
                    const obj = typeObj(type)
                    const text = Text($('.search_results_count'), '')
                    console.log()
                    obj.pageTotal = Number.parseInt((text.match(/\d*/g).join('')) / 100) + 1
                    console.log(123, obj.type, obj.pageTotal, text.match(/\d*/g).join(''))
                    fetchGameList(obj)
                }
                done()
            }
        })
    })
}

// 爬取游戏列表
function fetchGameList(item) {
    for (let i = 0; i < item.pageTotal; i++) {
        c.queue({
            uri: item.url + i * 100,
            page: i + 1,
            type: item.type
        })
    }
}

// 根据 type 获取元对象
function typeObj(type) {
    return mapList.find(item => {
        return item.type === type
    })
}

// 爬取队列
const c = new Crawler({
    retries: 10, // 请求失败重试 10 次
    // 在每个请求处理完毕后将调用此回调函数
    callback: function(err, res, done) {
        if (err) {
            console.log(err)
        } else {
            const $ = res.$
            const { page, type } = res.options

            // 获取列表数据
            if (listType.includes(type)) {
                let pageData = getGameList($) // 解析数据
                const map = typeObj(type) // 获取元数据

                // 数据过滤去重
                pageData = pageData.filter(game => {
                    const gId = game.gId
                    if (!map.gIds.has(gId)) {
                        map.gIds.add(gId)
                        return true
                    }
                })
                map.data[page - 1] = pageData
                console.log(`${map.type}：第 ${page} 页`)
            }

            // 获取详情数据
            if (type === 'detail') {
            }
        }
        done()
    }
})

// 爬取完毕回调
c.on('drain', function() {
    mapList.forEach(map => {
        console.log(`${map.type} 总页数：${map.pageTotal}`)
        console.log(`${map.type} gIds：${map.gIds.size}`)

        // 写入文件
        console.time(`${map.type} 写入文件耗时`)
        const ws = fs.createWriteStream(__dirname + `/dist/${map.type}.json`)
        map.data.forEach(gameList => {
            if (!gameList) return

            gameList.forEach(game => {
                ws.write(JSON.stringify(game))
                ws.write('\n')
            })
        })
        ws.end()
        console.timeEnd(`${map.type} 写入文件耗时`)
    })

    console.timeEnd('总耗时')
})

// 爬取游戏详情，向队列添加列表页面 url
function fetchGameDetail(url) {
    c.queue({
        uri: url,
        type: 'detail'
    })
}

function main() {
    fetchPage()
}

// fetchGameList(1)

main()
