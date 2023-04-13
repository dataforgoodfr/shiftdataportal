import React from "react";
import Link from "next/link";
import styled from "../lib/styled";
import css from "@emotion/css";
import { typography, layout, space } from "styled-system";
import { Icons } from ".";
import logo from "../public/static/logo_tsp.svg";

const CTA = ({ children }) => (
  <Section mt={[5]}>
    <SectionTitle mt={[2]} fontSize={[9]}>
      See also
    </SectionTitle>
    <Container>{children}</Container>
  </Section>
);

CTA.Energy = () => (
  <Link href="/energy" passHref>
    <EnergyLink>
      <LogoContainer mx={[4]}>
        <Logo primary>
          <Icons.EnergyProduction color="white" />
        </Logo>
      </LogoContainer>
      <TextContainer mr={[4]}>
        <Title fontSize={[6]}>Energy Datasets</Title>
        <Description fontSize={[3]}>Explore and customize energy datasets.</Description>
      </TextContainer>
    </EnergyLink>
  </Link>
);

CTA.Climate = () => (
  <Link href="/climate" passHref>
    <ClimateLink>
      <LogoContainer mx={[4]}>
        <Logo>
          <Icons.CO2 color="white" />
        </Logo>
      </LogoContainer>
      <TextContainer mr={[4]}>
        <Title fontSize={[6]}>Climate Datasets</Title>
        <Description fontSize={[3]}>Explore and customize climate datasets.</Description>
      </TextContainer>
    </ClimateLink>
  </Link>
);
CTA.Shift = () => (
  <ShiftLink href="https://theshiftproject.org/" target="_blank" rel="noopener noreferrer">
    <LogoContainer mx={[4]}>
      <LogoShift>
        <img src={logo} alt="The Shift Projects logo." />
      </LogoShift>
    </LogoContainer>
    <TextContainer mr={[4]}>
      <Title fontSize={[6]}>The Shift Project</Title>
      <Description fontSize={[3]}>Visit The Shift Project’s website.</Description>
    </TextContainer>
  </ShiftLink>
);
const Section = styled.section`
  margin: auto;
  ${space};
  max-width: 50rem;
  position: relative;
  &::before {
    content: "";
    display: block;
    width: 100%;
    height: 1px;
    background-color: ${p => p.theme.colors.lightGrey};
  }
`;
const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  margin-top: 1rem;
  max-width: 50rem;
  justify-content: space-between;
`;
const SectionTitle = styled.h2`
  ${typography};
  ${space};
  font-weight: 700;
  color: #484848;
  letter-spacing: 1.14px;
  line-height: 52px;
`;
const cardStyle = p => css`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid ${p.theme.colors.lightGrey};
  background-color: white;
  min-height: 10rem;
  max-width: 24rem;
  transition: box-shadow 0.2s ease-out;
  &:hover {
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.3);
  }
`;

const EnergyLink = styled.a`
  ${cardStyle};
  ${layout};
  ${space};
`;
const ClimateLink = styled.a`
  ${cardStyle};
  ${layout};
  ${space};
`;
const ShiftLink = styled.a`
  ${cardStyle};
  ${layout};
  ${space};
`;
const LogoContainer = styled.div`
  ${space};
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const TextContainer = styled.div`
  ${space};
  flex-grow: 2;
`;

const Title = styled.h4`
  ${typography};
  font-weight: 700;
  color: ${p => p.theme.colors.lightBlack};
  letter-spacing: 0.35px;
`;
const Description = styled.p`
  ${typography};
  color: ${p => p.theme.colors.lightBlack};
  letter-spacing: 0.54px;
`;

type ILogo = {
  primary?: boolean;
};
const Logo = styled.div<ILogo>`
  background: ${p => (p.primary ? p.theme.colors.orange : p.theme.colors.blue)};
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  width: 5rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  & > svg {
    height: 60%;
  }
`;
const LogoShift = styled.div`
  ${space};
  background: white;
  /* box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1); */
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7eaf4;
  width: 5rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  & > img {
    width: 60%;
  }
`;
export default CTA;
