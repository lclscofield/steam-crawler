// 解析各种数据的工具函数

function Text($, rule) {
    if (rule) {
        return $.find(rule)
            .text()
            .trim()
    }
    return $.text().trim()
}

function Attr($, rule, attr) {
    if (rule) {
        return $.find(rule).attr(attr)
    }
    return $.attr(attr)
}

function Num($, rule) {
    return Number(Text($, rule).replace(/[^\d]/g, ''))
}

function Url($, rule, attr) {
    return Attr($, rule, attr).replace(/\?.*$/, '')
}

function findSys($, typeList) {
    const list = []
    typeList.forEach(type => {
        if (Attr($, `.${type}`, 'class')) {
            list.push(type)
        }
    })
    return list
}

module.exports = {
    Text,
    Attr,
    Num,
    Url,
    findSys
}
