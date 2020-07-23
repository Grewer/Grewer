require("dotenv").config();
const {WakaTimeClient, RANGE} = require("wakatime-client");
const fs = require('fs');
const Feed = require('rss-to-json');
const {
    WAKATIME_API_KEY: wakatimeApiKey
} = process.env;

const wakatime = new WakaTimeClient(wakatimeApiKey);

const root = process.cwd()

const main = async () => {
    const blogJSON = await Feed.load('http://feed.cnblogs.com/blog/u/361271/rss/')

    console.log(blogJSON.items)

    const blogStr = parseBlog(blogJSON.items.slice(0,5))

    const stats = await wakatime.getMyStats({range: RANGE.LAST_7_DAYS});

    const timeContent = getTimeContent(stats)

    let template = fs.readFileSync(`${root}/template.md`, {encoding: 'utf-8'})

    template = template.replace(/#Time#/, `\n\`\`\`text\n${timeContent.join('\n')}\n\`\`\`\n`)

    template = template.replace(/#BLOG#/, `\n${blogStr}\n`)

    fs.writeFileSync(`${root}/README.md`, template)

}

const convertTitle = (title) => {
    const index = title.lastIndexOf('-')
    return title.substr(0, index)
}


const parseBlog = (blogItem) => {
    return blogItem.reduce((prev, curr) => {
        prev += `\* <a href='${curr.id}' target='_blank'>${convertTitle(curr.title)}</a> - ${timestampToTime(curr.created)} \n`

        return prev
    }, '')
}

function timestampToTime(timestamp) {

    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000

    Y = date.getFullYear();

    M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);

    D = date.getDate();

    return `${Y}-${M}-${D}`;

}

const getTimeContent = (stats) => {

    const lines = [];
    for (let i = 0; i < Math.min(stats.data.languages.length, 5); i++) {
        const data = stats.data.languages[i];
        const {name, percent, text: time} = data;

        const line = [
            name.padEnd(11),
            time.padEnd(14),
            unicodeProgressBar(percent + 15),
            String(percent.toFixed(1)).padStart(5) + "%"
        ];

        lines.push(line.join(" "));
    }

    return lines

}


const bar_styles = [
    "▁▂▃▄▅▆▇█",
    "⣀⣄⣤⣦⣶⣷⣿",
    "⣀⣄⣆⣇⣧⣷⣿",
    "○◔◐◕⬤",
    "□◱◧▣■",
    "□◱▨▩■",
    "□◱▥▦■",
    "░▒▓█",
    "░█",
    "⬜⬛",
    "⬛⬜",
    "▱▰",
    "▭◼",
    "▯▮",
    "◯⬤",
    "⚪⚫"
];

function unicodeProgressBar(p, style = 7, min_size = 20, max_size = 20) {
    let d;
    let full;
    let m;
    let middle;
    let r;
    let rest;
    let x;
    let min_delta = Number.POSITIVE_INFINITY;
    const bar_style = bar_styles[style];
    const full_symbol = bar_style[bar_style.length - 1];
    const n = bar_style.length - 1;
    if (p === 100) return full_symbol.repeat(max_size);

    p = p / 100;
    for (let i = max_size; i >= min_size; i--) {
        x = p * i;
        full = Math.floor(x);
        rest = x - full;
        middle = Math.floor(rest * n);
        if (p !== 0 && full === 0 && middle === 0) middle = 1;
        d = Math.abs(p - (full + middle / n) / i) * 100;
        if (d < min_delta) {
            min_delta = d;
            m = bar_style[middle];
            if (full === i) m = "";
            r = full_symbol.repeat(full) + m + bar_style[0].repeat(i - full - 1);
        }
    }
    return r;
}


main()
