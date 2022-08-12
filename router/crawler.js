const axios = require("axios");
const cheerio = require("cheerio");

// URLS
const CE = "https://ce.kumoh.ac.kr/ce/sub0501.do";
const CS = "https://cs.kumoh.ac.kr/cs/sub0601.do";
const AI = "https://ai.kumoh.ac.kr/ai/sub0501.do";

function callBack(dict)
{
    if (dict['학과'] == 'CE')
    {
        console.log("컴공 최고")
    }
    else if (dict['학과'] == 'CS')
    {
        console.log("컴소 최고")
    }
    else if (dict['학과'] == 'AI')
    {
        console.log("AI 최고")
    }
    console.log(dict)
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
    await Parse(CE);
    await Parse(CS);
    await Parse(AI);
}

Action()
