require("dotenv").config();
const {WakaTimeClient, RANGE} = require("wakatime-client");
const fs = require('fs');

const {
    WAKATIME_API_KEY: wakatimeApiKey
} = process.env;

const wakatime = new WakaTimeClient(wakatimeApiKey);

const root = process.cwd()

const main = async () => {
    const stats = await wakatime.getMyStats({range: RANGE.LAST_7_DAYS});
    const timeContent = getTimeContent(stats)

    const template = fs.readFileSync(`${root}/template.md`, {encoding: 'utf-8'})

    const _template = template.replace(/#Time#/, `\n\`\`\`text\n${timeContent.join('\n')}\n\`\`\`\n`)

    fs.writeFileSync(`${root}/README.md`, _template)

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
