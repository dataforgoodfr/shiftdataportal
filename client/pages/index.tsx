import Link from "next/link";
import React, { Fragment } from "react";
import { useTheme } from "emotion-theming";
import styled, { Theme } from "../lib/styled";
import { Nav, H2, Benefit, Footer, AnimatedChart } from "../components";
import { color, typography, layout, space } from "styled-system";
import Icons, { ExternalLink, IconName } from "../components/Icons";

export default function Index() {
  const theme = useTheme<Theme>();
  // const isDev =
  //   (process.browser && document.location.href.includes("staging")) ||
  //   process.env.NODE_ENV === "development" ||
  //   (process.browser && document.location.href.includes("localhost"));
  return (
    <Fragment>
      <header>
        <Nav />
        <Hero height={["50vh", "60vh"]} lineHeight={["auto", "84px"]} ml={theme.mainPaddingX}>
          <H1 fontSize={[8, 10]} mt={[4, 5]} maxWidth={"45rem"}>
            {/* Un portail de données pour ne plus confondre <Link href="/energy" passHref>
              <H1Link color="orange"> 1 </H1Link>
            </Link> et <Link href="/climate" passHref>
              <H1Link color="blue">1000</H1Link>
            </Link> */}
            Explore World
            <Link href="/energy" passHref>
              <H1Link color="orange"> energy </H1Link>
            </Link>
            and{" "}
            <Link href="/climate" passHref>
              <H1Link color="blue"> climate</H1Link>
            </Link>{" "}
            data
          </H1>
          <Subtitle width={[0.9, 0.7]} fontSize={[4]}>
            Given today's challenges, we believe that every professional, journalist, student, citizen should have a
            simple access to critical data about the crisis we face.
            <br /> A data visualization tool made by{" "}
            <b>
              <a href="https://theshiftproject.org/" target="_blank" rel="noopener noreferrer">
                The Shift Project
              </a>
            </b>
            , the carbon transition think tank.
          </Subtitle>
          <AnimatedChart />
          <a href="#datasets">
            <DownArrow width="18" height="24" viewBox="0 0 14 20" xmlns="http://www.w3.org/2000/svg">
              <title>Scroll to dateset section</title>
              <path
                d="M13.79 13.468a.708.708 0 00-.994-1.008l-5.088 5.11V.707A.7.7 0 007.005 0a.708.708 0 00-.713.706V17.57L1.214 12.46a.718.718 0 00-1.003 0 .708.708 0 000 1.008l6.292 6.32a.689.689 0 00.993 0l6.293-6.32z"
                fill="#000"
                fillRule="nonzero"
                opacity=".8"
              />
            </DownArrow>
          </a>
        </Hero>
      </header>
      <Datasets px={theme.mainPaddingX} id="datasets">
        <H2 overTitle="DATASETS" mt={5}>
          Explore our datasets
        </H2>
        <div style={{ display: "flex", flexFlow: "row wrap", justifyContent: "space-around" }}>
          <DatasetCard px={[3, 4, 5]} mt={[3, 5]}>
            <DatasetCategory icon="Energy">Energy</DatasetCategory>
            <DatasetList>
              <DatasetLink
                id="/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&dimension=total&end=2016&start=1900&multi=true&type=Production"
                icon="EnergyProduction"
              >
                Primary Energy Production
              </DatasetLink>
              <DatasetLink
                id="/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&dimension=total&end=2016&start=1980&multi=true&type=Consumption"
                icon="Energy"
              >
                Primary Energy Consumption
              </DatasetLink>
              <DatasetLink
                icon="EnergyConsumption"
                id="/energy/final-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Biofuels%20and%20waste&energy-families=Heat&energy-families=Geothermal&energy-families=Others&energy-families=Crude%20oil&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&dimension=byEnergyFamily&end=2016&start=1971&multi=false"
              >
                Final Energy
              </DatasetLink>
              <DatasetLink
                icon="Electricity"
                id="/energy/electricity?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydro&energy-families=Wind&energy-families=Biomass&energy-families=Waste&energy-families=Solar%20PV&energy-families=Geothermal&energy-families=Solar%20Thermal&energy-families=Tide&energy-unit=Mtoe&group-names=World&is-range=true&dimension=byEnergyFamily&end=2016&start=1990&multi=false"
              >
                Electricity
              </DatasetLink>
              <Fragment>
                <DatasetLink
                  icon="EnergyConsumption"
                  id="/energy/energy-intensity-gdp?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=toe&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&energy-type=Total%20Primary%20Oil%20Consumption&dimension=total&end=2016&start=1960&multi=true"
                >
                  Energy Intensity of GDP
                </DatasetLink>
                <DatasetLink
                  icon="Fire"
                  id="/energy/gas?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&sectors=Agriculture&sectors=Commercial%20and%20public%20services&sectors=Industry&sectors=Other&sectors=Residential&dimension=total&end=2016&start=1980&multi=true&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports"
                >
                  Gas
                </DatasetLink>
              </Fragment>
            </DatasetList>
            <Link href="/energy" passHref>
              <DatasetsCTA my={4}>See more</DatasetsCTA>
            </Link>
          </DatasetCard>
          <DatasetCard px={[3, 4, 5]} mt={[3, 5]}>
            <DatasetCategory icon="Climate">Climate</DatasetCategory>
            <DatasetList>
              <DatasetLink
                icon="Gas"
                id="/climate/ghg?chart-type=line&chart-types=line&chart-types=ranking&emissions-unit=MtCO2eq&group-names=World&is-range=true&source=PIK&sectors=Energy&sectors=Agriculture&sectors=Industry%20and%20Construction&sectors=Waste&sectors=Other%20Sectors&dimension=total&end=2016&start=1850&multi=true"
              >
                Greenhouse Gas Emissions
              </DatasetLink>
              <DatasetLink
                icon="CO2"
                id="/climate/co2-from-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&emissions-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=total&end=2016&start=1850&multi=true"
              >
                CO<sub>2</sub> from Fossil Fuels
              </DatasetLink>
              <DatasetLink
                icon="Footprint"
                id="/climate/carbon-footprint?chart-type=line&chart-types=line&chart-types=ranking&emissions-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=total&end=2017&start=1990&scopes=Carbon%20Footprint"
              >
                CO<sub>2</sub> Footprint
              </DatasetLink>
              <DatasetLink
                icon="EnergyProduction"
                id="/climate/kaya?chart-type=line&chart-types=line&group-names=World&is-range=true&dimension=total&end=2015&start=1980"
              >
                KAYA Identity
              </DatasetLink>
            </DatasetList>
            <Link href="/climate" passHref>
              <DatasetsCTA my={4}>See more</DatasetsCTA>
            </Link>
          </DatasetCard>
        </div>
      </Datasets>
      <Benefits px={theme.mainPaddingX}>
        <H2
          overTitle="FEATURES"
          subTitle="We collected and prepared data from international and reliable sources so you can:"
        >
          How does it work?
        </H2>
        <div style={{ display: "flex", flexFlow: "row wrap", justifyContent: "space-around", position: "relative" }}>
          {benefits.map(({ color, body, icon, title }, i) => (
            <Benefit key={i} index={i} title={title} color={color} icon={icon}>
              {body}
            </Benefit>
          ))}
        </div>
      </Benefits>
      <Purpose>
        <aside>PURPOSE</aside>
        <h2>What is The Shift Project?</h2>
        <p>
          The Shift Project is a French think tank advocating the shift to a post-carbon economy. As a non-profit
          organization committed to serving the general interest through scientific objectivity, we are dedicated to
          informing and influencing the debate on energy transition in Europe.
        </p>
        <p>
          We created The Shift Dataportal because while doing projects we always found ourselves looking for the same
          data but we couldn’t remember the source nor where to search. This is why we decided to centralize those
          datasets into a single database. The Shift Dataportal was born.
        </p>
        <a href="https://theshiftproject.org" target="_blank" rel="noopener noreferrer">
          Go to The Shift Project’s website
          <ExternalLink color={theme.colors.lightBlack} />
        </a>
      </Purpose>
      <Footer mt={0} />
    </Fragment>
  );
}
const Datasets = styled.section`
  ${space};
`;
const Benefits = styled.section`
  ${space};
`;
const Purpose = styled.section`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  margin-top: ${p => p.theme.space[6]}px;
  padding: ${p => p.theme.space[6]}px 0;
  background-color: ${p => p.theme.colors.blue}19;
  aside {
    font-weight: 700;
    font-size: ${p => p.theme.fontSizes[2]};
    color: ${p => p.theme.colors.blue};
    letter-spacing: 0.3px;
    text-align: center;
  }
  h2 {
    font-weight: bold;
    font-size: ${p => p.theme.fontSizes[9]};
    color: ${p => p.theme.colors.lightBlack};
    letter-spacing: 0.89px;
    line-height: 52px;
    text-align: center;
  }
  p {
    padding-top: ${p => p.theme.space[3]}px;
    max-width: 32rem;
    margin: auto;
    font-family: ${p => p.theme.fonts.primary};
    color: ${p => p.theme.colors.grey};
    letter-spacing: 0.4px;
    line-height: 25.6px;
  }

  & > a {
    font-weight: 700;
    color: ${p => p.theme.colors.lightBlack};
    border: 2px solid ${p => p.theme.colors.lightBlack};
    border-radius: 5px;
    padding: 5px 10px;
    margin: auto;
    margin-top: ${p => p.theme.space[5]}px;
    svg {
      width: 17px;
      margin-left: 0.5rem;
    }
  }
`;

