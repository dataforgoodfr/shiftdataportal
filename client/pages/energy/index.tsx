import React, { Fragment, useEffect, useState } from "react"
import { Nav, DatasetCategory, DimensionButton, SubCategoryTitle, Footer, CTA } from "../../components"
import { Theme } from "../../lib/styled"
import { useTheme } from "@emotion/react"
import { typography, space, layout } from "styled-system"
import { IconName } from "../../components/Icons"
import { iconNameToIconComponent } from "../../components/DatasetCategory"
import styled from "@emotion/styled"

export default function Energy() {
  const theme = useTheme()
  const [columnsData, setColumnsData] = useState<IDataset[][]>([])
  const [selectedAnchor, setSelectedAnchor] = useState<string>()
  useEffect(() => {
    const filteredDatasets = datasets.filter((set) => {
      const isDev =
        (process.browser && document.location.href.includes("staging")) ||
        process.env.NODE_ENV === "development" ||
        (process.browser && document.location.href.includes("localhost"))
      if (!isDev && set.prod) {
        return true
      } else if (!isDev && !set.prod) {
        return false
      } else {
        return true
      }
    })

    const columnsData = [[], []]
    filteredDatasets.forEach((dataset, index) => {
      switch (index % 2) {
        case 0:
          columnsData[0].push(dataset)
          break
        case 1:
          columnsData[1].push(dataset)
          break
      }
    })
    setColumnsData(columnsData)
  }, [])
  return (
    <Fragment>
      <Nav />
      <Main px={theme.mainPaddingX}>
        <H1 fontSize={[10]} mt={[5]}>
          <span style={{ color: theme.colors.orange }}>Energy</span> Datasets
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
                  setSelectedAnchor(dataset.category)
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
                      color={theme.colors.orange}
                      tooltip={dataset.categoryTooltip}
                      index={j}
                    >
                      {dataset.category}
                    </DatasetCategory>
                  )}
                  {dataset.dimensions && (
                    <Dimensions mt={[2]}>
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
          <CTA.Climate />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  )
}

export const Main = styled.main`
  ${space}
`
export const H1 = styled.h1`
  ${typography};
  ${space};
  font-weight: 700;
  color: ${(p) => p.theme.colors.darkBlue};
  letter-spacing: 1.09px;
  line-height: 52px;
  span {
    color: ${(p) => p.theme.colors.darkBlue};
  }
`
export const Subtitle = styled.p`
  color: ${(p) => p.theme.colors.darkBlue};
  letter-spacing: 0.4px;
  ${space};
  ${layout};
`

export const Datasets = styled.section`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  & > * {
    flex-grow: 1;
  }
`
export const Column = styled.ul`
  ${layout};
  display: flex;
  flex-flow: column nowrap;
`
export const Dataset = styled.li`
  position: relative;
  display: inline-block;
  transition: background-color 0.1s ease-out, box-shadow 0.2s ease-out;
  background-color: ${(p) => (p.theme.highlighted ? p.theme.colors.darkBlue + "0f" : "white")};
  border: ${(p) => (p.theme.highlighted ? "2px solid " + p.theme.colors.darkBlue : "1px solid #e7eaf4")};

  ${space}
`

export const Dimensions = styled.div`
  ${space};
  display: flex;
  flex-flow: row wrap;
`
export const AnchorUl = styled.ul`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
  margin: auto;
  margin-top: 4rem;
  max-width: 40rem;
`
export const AnchorLi = styled.li`
  font-weight: 700;
  position: relative;
  transform: translateX(-10px);
  a {
    transition: opacity 0.3s ease-out;
    &:hover {
      opacity: 0.5;
    }
  }
`
export const AnchorA = styled.a`
  ${space};
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: ${(p) => p.theme.colors.darkBlue};
`
export const AnchorIcon = styled.div`
  padding: 0.4rem;
  background-color: ${(p) => p.theme.colors.darkBlue};
  transition: border-radius 0.3s ease-out;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 1.5rem;
  }
`

