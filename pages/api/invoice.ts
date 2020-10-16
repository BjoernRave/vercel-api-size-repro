import chromium from 'chrome-aws-lambda'
import { parse } from 'url'

export const generatePDF = async ({ url }) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  })

  const page = await browser.newPage()
  await page.setViewport({
    width: 1500,
    height: 2121,
    deviceScaleFactor: 2,
  })

  await page.goto(url, { waitUntil: 'networkidle2' })

  const pdf = await page.pdf({
    printBackground: true,
    height: 1216,
    width: 860,
  })

  await browser.close()
  return pdf
}

export default async function (req, res) {
  const parsed = parse(req.url, true)

  if (!parsed.query.url) {
    return res.status(500).end('Please provide required infos')
  }

  try {
    const pdf = await generatePDF({
      url: parsed.query.url,
    })

    res.end(pdf)
  } catch (error) {
    console.log('invoice api error', error)

    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end()
  }
}