const Hero = styled.div`
  ${space};
  ${layout};
  position: relative;
  padding-bottom: 1rem;
`;
const H1 = styled.h1`
  ${typography};
  ${layout};
  ${space};
  font-family: ${p => p.theme.fonts.primary};
  font-weight: 700;
  color: ${p => p.theme.colors.lightBlack};
`;

const H1Link = styled.a`
  ${color}
`;

const Subtitle = styled.blockquote`
  ${typography};
  margin-top: 1rem;
  max-width: 50rem;
  color: ${p => p.theme.colors.lightBlack};
  letter-spacing: 0.76px;
  line-height: 28px;
  & > b {
    font-weight: 700;
  }
  ${layout}
`;

const DownArrow = styled.svg`
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%);
`;
const DatasetList = styled.ul`
  list-style-type: none;
`;

const DatasetCard = styled.div`
  ${space};
  background-color: white;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-flow: column;
  align-items: center;
`;

type IDatasetCategory = {
  children: any;
  icon: IconName;
};
const DatasetCategory: React.FunctionComponent<IDatasetCategory> = ({ children, icon }) => {
  const theme = useTheme<Theme>();
  let Icon;
  switch (icon) {
    case "Climate":
      Icon = Icons.Climate({ color: theme.colors.blue });
      break;
    case "Energy":
      Icon = Icons.Energy({ color: theme.colors.orange });
      break;
    default:
      Icon = Icons.Energy({ color: theme.colors.orange });
  }
  return (
    <div
      style={{
        display: "flex",
        flexFlow: "row nowrap",
        margin: "2rem",
        justifyContent: "center"
      }}
    >
      <div style={{ width: "33px" }}>{Icon}</div>
      <h3
        style={{
          fontWeight: 700,
          fontSize: theme.fontSizes[7],
          color: theme.colors.grey,
          marginTop: 0,
          marginLeft: ".5rem"
        }}
      >
        {children}
      </h3>
    </div>
  );
};
type IDatasetLink = {
  id: string;
  children: any;
  icon: IconName;
};
const DatasetLink: React.FunctionComponent<IDatasetLink> = ({ id, children, icon }) => {
  const theme = useTheme<Theme>();
  let Icon;
  switch (icon) {
    case "EnergyProduction":
      Icon = Icons.EnergyProduction({ color: theme.colors.grey });
      break;
    case "EnergyConsumption":
      Icon = Icons.EnergyConsumption({ color: theme.colors.grey });
      break;
    case "Energy":
      Icon = Icons.Energy({ color: theme.colors.grey });
      break;
    case "Electricity":
      Icon = Icons.Electricity({ color: theme.colors.grey });
      break;
    case "FossilFuels":
      Icon = Icons.FossilFuels({ color: theme.colors.grey });
      break;
    case "Gas":
      Icon = Icons.Gas({ color: theme.colors.grey });
      break;
    case "CO2":
      Icon = Icons.CO2({ color: theme.colors.grey });
      break;
    case "Footprint":
      Icon = Icons.Footprint({ color: theme.colors.grey });
      break;
    case "Fire":
      Icon = Icons.Fire({ color: theme.colors.grey });
      break;
    default:
      console.warn(`Dimension Icon : ${icon} not found, fallbacking to the line chart icon`);
      Icon = Icons.EnergyProduction({ color: theme.colors.lightBlack });
  }
  return (
    <DatasetLinkContainer mt={3}>
      <Link href={`${id}`} passHref>
        <DatasetLinkA px={4} py={3} fontSize={3}>
          <div style={{ width: "24px" }}>{Icon}</div>
          <div style={{ marginLeft: ".8rem" }}>{children}</div>
        </DatasetLinkA>
      </Link>
    </DatasetLinkContainer>
  );
};
const DatasetLinkContainer = styled.li`
  ${space};
  font-weight: 500;
  color: ${p => p.theme.colors.grey};
  position: relative;
  &:last-child {
    margin-bottom: 2rem;
  }
  &:first-of-type {
    margin-top: 0;
  }
`;
const DatasetLinkA = styled.a`
  ${typography};
  ${space};

  cursor: pointer;
  display: inline-flex;
  flex-flow: row nowrap;
  align-items: center;
  transition: all 0.3s ease-out;
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e7eaf4;
  svg {
    path {
      transition: all 0.3s ease-out;
    }
  }
  &:hover {
    color: white;
    background-color: ${p => p.theme.colors.darkBlue};
    svg {
      path {
        fill: white;
      }
    }
  }
`;
const DatasetsCTA = styled.a`
  ${space};
  font-weight: 700;
  font-size: ${p => p.theme.fontSizes[5]};
  color: ${p => p.theme.colors.orange};
  cursor: pointer;
  transition: all 0.3s ease-out;
  margin-top: auto;
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  border-radius: 2px;
  &:hover {
    background-color: ${p => p.theme.colors.orange};
    color: white;
    box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.05);
  }
`;

const benefits: {
  icon: "Share" | "Table" | "Gear" | "MagnifyingGlass";
  color: string;
  title: string;
  body: string;
}[] = [
  {
    icon: "MagnifyingGlass",
    color: "orange",
    title: "Discover",
    body:
      "Discover a wide range of energy and climate statistics.  Multidimensional data gathered from multiple referenced sources to cover the largest geographical and historical span available."
  },
  {
    icon: "Gear",
    color: "blue",
    title: "Customize chart",
    body:
      "Compare countries, continents, organizations. Change chart types, energy sources, units or other indicators. Create customized graphics to illustrate or verify an argument."
  },
  {
    icon: "Table",
    color: "green",
    title: "Export raw data",
    body: "Export personalized datasets at any point as Excel spreadsheets for further analysis."
  },
  {
    icon: "Share",
    color: "lightBlack",
    title: "Share",
    body:
      "Share customized graphics as dynamic graphs and image files– those can in turn be embedded in other websites, blogs and be shared through social media."
  }
];
