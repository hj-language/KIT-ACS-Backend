const express = require("express");
const router = express.Router()
const axios = require("axios");
const cheerio = require("cheerio");

// URLS
const CE = "https://ce.kumoh.ac.kr/ce/sub0501.do";
const CS = "https://cs.kumoh.ac.kr/cs/sub0601.do";
const AI = "https://ai.kumoh.ac.kr/ai/sub0501.do";

async function callBack(dict)
{
    console.log(dict)
    const result = dict
    return await result
}

async function GetHTML(url)
{
    try
    {
        return await axios.get(url);
    }
    catch (error)
    {
        console.error(error);
    }
}

async function Parse(url)
{
    var department;
    var prefix;
    var result = new Object();
    var result = {};

    if (url == CE)
    {
        department = "CE";
        prefix = "https://ce.kumoh.ac.kr/ce/sub0501.do"
    }
    else if (url == CS)
    {
        department = "CS";
        prefix = "https://cs.kumoh.ac.kr/cs/sub0601.do"
    }
    else if (url == AI)
    {
        department = "AI";
        prefix = "https://ai.kumoh.ac.kr/ai/sub0501.do"
    }
    else
    {
        department = null;
    }
    
    GetHTML(url).then(html => {
        var titles = [];
        var links = [];
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

        var i = 0;

        result["학과"] = department;

        titles.forEach(function(title)
        {
            result[title] = hrefs[i++];
        })
        return result
    }).then(res => callBack(result))
}

async function Action()
{
    var data;
    data = await Parse(CE);
    data = await Parse(CS);
    data = await Parse(AI);
    console.log(data)
}

router.get("/", async (req, res) => {
    const PostCE = await Parse(CE);
    const PostCS = await Parse(CS);
    const PostAI = await Parse(AI);
    //console.log(PostCE)
    Action()
    try 
    {
        res.json({PostCE, PostCS, PostAI}).status(200)
    } 
    catch (e) 
    {
        console.log("error: ", e)
        res.status(500).send({ message: "Server Error" })
    }
})

module.exports = router