import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { extractCritical } from "emotion-server";
import { GA_TRACKING_ID } from "../lib/gtag";
import ogImageSrc from "../public/static/og-image.png";

class MyDocument extends Document<{ html: string; ids: Array<string>; css: string }> {
  static async getInitialProps(ctx) {
    const page = ctx.renderPage();
    const styles = extractCritical(page.html);
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, ...page, ...styles };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Global Site Tag (gtag.js) - Google Analytics */}
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
          <meta property="og:image" content={ogImageSrc} />
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
}

export default MyDocument;
