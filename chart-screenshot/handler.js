const chromium = require("chrome-aws-lambda");
const middy = require("middy");
const { cors, httpErrorHandler } = require("middy/middlewares");

const screenshot = async (event) => {
  return new Promise(async (resolve, reject) => {
    let result = null;
    let browser = null;
    try {
      // Throw error when trying to access the image from a browser window.
      if (event.path === "/favicon.ico")
        throw new Error("Request favicon/.ico is not supported");
      // Default chrome-aws-lambda settings
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      // Spread all the parameters in a single object.
      const params = {
        ...event.queryStringParameters,
        ...event.multiValueQueryStringParameters,
      };
      // Remaps the url params from the event object because it doesn't contain the full request URL
      // Re-decodes some params to avoid special characters double encoding leading to errors.
      const paramsUrlEncoded = Object.keys(params)
        .map(
          (k) =>
            `${encodeURIComponent(decodeURIComponent(k))}=${encodeURIComponent(
              decodeURIComponent(params[k])
            )}`
        )
        .join("&");
      await page.goto(
        `${process.env.CLIENT_URI}${event.path}?${paramsUrlEncoded}`,
        { waitUntil: "networkidle0" }
      );
      result = await screenshotDOMElement(".screenshot", page);
    } catch (error) {
      return reject(error);
    } finally {
      if (browser !== null) {
        await browser.close();
      }
    }
    return resolve({
      statusCode: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="screenshot.png"`,
      },
      body: result,
      isBase64Encoded: true,
    });
  });
};
// Export and enable CORS
module.exports.screenshot = middy(screenshot)
  .use(httpErrorHandler())
  .use(cors()); // Adds CORS headers to responses

async function screenshotDOMElement(selector, page, padding = 0) {
  const rect = await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element)
      throw new Error("No element found with the '.screenshot' class.");
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  }, selector);

  const base64screenshot = await page.screenshot({
    encoding: "base64",
    type: "png",
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    },
  });
  return base64screenshot.replace(/data:image\/png;base64,/, "");
}
