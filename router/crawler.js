const express = require("express");
const router = express.Router()
const axios = require("axios");
const cheerio = require("cheerio");
const Notice = require("../schemas/notice")
const Crawler = require("../schemas/crawler")

// URLS
const CE = "https://ce.kumoh.ac.kr/ce/sub0501.do";
const CS = "https://cs.kumoh.ac.kr/cs/sub0601.do";
const AI = "https://ai.kumoh.ac.kr/ai/sub0501.do";

async function GetHTML(url)
{
    try
    {
        return await axios.get(url);
    }
    catch (e)
    {
        console.log("error: ", e)
    }
}

async function Parse(url)
{
    var prefix;
    var result = new Object();

    if (url == CE) {
        prefix = "https://ce.kumoh.ac.kr/ce/sub0501.do"
    }
    else if (url == CS) {
        prefix = "https://cs.kumoh.ac.kr/cs/sub0601.do"
    }
    else if (url == AI) {
        prefix = "https://ai.kumoh.ac.kr/ai/sub0501.do"
    }
    
    return GetHTML(url).then(html => {
        var titles = [];
        var hrefs = [];

        const $ = cheerio.load(html.data);
        const $titles = $("span.title-wrapper");
        var $links = $("td.title.left a");

        $titles.each(function(i, elem)
        {
            titles[i] = $(this).text().replace(/\t/g, '').replaceAll('\n','');
            
            if (titles[i].toString().startsWith("공지"))
            {
                titles[i] = $(this).text().replace(/\t/g, '').replaceAll('\n','').replace('공지', '');
            }
        })

        $links.each(function(i, elem)
        {
            hrefs[i] = prefix + $(elem).attr('href');
        })

        var i = 0

        let noticeIdList = []

        titles.forEach(async function(title)
        {
            result[title] = hrefs[i];
            let newNotice = new Notice({
                title: title,
                link: hrefs[i++]
            })
            await newNotice.save((e) => {
                if (e) console.log("error: ", e)
            })
            noticeIdList.push(newNotice._id)
        })
        return noticeIdList
    })
}

async function crawler_add () {
    let newCrawler = new Crawler({
        ce: await Parse(CE),
        cs: await Parse(CS),
        ai: await Parse(AI),
        num: 1
    })
    await newCrawler.save((e) => {
        if (e) console.log("error: ", e)
    })
}

async function crawler_delete () {
    await Notice.deleteMany()
    await Crawler.deleteMany()
}

router.get("/", async (req, res) => {
    try 
    {
        res.json(
            await Crawler.findOne({num: 1})
            .populate("ce")
            .populate("cs")
            .populate("ai")
        ).status(200)
    } 
    catch (e) 
    {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

module.exports = { router, crawler_add, crawler_delete }