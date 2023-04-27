
import { Global, css } from "@emotion/react";
import { ThemeProvider } from "@emotion/react";
import { AppProps } from "next/app";
import Router from "next/router";
import Head from "next/head";
import React from "react";
import theme from "../lib/theme";
import * as gtag from "../lib/gtag";
import { useApollo } from "../lib/apolloClient";
import { ApolloProvider } from "@apollo/client";
export interface IProps extends AppProps {}
Router.events.on("routeChangeComplete", (url) => gtag.pageview(url));
export default function App({ pageProps, Component }: IProps) {
  const apolloClient = useApollo(pageProps.initialApolloState);

  return (
    <ThemeProvider theme={theme}>

        {globalStyles}
        <ApolloProvider client={apolloClient}>
          <Head>
            <link href="https://fonts.gstatic.com/" rel="preconnect" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.google-analytics.com"></link>
            <link
              href="https://fonts.googleapis.com/css?family=IBM+Plex+Mono|IBM+Plex+Sans:400,700&display=swap"
              rel="stylesheet"
            ></link>

            <meta name="description" content="The Shift Project's Data Portal" />
            <title>The Shift Data Portal</title>
          </Head>
          <Component {...pageProps} />
        </ApolloProvider>
    </ThemeProvider>
  );
}

const globalStyles = (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }
      html,
      body,
      div,
      span,
      applet,
      object,
      iframe,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      blockquote,
      pre,
      a,
      abbr,
      acronym,
      address,
      big,
      cite,
      code,
      del,
      dfn,
      em,
      img,
      ins,
      kbd,
      q,
      s,
      samp,
      small,
      strike,
      strong,
      sup,
      tt,
      var,
      b,
      u,
      i,
      center,
      dl,
      dt,
      dd,
      ol,
      ul,
      li,
      fieldset,
      form,
      label,
      legend,
      table,
      caption,
      tbody,
      tfoot,
      thead,
      tr,
      th,
      td,
      article,
      aside,
      canvas,
      details,
      embed,
      figure,
      figcaption,
      footer,
      header,
      hgroup,
      menu,
      nav,
      output,
      ruby,
      section,
      summary,
      time,
      mark,
      audio,
      video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
      }
      /* HTML5 display-role reset for older browsers */
      article,
      aside,
      details,
      figcaption,
      figure,
      footer,
      header,
      hgroup,
      menu,
      nav,
      section {
        display: block;
      }
      body {
        line-height: 1;
      }
      strong {
        font-weight: 700;
      }
      ol,
      ul {
        list-style: none;
      }
      blockquote,
      q {
        quotes: none;
      }
      blockquote:before,
      blockquote:after,
      q:before,
      q:after {
        content: "";
        content: none;
      }
      table {
        border-collapse: collapse;
        border-spacing: 0;
      }
      html {
        scroll-behavior: smooth;
      }
      body {
        background-color: #f8f8f8;
        font-family: ${theme.fonts.primary};
        line-height: 1.5;
      }
      a {
        text-decoration: none;
        color: inherit;
      }
      h3 {
        font-weight: 700;
        margin-top: ${theme.space[4]}px;
        font-size: ${theme.fontSizes[6]};
        color: ${theme.colors.grey};
      }
      h4.markdown {
        font-weight: 700;
        color: ${theme.colors.grey};
        margin-top: ${theme.space[3]}px;
        &::before {
          content: " - ";
        }
      }
      ul.markdown {
        list-style: disc;
      }
      a.markdown {
        color: ${theme.colors.blue};
        text-decoration: underline;
        &:hover {
          opacity: 0.7;
        }
      }
      p {
        margin-top: ${theme.space[2]}px;
      }
      .input-range {
        font-family: ${theme.fonts.secondary};
      }
      .input-range__slider {
        appearance: none;
        background: ${theme.colors.darkBlue};
        border: 1px solid ${theme.colors.darkBlue};

        border-radius: 100%;
        cursor: pointer;
        display: block;
        height: 1rem;
        margin-left: -0.5rem;
        margin-top: -0.65rem;
        outline: none;
        position: absolute;
        top: 50%;
        transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
        width: 1rem;
      }
      .input-range__slider:active {
        transform: scale(1.3);
      }
      .input-range__slider:focus {
        box-shadow: 0 0 0 5px rgba(63, 81, 181, 0.2);
      }
      .input-range--disabled .input-range__slider {
        background: #cccccc;
        border: 1px solid #cccccc;
        box-shadow: none;
        transform: none;
      }

      .input-range__slider-container {
        transition: left 0.3s ease-out;
      }

      .input-range__label {
        color: ${theme.colors.darkBlue};
        font-size: 0.8rem;
        transform: translateZ(0);
        white-space: nowrap;
      }

      .input-range__label--min,
      .input-range__label--max {
        bottom: -1.4rem;
        position: absolute;
      }

      .input-range__label--min {
        left: 0;
      }

      .input-range__label--max {
        right: 0;
      }

      .input-range__label--value {
        font-family: ${theme.fonts.primary};
        font-weight: 700;
        position: absolute;
        top: -1.8rem;
      }
      .input-range__label-container {
        left: -50%;
        position: relative;
      }
      .input-range__label--max .input-range__label-container {
        left: 50%;
      }

      .input-range__track {
        background: #eeeeee;
        border-radius: 0.3rem;
        cursor: pointer;
        display: block;
        height: 0.3rem;
        position: relative;
        transition: left 0.3s ease-out, width 0.3s ease-out;
      }
      .input-range--disabled .input-range__track {
        background: #eeeeee;
      }

      .input-range__track--background {
        left: 0;
        margin-top: -0.15rem;
        position: absolute;
        right: 0;
        top: 50%;
      }

      .input-range__track--active {
        background: ${theme.colors.darkBlue};
      }

      .input-range {
        height: 1rem;
        position: relative;
        width: 100%;
      }
    `}
  />
);
