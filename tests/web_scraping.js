const puppeteer = require("puppeteer")
const Sentiment = require("sentiment")
const natural = require('natural');
const sentiment = new Sentiment()

const SentimentData = async (prompt_score) => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(
    "https://www.nytimes.com/live/2020/08/16/us/election-trump-vs-biden?action=click&module=Top%20Stories&pgtype=Homepage"
  )
  const text = await page.$eval("*", (el) => el.innerText)
  text_list = splitTextIntoSentences(text)
  //console.log(text_list)
  await browser.close()

  var key_sentences = []

  text_list.forEach((item) => {
    eval(item).then((result) => {
        //console.log(result)
        if (result == 1) {
            //console.log(item)
            key_sentences.push(item)
            //console.log(key_sentences)
        }
    })
  })
  console.log(key_sentences)
  return key_sentences
}

const eval = async (tex, list) => {
    const result = await sentiment.analyze(tex)
    //console.log(result.score)
    return result.score
}

function splitTextIntoSentences(text) {
    const tokenizer = new natural.SentenceTokenizer();
    return tokenizer.tokenize(text);
}

SentimentData(-3).then((key_sentences) => {
    //console.log(key_sentences)
})
//eval('why trump will most likely win against biden')