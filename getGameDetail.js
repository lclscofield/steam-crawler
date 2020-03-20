const { Text, Attr, Num, Url } = require('./utils')

function getData($) {
    let gameData = {}
    
    // top, 基本信息
    // appName
    gameData.appName = Text($('.apphub_HeaderStandardTop .apphub_AppName'))
    // appIcon
    gameData.appIcon = Attr($('.apphub_HeaderStandardTop .apphub_AppIcon img'), '', 'src')
    // 大图
    gameData.imgMax = Attr($('.game_background_glow .game_header_image_full'), '', 'src')
    // 描述
    gameData.desc = Text($('.game_background_glow .game_description_snippet'))
    // 简易评测
    gameData.summaryReview = {
        lately: {}, // 最近评测
        all: {} // 全部评测
    }
    $('.user_reviews .user_reviews_summary_row').each((idx, e) => {
        const review = Attr($(e), '', 'data-tooltip-html')
        const desc = Text($(e), 'game_review_summary')
        const obj = {
            review,
            desc
        }
        if (idx === 0) {
            // 最近评测
            gameData.summaryReview.lately = obj
        } else if (idx === 1) {
            // 全部评测
            gameData.summaryReview.all = obj
        }
    })
    // 发行日期
    gameData.releaseDate = Text($('.user_reviews .release_date .date'))
    // 开发商和发行商
    gameData.personData = {
        devPerson: '', // 开发商
        pubPerson: '' // 发行商
    }
    $('.user_reviews .dev_row').each((idx, e) => {
        const text = Text($(e), '.summary')
        if (idx === 0) {
            // 开发商
            gameData.personData.devPerson = text
        } else if (idx === 1) {
            // 发行商
            gameData.personData.pubPerson = text
        }
    })
    // 热门标签
    gameData.tags = []
    $('.popular_tags a.app_tag').each((idx, e) => {
        gameData.tags.push(Text($(e)))
    })
    // 视频列表
    gameData.videos = []
    $('div.highlight_movie').each((idx, e) => {
        let video = {}
        video.src = Attr($(e), '', 'data-mp4-hd-source') || Attr($(e), '', 'data-mp4-source')
        video.poster = Attr($(e), '', 'data-poster')
        if (video) {
            // 视频格式后缀转换
            // video = video.replace(/webm/, 'mp4')
            gameData.videos.push(video)
        }
    })
    // 图片列表
    gameData.imgs = []
    $('a.highlight_screenshot_link').each((idx, e) => {
        let img = Attr($(e), '', 'href')
        if (img) {
            img = img.split('url=')[1] || ''
        }
        img && gameData.imgs.push({
            imgMax: img,
            imgMin: img.replace(/1920x1080/, '600x338')
        })
    })

    return gameData
}

module.exports = getData
