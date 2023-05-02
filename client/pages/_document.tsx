import React from "react"
import Document, { Html, Head, Main, NextScript } from "next/document"
import { extractCritical } from "@emotion/server"
import { GA_TRACKING_ID } from "../lib/gtag"
import { renderToString } from "react-dom/server"

/*class MyDocument extends Document<{ html: string; ids: Array<string>; css: string }> {
  static async getInitialProps(ctx) {
    const page = ctx.renderPage();
    const styles = extractCritical(renderToString(page.html));

    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, ...page, ...styles };
  }

  render() {
    return (
      <Html>
        <Head>
          {/!* Global Site Tag (gtag.js) - Google Analytics *!/}
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}',  { 'anonymize_ip': true, 'storage': 'none' });
          `
            }}
          />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />
          <style data-emotion-css={this.props.ids.join(" ")} dangerouslySetInnerHTML={{ __html: this.props.css }} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}*/

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const originalRenderPage = ctx.renderPage

    // Run the React rendering logic synchronously
    ctx.renderPage = () =>
      originalRenderPage({
        // Useful for wrapping the whole react tree
        enhanceApp: (App) => App,
        // Useful for wrapping in a per-page basis
        enhanceComponent: (Component) => Component,
      })

    // Run the parent `getInitialProps`, it now includes the custom `renderPage`
    const initialProps = await Document.getInitialProps(ctx)

    return initialProps
  }

  render() {
    return (
      <Html>
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
          <link rel="preconnect" href="https://www.google-analytics.com"></link>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_TRACKING_ID}',  { 'anonymize_ip': true, 'storage': 'none' });
          `,
            }}
          />
          <link rel="preconnect" href="https://fonts.googleapis.com"></link>
          <link rel="preconnect" href="https://fonts.gstatic.com"></link>
          <link
            href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
            rel="stylesheet"
          ></link>

          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="600" />
          <meta name="description" content="The Shift Project's Data Portal" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
