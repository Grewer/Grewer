require("dotenv").config();
const fs = require('fs');
const Feed = require('rss-to-json');

const root = process.cwd()

const main = async () => {
    try {

        let template = fs.readFileSync(`${root}/template.md`, {encoding: 'utf-8'})

        const blogJSON = await Feed.load('http://feed.cnblogs.com/blog/u/361271/rss/')

        console.log(blogJSON.items.slice(0, 5))

        const blogStr = parseBlog(blogJSON.items.slice(0, 5))

        template = template.replace(/#BLOG#/, `\n${blogStr}\n`)

        fs.writeFileSync(`${root}/README.md`, template)

    } catch (e) {
        console.log('error', e)
    }

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

main()
