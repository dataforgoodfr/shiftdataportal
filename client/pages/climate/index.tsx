import React, { Fragment, useEffect, useState } from "react";
import { Nav, DatasetCategory, DimensionButton, SubCategoryTitle, Footer, CTA } from "../../components";
import { useTheme } from "@emotion/react";
import { IconName } from "../../components/Icons";
import {
  Main,
  H1,
  Subtitle,
  AnchorLi,
  Datasets,
  Column,
  Dataset,
  Dimensions,
  IDimension,
  AnchorUl,
  AnchorA,
  AnchorIcon,
} from "../energy";
import { Theme } from "../../lib/styled";
import { iconNameToIconComponent } from "../../components/DatasetCategory";

export default function Climate() {
  const theme = useTheme();
  const [columnsData, setColumnsData] = useState<IDataset[][]>([]);
  const [selectedAnchor, setSelectedAnchor] = useState<string>();
  useEffect(() => {
    const filteredDatasets = datasets.filter((set) => {
      const isDev =
        (process.browser && document.location.href.includes("staging")) ||
        process.env.NODE_ENV === "development" ||
        (process.browser && document.location.href.includes("localhost"));
      if (!isDev && set.prod) {
        return true;
      } else if (!isDev && !set.prod) {
        return false;
      } else {
        return true;
      }
    });

    const columnsData = [[], []];
    filteredDatasets.forEach((dataset, index) => {
      switch (index % 2) {
        case 0:
          columnsData[0].push(dataset);
          break;
        case 1:
          columnsData[1].push(dataset);
          break;
      }
    });
    setColumnsData(columnsData);
  }, []);
  return (
    <Fragment>
      <Nav />
      <Main px={theme.mainPaddingX}>
        <H1 fontSize={[10]} mt={[5]}>
          <span>Climate</span> Datasets
        </H1>
        <Subtitle mt={[3]} width={[1, 1, 0.5]}></Subtitle>
        <AnchorUl>
          {datasets.map((dataset, index) => (
            <AnchorLi key={index}>
              <AnchorA
                p={[2]}
                m={1}
                href={"#" + dataset.category}
                onClick={() => {
                  setSelectedAnchor(dataset.category);
                }}
              >
                <AnchorIcon>{iconNameToIconComponent(dataset.categoryIcon, "white")}</AnchorIcon>
                <div style={{ marginLeft: ".4rem" }} dangerouslySetInnerHTML={{ __html: dataset.category }}></div>
              </AnchorA>
            </AnchorLi>
          ))}
        </AnchorUl>
        <Datasets>
          {columnsData.map((columData, i) => (
            <Column key={i} maxWidth={["100%", "100%", "100%", "49%"]}>
              {columData.map((dataset, j) => (
                <Dataset
                  key={j}
                  mt={[3, 5]}
                  px={[3, 3, 3, 4]}
                  pt={[3, 3, 3, 4]}
                  pb={[4]}
                  id={dataset.category}
                  highlighted={selectedAnchor === dataset.category}
                >
                  {dataset.category && (
                    <DatasetCategory
                      icon={dataset.categoryIcon}
                      color={theme.colors.blue}
                      tooltip={dataset.categoryTooltip}
                      index={j}
                    >
                      {dataset.category}
                    </DatasetCategory>
                  )}
                  {dataset.dimensions && (
                    <Dimensions mt={[3]}>
                      {dataset.dimensions.map((dimension, index) => (
                        <DimensionButton
                          key={index}
                          href={dimension.link}
                          icon={dimension.icon}
                          active={dimension.active}
                        >
                          {dimension.title}
                        </DimensionButton>
                      ))}
                    </Dimensions>
                  )}
                  {dataset.subDatasets &&
                    dataset.subDatasets.map((subDataset, k) => (
                      <Fragment key={k}>
                        <SubCategoryTitle tooltip={subDataset.titleTooltip}>{subDataset.title}</SubCategoryTitle>
                        <Dimensions mt={[1]}>
                          {subDataset.dimensions.map((dimension, l) => (
                            <DimensionButton
                              key={l}
                              href={dimension.link}
                              icon={dimension.icon}
                              active={dimension.active}
                            >
                              {dimension.title}
                            </DimensionButton>
                          ))}
                        </Dimensions>
                      </Fragment>
                    ))}
                </Dataset>
              ))}
            </Column>
          ))}
        </Datasets>
        <CTA>
          <CTA.Energy />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  );
}

