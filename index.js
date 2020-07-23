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

    const blogStr = parseBlog(blogJSON.items)

    const stats = await wakatime.getMyStats({range: RANGE.LAST_7_DAYS});

    const timeContent = getTimeContent(stats)

    let template = fs.readFileSync(`${root}/template.md`, {encoding: 'utf-8'})

    template = template.replace(/#Time#/, `\n\`\`\`text\n${timeContent.join('\n')}\n\`\`\`\n`)

    template = template.replace(/#BLOG#/, blogStr)

    fs.writeFileSync(`${root}/README.md`, template)

}

const convertTitle = (title) => {
    const index = title.lastIndexOf('-')
    return title.substr(0, index)
}


const parseBlog = (blogItem) => {
    return blogItem.reduce((prev, curr) => {
        prev += `* <a href='${curr.id}' target='_blank'>${convertTitle(curr.title)}</a> - ${timestampToTime(curr.created)} \n`

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
            generateBarChart(percent, 21),
            String(percent.toFixed(1)).padStart(5) + "%"
        ];

        lines.push(line.join(" "));
    }

    return lines

}


function generateBarChart(percent, size) {
    const syms = "░▏▎▍▌▋▊▉█";

    const frac = Math.floor((size * 8 * percent) / 100);
    const barsFull = Math.floor(frac / 8);
    if (barsFull >= size) {
        return syms.substring(8, 9).repeat(size);
    }
    const semi = frac % 8;

    return [syms.substring(8, 9).repeat(barsFull), syms.substring(semi, semi + 1)]
        .join("")
        .padEnd(size, syms.substring(0, 1));
}


main()
