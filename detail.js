const fs = require('fs')
const readline = require('readline')
const Crawler = require('crawler')

const getGameDetail = require('./getGameDetail')

console.time('总耗时')

// 路径
const detailPath = __dirname + '/dist/detail.json'
// 详情数据
const detail = []
// 计数
let numTotal = 0 // 总的
let count = 0 // 实际

// 如果存在则删除 detail.js
if (fs.existsSync(detailPath)) {
    fs.unlinkSync(detailPath)
}
// 写入流
const ws = fs.createWriteStream(__dirname + '/dist/detail.json', { flags: 'a' })

// 爬取队列
const c = new Crawler({
    retries: 10, // 请求失败重试 10 次
    headers: {
        Cookie: 'birthtime=' + 817804801 // 写入 cookie 绕过年龄限制
    },
    // 在每个请求处理完毕后将调用此回调函数
    callback: function(err, res, done) {
        if (err) {
            console.log(err)
        } else {
            const $ = res.$
            const { gId, url } = res.options
            const game = getGameDetail($)

            if (game && game.appName) {
                game.gId = gId
                game.url = url
                // 注入 _id
                game._id = `detail-${game.gId}`

                count++
                console.log(`第 ${count} 条`)

                ws.write(JSON.stringify(game))
                ws.write('\n')
            }
        }
        done()
    }
})

// 爬取完毕回调
c.on('drain', function() {
    console.log(`总条数：${numTotal}`)
    console.log(`实际条数：${count}`)
    console.timeEnd('总耗时')
})

const rl = readline.createInterface({
    input: fs.createReadStream(__dirname + '/dist/all.json')
})

rl.on('line', line => {
    numTotal++
    if (!line) return
    const obj = JSON.parse(line)
    const url = obj.url + '?l=schinese'
    c.queue({
        uri: url,
        gId: obj.gId,
        url: url
    })
})