interface IDataset {
  category: string;
  categoryTooltip?: string;
  categoryIcon: IconName;
  dimensions?: IDimension[];
  subDatasets?: SubDataset[];
  prod: boolean;
}
interface SubDataset {
  title: string;
  titleTooltip?: string;
  dimensions: IDimension[];
}
const datasets: IDataset[] = [
  {
    category: "Greenhouse Gas Emissions",
    categoryIcon: "Gas",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/climate/ghg?chart-type=line&chart-types=line&chart-types=ranking&energy-unit=MtCO2eq&group-names=World&is-range=true&source=PIK&sectors=Transportation&dimension=total&end=2014&start=1850&multi=true",
        icon: "LineChart",
        active: true,
      },
      {
        title: "per capita",
        link:
          "/climate/ghg?chart-type=line&chart-types=line&chart-types=ranking&energy-unit=tCO2eq&group-names=World&is-range=true&source=PIK&sectors=Transportation&dimension=perCapita&end=2014&start=1850&multi=true",
        icon: "Capita",
        active: true,
      },
      { title: "per GDP", link: "/climate/ghg", icon: "Dollar", active: false },
      {
        title: "by gas",
        link:
          "/climate/ghg?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&energy-unit=MtCO2eq&group-names=World&is-range=true&source=PIK&sectors=Agriculture&sectors=Waste&sectors=Energy&sectors=Industry%20and%20Construction&dimension=byGas&end=2012&start=1850&multi=false",
        icon: "StackedChart",
        active: true,
      },
      {
        title: "by sector",
        link:
          "/climate/ghg?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&energy-unit=MtCO2eq&group-names=World&is-range=true&source=PIK&sectors=Agriculture&sectors=Waste&sectors=Energy&sectors=Industry%20and%20Construction&dimension=bySector&end=2012&start=1850&multi=false",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "CO<sub>2</sub> Emissions from Fossil Fuels",
    categoryIcon: "CO2",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/climate/co2-from-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=total&end=2016&start=1980&multi=true",
        icon: "LineChart",
        active: true,
      },
      {
        title: "per capita",
        link:
          "/climate/co2-from-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&emissions-unit=tCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=perCapita&end=2015&start=1850&multi=true",
        icon: "Capita",
        active: true,
      },
      {
        title: "per GDP",
        link:
          "/climate/co2-from-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&emissions-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202011%20US%24)&dimension=perGDP&end=2016&start=1950&multi=true",
        icon: "Dollar",
        active: true,
      },
      {
        title: "per energy",
        link: "/climate/co2-from-energy",
        icon: "LineChart",
        active: false,
      },
      {
        title: "by source",
        link:
          "/climate/co2-from-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=byEnergyFamily&end=2016&start=1980&multi=false",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "CO<sub>2</sub> Footprint",
    categoryIcon: "Footprint",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/climate/carbon-footprint?chart-type=line&chart-types=line&chart-types=ranking&emissions-unit=MtCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=total&end=2017&start=1990&scopes=Carbon%20Footprint",
        icon: "LineChart",
        active: true,
      },
      {
        title: "per capita",
        link:
          "/climate/carbon-footprint?chart-type=line&chart-types=line&chart-types=ranking&emissions-unit=tCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=perCapita&end=2017&start=1990&scopes=Carbon%20Footprint",
        icon: "Capita",
        active: true,
      },
      {
        title: "per GDP",
        link:
          "/climate/carbon-footprint?chart-type=line&chart-types=line&chart-types=ranking&emissions-unit=tCO2&group-names=World&is-range=true&gdpUnits=GDP%20(constant%202010%20US%24)&dimension=perGDP&end=2017&start=1990&scopes=Carbon%20Footprint",
        icon: "Dollar",
        active: true,
      },
    ],
  },
  {
    category: "CO<sub>2</sub> Imports/Exports",
    categoryIcon: "CO2",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/climate/co2-imports-exports?emissions-unit=MtCO2eq&group-names=China&group-names=United%20States%20of%20America&group-names=Japan&group-names=Germany&group-names=Russian%20Federation%20%26%20USSR&group-names=India&group-names=South%20Korea&group-names=United%20Kingdom&group-names=Canada&group-names=Hong%20Kong%20Special%20Administrative%20Region%20(China)&dimension=total&multi=true&types=CO2%20Imports&types=CO2%20Exports",
        icon: "LineChart",
        active: true,
      },
      {
        title: "by country",
        link:
          "/climate/co2-imports-exports?emissions-unit=MtCO2eq&group-names=United%20States%20of%20America&dimension=byCountry&multi=false&types=CO2%20Imports&types=CO2%20Exports",
        icon: "TopChart",
        active: true,
      },
      {
        title: "by continent",
        link:
          "/climate/co2-imports-exports?emissions-unit=MtCO2eq&group-names=United%20States%20of%20America&dimension=byContinent&multi=false&types=CO2%20Imports&types=CO2%20Exports",
        icon: "TopChart",
        active: true,
      },
      {
        title: "by sector",
        link:
          "/climate/co2-imports-exports?emissions-unit=MtCO2eq&group-names=United%20States%20of%20America&dimension=bySector&multi=false&types=CO2%20Imports&types=CO2%20Exports",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "KAYA Identity",
    categoryIcon: "EnergyProduction",
    prod: true,
    dimensions: [
      {
        title: "KAYA",
        link:
          "/climate/kaya?chart-type=line&chart-types=line&group-names=World&is-range=true&dimension=total&end=2015&start=1980",
        icon: "LineChart",
        active: true,
      },
    ],
  },
];
