import React, { Fragment } from "react";
import { Footer, Nav, H2 } from "../components";
import { useTheme } from "emotion-theming";
import styled, { Theme } from "../lib/styled";
import { space, typography } from "styled-system";

export default function LegalNotice() {
  const theme = useTheme<Theme>();
  return (
    <Fragment>
      <header>
        <Nav />
      </header>
      <Main px={theme.mainPaddingX}>
        <H1 fontSize={[10]} mt={[5]}>
          Legal Notice
        </H1>
        <P>www.theshiftdataportal.org is a product of The Shift Project.</P>
        <P>The Shift Project - 16 rue de Budapest - 75009 Paris</P>
        <P>Tel : +33 1 76 21 10 20 - www.theshiftproject.org</P>
        <P>
          The Shift Project does not guarantee the accuracy of the data published on the platform, nor does it accept
          responsibility for any use made thereof. TSP team makes its best efforts to keep the data up to date. In case
          of an error in the data, please notify it to the team data-portal@theshiftproject.org.
        </P>
        <H2 mt={3}>Public domain and use of theshiftdataportal.org content</H2>
        <P>
          The Portal aggregates data that are publicly available. The Portal itself is under Creative Commons license
          (CC BY-SA 3.0).
        </P>
        <P>
          If the data come from personal communication or not-online resources, explicit agreement from the authors has
          been obtained. You may use and/or distribute any of our data providing you use an acknowledgment, which
          includes the publication date, the source of the data, and our address such as: "Source: U.S. Energy
          Information Administration, via: theshiftdataportal.org, accessed Jan. {new Date().toLocaleDateString()}.
        </P>
        <H2 mt={3}>Web hosting</H2>
        <P>
          Amazon Web Services Amazon.com Legal Department 410 Terry Avenue North P.O. Box 81226 Seattle, WA 98108-1226 -
          USA http://aws.amazon.com
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
`;
