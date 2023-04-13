import React, { Fragment } from "react";
import { Footer, Nav, H2, LinkedInLogo } from "../components";
import { useTheme } from "emotion-theming";
import styled, { Theme } from "../lib/styled";
import { space, typography } from "styled-system";

export default function About() {
  const theme = useTheme<Theme>();
  return (
    <Fragment>
      <header>
        <Nav />
      </header>
      <Main px={theme.mainPaddingX}>
        <H1 fontSize={[10]} mt={[5]}>
          About the dataportal.
        </H1>
        <P>
          The Shift Dataportal is an information platform that provides immediate and free access to a wide range of
          global energy and climate statistics, using enhanced navigation and graphic tools.
        </P>
        <P>
          It works as a “one-stop-shop”. Nowhere else will users find climate and energy data which covers a wide
          geographical and historical span, comes from trusted sources, is easy to navigate and visualize, and can be
          exported for further use!
        </P>
        <H2 mt={4}>The Shift Dataportal – Story</H2>
        <P>
          We created The Shift Dataportal because while doing projects we always found ourselves looking for the same
          data but we couldn’t remember the source nor where to search. This is why we decided to centralize those
          datasets into a single database. The Shift Dataportal was born.
        </P>
        <H2 mt={3}>The Shift Project – About our think tank</H2>
        <P>
          We are a Paris-based think tank advocating the shift to a post-carbon economy. As a non-profit organization
          committed to serving the general interest through scientific objectivity, we are dedicated to informing and
          influencing the debate on energy transition in Europe.
        </P>
        <P>
          Usually, by “informing” we mean that we establish working groups in order to produce quantified statements and
          recommendations on key aspects of the transition, and by “influencing” we mean that we try to make these
          reports known.
        </P>
        <P>
          However, through this Dataportal, our “informing” mission takes a more literal shape: we make information
          available and hope it will “influence” your work in a useful way.
        </P>
        <H2 mt={3}>Credits</H2>
        <P>
          Main contributors:
          <br />
          <strong>Project Manager:</strong> Zeynep Kahraman-Clause
          <LinkedInLink href="https://www.linkedin.com/in/zeynepkahraman/" target="_blank" rel="noopener noreferrer">
            <LinkedInLogo />
          </LinkedInLink>
          <br />
          <strong>Data:</strong> Paul Boosz
          <LinkedInLink
            href="https://www.linkedin.com/in/paul-boosz-07055680/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <LinkedInLogo />
          </LinkedInLink>
          <br />
          <strong>Front-end, Back-end and Design:</strong> Ulysse Tallepied
          <LinkedInLink href="https://www.linkedin.com/in/ulysse-tallepied/" target="_blank" rel="noopener noreferrer">
            <LinkedInLogo />
          </LinkedInLink>
          <br />
        </P>
        <P>
          Thanks to:
          <br />
          <strong>Design:</strong> Thomas Clause
          <br />
          <strong>Wording:</strong> Jean-Noël Geist
          <br />
          <strong>Others:</strong> Shifters
        </P>
        <H2 mt={3}>Creating & Sharing Information</H2>
        <P>
          You can create a customized graphic that meet your needs with the data available on the portal, which can be
          exported as images, Excel spreadsheets and dynamic graphs – those can in turn be embedded in other websites or
          blogs.
        </P>
        <P>
          theshiftdataportal.org collects only public and therefore free data. The content accessible in the data portal
          is meant to evolve and become enriched over time. As contributors suggest new data sources and new datasets,
          The Shift Project team implements their ideas, checking data consistency and quality and eventually making new
          datasets available for all users. Anyone can become the author of a new dataset and help
          theshiftdataportal.org become a reference data source for energy and climate issues.
        </P>
      </Main>
      <Footer />
    </Fragment>
  );
}

const Main = styled.main`
  ${space};
`;
const H1 = styled.h1`
  ${typography};
  ${space};
  font-weight: 700;
  color: ${(p) => p.theme.colors.lightBlack};
  letter-spacing: 1.09px;
  line-height: 52px;
`;

const P = styled.p`
  color: ${(p) => p.theme.colors.lightBlack};
  margin-top: 1rem;
  position: relative;
`;

const LinkedInLink = styled.a`
  color: ${(p) => p.theme.colors.darkBlue};
  text-decoration: underline;
  svg {
    margin-left: 0.5rem;
    width: 1rem;
    bottom: 0;
  }
`;
