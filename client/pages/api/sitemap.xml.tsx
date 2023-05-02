// import { createSitemap, EnumChangefreq } from "sitemap";
// import { NextPage } from "next";
// const Sitemap: NextPage = () => null;
// Sitemap.getInitialProps = async ({ res }) => {
//   if (!res) return {};
//   const sitemap = createSitemap({
//     hostname: "https://theshiftdataportal.org/"
//   });
//   // Add any static entries here
//   sitemap.add({ url: "/", changefreq: EnumChangefreq.DAILY });
//   sitemap.add({ url: "/about", changefreq: EnumChangefreq.DAILY });
//   sitemap.add({ url: "/energy", changefreq: EnumChangefreq.DAILY });
//   sitemap.add({ url: "/climate", changefreq: EnumChangefreq.DAILY });
//   // To add dynamic entries
//   for (const product of ["lol", "hello", "mister"]) {
//     sitemap.add({ url: `/product/${product}`, changefreq: EnumChangefreq.DAILY });
//   }
//   res.setHeader("content-type", "application/xml");
//   res.end(sitemap.toString());
//   return {};
// };
// export default Sitemap;

// Import built-in types for API routes
import { NextApiRequest, NextApiResponse } from "next"
import { SitemapStream, streamToPromise, EnumChangefreq } from "sitemap"
import { createGzip } from "zlib"

export default async (_req: NextApiRequest, res: NextApiResponse) => {
  if (!res) return {}
  try {
    // Set response header
    res.setHeader("content-type", "application/xml")
    res.setHeader("Content-Encoding", "gzip")

    // A Transform for turning a Readable stream of either SitemapItemOptions or url strings into a Sitemap.
    // The readable stream it transforms must be in object mode.
    const smStream = new SitemapStream({
      hostname: "https://theshiftdataportal.org",
    })

    const pipeline = smStream.pipe(createGzip())
    // Add any static entries here
    smStream.write({ url: "/", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/about", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/energy", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/climate", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({
      url: "/climate/carbon-footprint",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({
      url: "/climate/co2-from-energy",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({
      url: "/climate/co2-imports-exports",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({ url: "/climate/ghg", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/climate/kaya", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/energy/coal", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({
      url: "/energy/electricity",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({
      url: "/energy/energy-intensity-gdp",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({
      url: "/energy/final-energy",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({ url: "/energy/gas", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/energy/nuclear", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({ url: "/energy/oil", lastmod: process.env.siteUpdatedAt, changefreq: EnumChangefreq.DAILY })
    smStream.write({
      url: "/energy/primary-energy",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    smStream.write({
      url: "/energy/renewable-energy",
      lastmod: process.env.siteUpdatedAt,
      changefreq: EnumChangefreq.DAILY,
    })
    // // E.g. we create a sitemap.xml for articles
    // // Set articles change frequencey is weekly
    // const articles = await fetchArticles();
    // articles.map(article => {
    // 	smStream.write({
    // 		url: `/article/${article.id}/${article.slug}`,
    // 		lastmod: article.updatedAt,
    // 		changefreq: EnumChangefreq.WEEKLY,
    // 	});
    // });
    smStream.end()

    // cache the response
    // streamToPromise.then(sm => sitemap = sm)
    streamToPromise(pipeline)
    // stream the response
    pipeline.pipe(res).on("error", (e) => {
      throw e
    })
  } catch (e) {
    res.status(500).end()
  }
}