interface IDataset {
  category: string
  categoryTooltip?: string
  categoryIcon: IconName
  dimensions?: IDimension[]
  subDatasets?: SubDataset[]
  prod: boolean
}
interface SubDataset {
  title: string
  titleTooltip?: string
  dimensions: IDimension[]
}
export interface IDimension {
  title:
    | "total"
    | "per capita"
    | "per GDP"
    | "by source"
    | "by sector"
    | "by gas"
    | "top countries"
    | "proven reserves"
    | "extrapolation"
    | "old extrapolation"
    | "share of primary energy"
    | "share of electricity generation"
    | "import / export"
    | "unknown"
    | "KAYA"
    | "per energy"
    | "by country"
    | "by continent"
  link: string
  icon: IconName
  active: boolean
}
const datasets: IDataset[] = [
  {
    category: "Primary Energy",
    categoryIcon: "EnergyConsumption",
    prod: true,
    subDatasets: [
      {
        title: "Production",
        titleTooltip:
          "Primary production of energy is any extraction of energy products in a useable form from natural sources. This occurs either when natural sources are exploited (for example, in coal mines, crude oil fields, hydro power plants) or in the fabrication of biofuels.",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=Mtoe&group-names=World&is-range=true&dimension=total&end=2016&start=1900&multi=true&type=Production",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=toe&group-names=World&is-range=true&dimension=perCapita&end=2016&start=1960&multi=true&type=Production",
            icon: "Capita",
            active: true,
          },
          {
            title: "per GDP",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=KWh&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&dimension=perGDP&end=2016&start=1960&multi=true&type=Production",
            icon: "Dollar",
            active: true,
          },
          {
            title: "by source",
            link:
              "/energy/primary-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-families=Peat&energy-unit=Mtoe&group-names=World&is-range=true&dimension=byEnergyFamily&end=2016&start=1900&multi=false&type=Production",
            icon: "StackedChart",
            active: true,
          },
        ],
      },
      {
        title: "Consumption",
        titleTooltip:
          "Primary energy consumption measures the total energy demand of a country. It covers consumption of the energy sector itself, losses during transformation (for example, from oil or gas to electricity) and distribution of energy, and the final consumption by end users. It excludes energy carriers used for non-energy purposes (such as petroleum used for producing plastics).",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&dimension=total&end=2016&start=1980&multi=true&type=Consumption",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-unit=toe&group-names=World&is-range=true&dimension=perCapita&end=2016&start=1960&multi=true&type=Consumption",
            icon: "Capita",
            active: true,
          },
          {
            title: "per GDP",
            link:
              "/energy/primary-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=KWh&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&dimension=perGDP&end=2016&start=1980&multi=true&type=Consumption",
            icon: "Dollar",
            active: true,
          },
          {
            title: "by source",
            link:
              "/energy/primary-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil&energy-families=Coal&energy-families=Gas&energy-families=Nuclear&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Fuel%20Ethanol&energy-families=Geothermal&energy-families=Biodiesel&energy-unit=Mtoe&group-names=World&is-range=true&dimension=byEnergyFamily&end=2016&start=1980&multi=false&type=Consumption",
            icon: "StackedChart",
            active: true,
          },
        ],
      },
    ],
  },
  {
    category: "Final Energy Consumption",
    prod: true,
    categoryTooltip:
      "Final energy consumption is the total energy consumed by end users, such as households, industry and agriculture. It is the energy which reaches the final consumer's door and excludes that which is used by the energy sector itself.",
    categoryIcon: "Energy",
    dimensions: [
      {
        title: "total",
        link:
          "/energy/final-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Heat&energy-families=Geothermal&energy-families=Biofuels%20and%20waste&energy-families=Crude%20oil&energy-families=Others&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&sectors=Industry&sectors=Residential&sectors=Other&sectors=Commercial%20and%20public%20services&sectors=Agriculture&dimension=total&end=2016&start=1971&multi=true",
        icon: "LineChart",
        active: true,
      },
      {
        title: "per capita",
        link:
          "/energy/final-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Heat&energy-families=Geothermal&energy-families=Biofuels%20and%20waste&energy-families=Crude%20oil&energy-families=Others&energy-unit=toe&group-names=World&is-range=true&sectors=Transport&sectors=Industry&sectors=Residential&sectors=Other&sectors=Commercial%20and%20public%20services&sectors=Agriculture&dimension=perCapita&end=2016&start=1960&multi=true",
        icon: "Capita",
        active: true,
      },
      {
        title: "per GDP",
        link:
          "/energy/final-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Heat&energy-families=Geothermal&energy-families=Biofuels%20and%20waste&energy-families=Crude%20oil&energy-families=Others&energy-unit=KWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&sectors=Transport&dimension=perGDP&end=2016&start=1990&multi=true",
        icon: "Dollar",
        active: true,
      },
      {
        title: "by source",
        link:
          "/energy/final-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Heat&energy-families=Geothermal&energy-families=Biofuels%20and%20waste&energy-families=Crude%20oil&energy-families=Others&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&dimension=byEnergyFamily&end=2016&start=1971&multi=false",
        icon: "StackedChart",
        active: true,
      },
      {
        title: "by sector",
        link:
          "/energy/final-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-families=Oil%20products&energy-families=Gas&energy-families=Electricity&energy-families=Coal&energy-families=Heat&energy-families=Geothermal&energy-families=Biofuels%20and%20waste&energy-families=Crude%20oil&energy-families=Others&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&sectors=Industry&sectors=Residential&sectors=Other&sectors=Commercial%20and%20public%20services&sectors=Agriculture&dimension=bySector&end=2016&start=1990&multi=false",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "Electricity",
    categoryIcon: "Electricity",
    prod: true,
    subDatasets: [
      {
        titleTooltip:
          "Electricity generation is the process of generating electric power from sources of primary energy.",
        title: "Generation",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/electricity?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=TWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Generation&dimension=total&end=2015&start=1990&multi=true",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/electricity?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=KWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Generation&dimension=perCapita&end=2015&start=1990&multi=true",
            icon: "Capita",
            active: true,
          },
          {
            title: "per GDP",
            link:
              "/energy/electricity?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-generation=Hydro&ef-generation=Wind&ef-generation=Biomass&ef-generation=Waste&ef-generation=Solar%20PV&ef-generation=Geothermal&ef-generation=Solar%20Thermal&ef-generation=Tide&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=KWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Generation&dimension=perGDP&end=2015&start=1990&multi=true",
            icon: "Dollar",
            active: true,
          },
          {
            title: "by source",
            link:
              "/energy/electricity?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-generation=Hydro&ef-generation=Wind&ef-generation=Biomass&ef-generation=Waste&ef-generation=Solar%20PV&ef-generation=Geothermal&ef-generation=Solar%20Thermal&ef-generation=Tide&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=TWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Generation&dimension=byEnergyFamily&end=2015&start=1990&multi=false",
            icon: "StackedChart",
            active: true,
          },
        ],
      },
      {
        title: "Capacity",
        titleTooltip:
          "Electricity generation capacity is the maximum electric output an electricity generator can produce under specific conditions.",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/electricity?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=TWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Capacity&dimension=total&end=2016&start=1980&multi=true",
            icon: "LineChart",
            active: true,
          },
          {
            title: "by source",
            link:
              "/energy/electricity?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&ef-generation=Oil&ef-generation=Coal&ef-generation=Gas&ef-generation=Nuclear&ef-capacity=Fossil%20Fuels&ef-capacity=Hydroelectricity&ef-capacity=Nuclear&ef-capacity=Hydroelectric%20Pumped%20Storage&ef-capacity=Wind&ef-capacity=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&ef-capacity=Biomass%20and%20Waste&ef-capacity=Geothermal&energy-unit=TWh&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&type=Capacity&dimension=byEnergyFamily&end=2016&start=1980&multi=false",
            icon: "StackedChart",
            active: true,
          },
        ],
      },
    ],
  },

  {
    category: "Oil",
    categoryIcon: "FossilFuels",
    prod: true,
    dimensions: [
      {
        title: "proven reserves",
        link:
          "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=false&energy-unit=toe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=provenReserve&end=2018&start=1980&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Hubbert&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Gb",
        icon: "ProvenReserves",
        active: true,
      },
      {
        title: "import / export",
        link:
          "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=false&energy-unit=toe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=China&group-names=United%20States%20of%20America&is-range=true&sectors=Transport&dimension=importExport&end=2016&start=1980&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Hubbert&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Mb%2Fd",
        icon: "ImportExport",
        active: true,
      },
    ],
    subDatasets: [
      {
        title: "Production",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=true&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=total&end=2016&start=1900&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Hubbert&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Production&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Mtoe",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=true&energy-unit=toe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=perCapita&end=2015&start=1900&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Hubbert&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Production&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=toe",
            icon: "Capita",
            active: true,
          },
          {
            title: "extrapolation",
            link:
              "/energy/oil?chart-type=line&chart-types=line&disable-en=false&show-unit=false&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=extrapolation&end=2199&start=1980&multi=false&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Triangle&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Production&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Mb%2Fd",
            icon: "LineChart",
            active: true,
          },
          {
            title: "old extrapolation",
            link:
              "/energy/oil?chart-type=line&chart-types=line&disable-en=false&show-unit=false&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=oldExtrapolation&end=2250&start=1900&multi=false&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Triangle&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Production&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Mb%2Fd",
            icon: "LineChart",
            active: true,
          },
        ],
      },
      {
        title: "Consumption",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=true&energy-unit=Mtoe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=total&end=2016&start=1980&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Triangle&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=Mtoe",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/oil?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&show-unit=true&energy-unit=toe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=perCapita&end=2015&start=1980&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Triangle&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=toe",
            icon: "Capita",
            active: true,
          },
          {
            title: "per GDP",
            link:
              "/energy/oil?chart-type=line&chart-types=line&disable-en=false&show-unit=true&energy-unit=toe&gdp-unit=GDP%20(constant%202010%20US%24)&group-names=World&is-range=true&sectors=Transport&dimension=perGDP&end=2016&start=1980&multi=true&old-urr=4100&old-curves=Hubbert&old-scenari=EIA%20-%20High%20Oil%20Price&old-scenari=OPEC%20-%20Reference%20Case&old-scenari=IEA%20-%20Current%20Policies%20Scenario&old-scenari=History%20-%20Extension%20of%20Historical%20Data&old-scenari=EIA%20-%20Traditional%20Low%20Oil%20Price&old-scenari=IEA%20-%20New%20Policies%20Scenario&old-scenari=Univ.%20Of%20Uppsala%20-%20World%20Oil%20Outlook%202008&old-scenari=EIA%20-%20Low%20Oil%20Price&old-scenari=IEA%20-%20450%20Scenario&old-scenari=Historical%20-%20Data&old-scenari=EIA%20-%20Traditional%20High%20Oil%20Price&old-scenari=EIA%20-%20Reference&reserve=775%20(Laherrère%202020)&curves=Triangle&scenari=Current%20Policies&scenari=Stated%20Policies&scenari=Sustainable%20Development&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports&unit=toe",
            icon: "Dollar",
            active: true,
          },
        ],
      },
    ],
  },
  {
    category: "Gas",
    categoryIcon: "Fire",
    prod: true,
    dimensions: [
      {
        title: "proven reserves",
        link:
          "/energy/gas?chart-type=line&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Bcm&group-names=World&is-range=true&sectors=Transport&dimension=provenReserve&end=2018&start=1980&multi=true",
        icon: "ProvenReserves",
        active: true,
      },
      {
        title: "import / export",
        link:
          "/energy/gas?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Bcm&group-names=United%20States%20of%20America&group-names=China&is-range=true&sectors=Transport&dimension=importExport&end=2016&start=1980&multi=true&type=Consumption&import-types=Imports&import-types=Exports&import-types=Net%20Imports",
        icon: "ImportExport",
        active: true,
      },
    ],
    subDatasets: [
      {
        title: "Production",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/gas?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&dimension=total&end=2016&start=1900&multi=true&type=Production",
            icon: "LineChart",
            active: true,
          },
        ],
      },
      {
        title: "Consumption",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/gas?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&sectors=Transport&dimension=total&end=2016&start=1980&multi=true&type=Consumption",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/gas?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=toe&group-names=World&is-range=true&sectors=Transport&dimension=perCapita&end=2015&start=1980&multi=true&type=Production",
            icon: "Capita",
            active: true,
          },
          {
            title: "by sector",
            link: "/energy/final-energy",
            icon: "StackedChart",
            active: false,
          },
        ],
      },
    ],
  },

  {
    category: "Coal",
    categoryIcon: "Coal",
    prod: true,
    dimensions: [
      { title: "proven reserves", link: "/", icon: "ProvenReserves", active: false },
      {
        title: "import / export",
        link:
          "/energy/coal?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=China&group-names=United%20States%20of%20America&group-names=Australia&is-range=true&dimension=importExport&end=2016&start=1980&multi=true&type=Production&import-types=Imports&import-types=Exports&import-types=Net%20Imports",
        icon: "ImportExport",
        active: true,
      },
    ],
    subDatasets: [
      {
        title: "Production",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/coal?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&dimension=total&end=2015&start=1900&multi=true&type=Production",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/coal?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=toe&group-names=World&is-range=true&dimension=perCapita&end=2015&start=1900&multi=true&type=Production",
            icon: "Capita",
            active: true,
          },
        ],
      },
      {
        title: "Consumption",
        dimensions: [
          {
            title: "total",
            link:
              "/energy/coal?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&dimension=total&end=2016&start=1980&multi=true&type=Consumption",
            icon: "LineChart",
            active: true,
          },
          {
            title: "per capita",
            link:
              "/energy/coal?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=toe&group-names=World&is-range=true&dimension=perCapita&end=2015&start=1980&multi=true&type=Consumption",
            icon: "Capita",
            active: true,
          },
        ],
      },
    ],
  },
  {
    category: "Renewable Energy",
    categoryIcon: "Renewables",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/energy/renewable-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=TWh&group-names=World&is-range=true&dimension=total&end=2016&start=1980&multi=true&type=Consumption&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Geothermal&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Biodiesel",
        icon: "LineChart",
        active: true,
      },
      {
        title: "share of primary energy",
        link:
          "/energy/renewable-energy?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=%25&group-names=World&is-range=true&dimension=shareOfPrimaryEnergy&end=2016&start=1980&multi=true&type=Consumption",
        icon: "LineChart",
        active: true,
      },
      {
        title: "by source",
        link:
          "/energy/renewable-energy?chart-type=stacked&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=Mtoe&group-names=World&is-range=true&dimension=byEnergyFamily&end=2016&start=1980&multi=false&type=Consumption&energy-families=Hydroelectricity&energy-families=Biomass%20and%20Waste&energy-families=Wind&energy-families=Solar%2C%20Tide%2C%20Wave%2C%20Fuel%20Cell&energy-families=Geothermal&energy-families=Biodiesel",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "Nuclear",
    categoryIcon: "Nuclear",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/energy/nuclear?chart-type=line&chart-types=stacked&chart-types=stacked-percent&chart-types=pie&chart-types=line&chart-types=ranking&energy-unit=KWh&group-names=World&is-range=true&dimension=total&end=2016&start=1990&multi=true",
        icon: "LineChart",
        active: true,
      },
      {
        title: "share of electricity generation",
        link:
          "/energy/nuclear?chart-type=line&chart-types=line&chart-types=ranking&energy-unit=%25&group-names=World&is-range=true&dimension=shareOfElectricityGeneration&end=2016&start=1990&multi=true",
        icon: "StackedChart",
        active: true,
      },
    ],
  },
  {
    category: "Energy Intensity of GDP",
    categoryIcon: "Energy",
    prod: true,
    dimensions: [
      {
        title: "total",
        link:
          "/energy/energy-intensity-gdp?chart-type=line&chart-types=line&chart-types=ranking&disable-en=false&energy-unit=toe&group-names=World&is-range=true&gdp-unit=GDP%20(constant%202010%20US%24)&energy-type=Total%20Primary%20Oil%20Consumption&dimension=total&end=2016&start=1980&multi=true",
        icon: "LineChart",
        active: true,
      },
    ],
  },
]
