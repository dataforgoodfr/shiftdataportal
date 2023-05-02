import { useQuery } from "@apollo/client"
import gql from "graphql-tag"
import { NextPage } from "next"
import Head from "next/head"
import { ParsedUrlQueryInput } from "querystring"
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react"
import { Range } from "react-input-range"
import { useDebounce } from "use-debounce"
import {
  ChartTypesSelect,
  Footer,
  GroupNamesSelect,
  Nav,
  Main,
  TypesInput,
  DimensionsSelect,
  MainChartTitle,
  CategoryName,
  RadioSelect,
  CTA,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components"

import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  EnergyUnit,
  GetFinalEnergyDimensionQuery,
  GetFinalEnergyDimensionQueryVariables,
  FinalEnergiesDimensions,
  FinalEnergyInputsQuery,
  FinalEnergyInputsQueryVariables,
} from "../../types"
import { DownloadScreenshotButton, IframeButton, ExportDataButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"
import { ShareChart } from "../../components/Share"

//

const FinalEnergy: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedEnergyUnit,
      selectedGdpUnit,
      selectedYearRange,
      selectedEnergyFamilies,
      selectedSectors,
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params })
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    FinalEnergyInputsQuery,
    FinalEnergyInputsQueryVariables
  >(INPUTS, {
    variables: {
      dimension: selectedDimension,
    },
  })
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))

  const [highchartsSeriesAndCategories, setHighchartsSeriesAndCategories] = useState({ series: [], categories: [] })
  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "disable-en": isSelectEnergyFamilyDisabled,
      "energy-families": selectedEnergyFamilies,
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      "gdp-unit": selectedGdpUnit,
      sectors: selectedSectors,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyFamilies,
    selectedEnergyUnit,
    selectedGdpUnit,
    selectedGroupNames,
    selectedSectors,
    debouncedYearRange,
    isRange,
    isSelectEnergyFamilyDisabled,
    isGroupNamesMulti,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetFinalEnergyDimensionQuery,
    GetFinalEnergyDimensionQueryVariables
  >(GET_DIMENSION, {
    skip: selectedEnergyFamilies.length === 0 ? true : false,
    variables: {
      groupNames: selectedGroupNames,
      energyUnit: selectedEnergyUnit,
      bySector: selectedDimension === "bySector",
      gdpEnergyType: "Total Final Energy Consumption",
      groupName: selectedGroupNames[0],
      sectors: selectedSectors,
      dimension: selectedDimension,
      byEnergyFamily: selectedDimension === "byEnergyFamily",
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      perGDP: selectedDimension === "perGDP",
      gdpUnit: selectedGdpUnit,
      energyFamilies:
        selectedEnergyFamilies.length === 0
          ? dataInputs?.finalEnergies?.energyFamilies && dataInputs.finalEnergies.energyFamilies.map((i) => i.name)
          : selectedEnergyFamilies,
      yearStart: 0,
      yearEnd: 3000,
    },
  })
  useEffect(() => {
    if (dimensionData?.finalEnergies && dimensionData.finalEnergies[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        dimensionData.finalEnergies[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"]
      )
    } else if (dimensionData?.energyIntensityGDP?.total) {
      setHighchartsSeriesAndCategories(dimensionData.energyIntensityGDP.total)
    } else {
      setHighchartsSeriesAndCategories({ series: [], categories: [] })
    }
  }, [dimensionData, selectedDimension])

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    setGraphTitle(`Final Energy ${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedYearRange, selectedDimension, isRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.finalEnergies || !dataInputs.energyIntensityGDP) {
    inputs = <p>Loading...</p>
  } else {
    const { energyUnits, zones, groups, countries, energyFamilies, dimensions, sectors } = dataInputs.finalEnergies
    const { gdpUnits } = dataInputs.energyIntensityGDP

    inputs = (
      <Fragment>
        <DimensionsSelect
          dimensions={dimensions}
          onChange={(newDimension) =>
            dispatch({
              type: newDimension as ReducerActions,
            })
          }
          selectedDimension={selectedDimension}
        />
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.finalEnergies[selectedDimension]?.multiSelects
                ? dimensionData.finalEnergies[selectedDimension].multiSelects
                : []),
              ...(dimensionData?.energyIntensityGDP?.total?.multiSelects
                ? dimensionData.energyIntensityGDP.total.multiSelects
                : []),
              ...(dimensionData?.finalEnergies?.multiSelects ? dimensionData.finalEnergies.multiSelects : []),
            ]}
            zones={zones}
            groups={groups}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              })
            }}
          />
          <div>
            {selectedDimension === "byEnergyFamily" && (
              <TypesInput
                label="Sources"
                typeName="Sources"
                isLoading={loadingInputs}
                types={energyFamilies}
                selectedTypes={selectedEnergyFamilies}
                setSelectedTypes={(selectedEnergyFamilies) => {
                  dispatch({
                    type: "selectEnergyFamilies",
                    payload: { selectedEnergyFamilies },
                  })
                }}
              />
            )}
          </div>
          <div>
            {selectedDimension === "bySector" && (
              <TypesInput
                typeName="Sectors"
                label="Sectors"
                isLoading={loadingInputs}
                types={sectors}
                selectedTypes={selectedSectors}
                setSelectedTypes={(selectedSectors) => {
                  dispatch({
                    type: "selectSectors",
                    payload: { selectedSectors },
                  })
                }}
              />
            )}
          </div>
          <RadioSelect
            label="Unit"
            inputName="Unit"
            selectedOption={selectedEnergyUnit}
            options={Object.keys(energyUnits)}
            onChange={(selectedEnergyUnit) => {
              dispatch({
                type: "selectEnergyUnit",
                payload: { selectedEnergyUnit },
              })
            }}
          />
          {selectedDimension === "perGDP" && (
            <RadioSelect
              label="GDP Unit"
              inputName="GDP Unit"
              selectedOption={selectedGdpUnit}
              options={gdpUnits}
              onChange={(selectedGdpUnit) => {
                dispatch({
                  type: "selectGdpUnit",
                  payload: { selectedGdpUnit },
                })
              }}
            />
          )}
          <ChartTypesSelect
            aria-label="chartTypes"
            selected={selectedChartType}
            available={chartTypes}
            onChange={(value: ChartType) => {
              switch (value) {
                case "pie":
                  dispatch({
                    type: "selectPie",
                    payload: {
                      selectedEnergyFamilies: energyFamilies.map((item) => item.name),
                      selectedSectors: sectors.map((item) => item.name),
                    },
                  })
                  break
                case "line":
                  dispatch({ type: "selectLine" })
                  break
                case "stacked":
                  dispatch({ type: "selectStacked" })
                  break
                case "ranking":
                  dispatch({ type: "selectRanking" })
                  break
                case "stacked-percent":
                  dispatch({ type: "selectStackedPercent" })
                  break
                default:
                  console.warn(`ChartTypes input "${value}" didn't match any chartTypes`)
              }
            }}
          />
        </SelectContainer>
      </Fragment>
    )
  }
  if (iframe) {
    return (
      <StackedChart
        iframe={iframe}
        chartHeight={chartHeight}
        onYearRangeChange={onYearRangeChange}
        isRange={isRange}
        ref={stackedChartRef}
        unit={selectedEnergyUnit}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        highchartsSeriesAndCategories={highchartsSeriesAndCategories}
        title={graphTitle}
      />
    )
  }

  return (
    <Fragment>
      <Head>
        <title>The Shift Project - {graphTitle}</title>
      </Head>
      <Nav />
      <Main>
        <CategoryName type="ENERGY" />
        <MainChartTitle>{selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} Final Energy </MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedEnergyUnit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            highchartsSeriesAndCategories={highchartsSeriesAndCategories}
            title={graphTitle}
          />
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        <SharingButtons title={graphTitle} />
        {dataInputs?.finalEnergies?.mdInfos && <GraphInfos>{dataInputs.finalEnergies.mdInfos}</GraphInfos>}
        <CTA>
          <CTA.Climate />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  )
}
FinalEnergy.getInitialProps = async function({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedEnergyFamilies: query["energy-families"]
        ? Array.isArray(query["energy-families"])
          ? (query["energy-families"] as string[])
          : [query["energy-families"] as string]
        : [
            "Oil products",
            "Gas",
            "Electricity",
            "Coal",
            "Biofuels and waste",
            "Heat",
            "Geothermal",
            "Crude oil",
            "Others",
          ],
      selectedSectors: query.sectors
        ? Array.isArray(query.sectors)
          ? (query.sectors as string[])
          : [query.sectors as string]
        : ["Transport"],
      selectedDimension: (query["dimension"] as FinalEnergiesDimensions)
        ? (query["dimension"] as FinalEnergiesDimensions)
        : FinalEnergiesDimensions.ByEnergyFamily,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "stacked",
      chartTypes: (query["chart-types"] as ChartType[] | ChartType)
        ? Array.isArray(query["chart-types"] as ChartType[] | ChartType)
          ? (query["chart-types"] as ChartType[])
          : [query["chart-types"] as ChartType]
        : (["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[]),
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["World"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.Mtoe,
      selectedGdpUnit: (query["gdp-unit"] as string) ? (query["gdp-unit"] as string) : "GDP (constant 2010 US$)",
      // Group name multi only when dimension is "byEnergyFamily"
      isGroupNamesMulti: (query["multi"] as String) === undefined ? false : query["multi"] === "true" ? true : false,
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query finalEnergyInputs {
    energyIntensityGDP {
      gdpUnits
    }
    finalEnergies {
      mdInfos
      energyUnits
      groups {
        name
        color
      }
      zones {
        name
        color
      }
      countries {
        name
        color
      }
      energyFamilies {
        name
        color
      }
      sectors {
        name
        color
      }
      dimensions
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getFinalEnergyDimension(
    $energyFamilies: [String!]!
    $sectors: [String!]!
    $groupNames: [String]!
    $groupName: String
    $energyUnit: EnergyUnit!
    $byEnergyFamily: Boolean!
    $total: Boolean!
    $perCapita: Boolean!
    $perGDP: Boolean!
    $yearStart: Int!
    $bySector: Boolean!
    $yearEnd: Int!
    $dimension: FinalEnergiesDimensions!
    $gdpUnit: String!
    $gdpEnergyType: String!
  ) {
    energyIntensityGDP {
      total(
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        gdpUnit: $gdpUnit
        energyType: $gdpEnergyType
      ) @include(if: $perGDP) {
        categories
        series {
          name
          data
          color
        }
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
    }
    finalEnergies {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      byEnergyFamily(
        energyFamilies: $energyFamilies
        energyUnit: $energyUnit
        groupName: $groupName
        yearStart: $yearStart
        yearEnd: $yearEnd
      ) @include(if: $byEnergyFamily) {
        categories
        series {
          name
          data
          color
        }
      }
      total(groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $total) {
        categories
        series {
          name
          data
          color
        }
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
      bySector(
        sectors: $sectors
        groupName: $groupName
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
      ) @include(if: $bySector) {
        categories
        series {
          name
          data
          color
        }
      }
      perCapita(groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $perCapita) {
        categories
        series {
          name
          data
          color
        }
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
    }
  }
`
interface DefaultProps {
  params: ReducerState
}
interface ReducerState {
  chartTypes: ChartType[]
  selectedChartType: ChartType
  isGroupNamesMulti: boolean
  selectedDimension: FinalEnergiesDimensions
  selectedEnergyFamilies: GetFinalEnergyDimensionQueryVariables["energyFamilies"]
  selectedEnergyUnit: GetFinalEnergyDimensionQueryVariables["energyUnit"]
  selectedGdpUnit: GetFinalEnergyDimensionQueryVariables["gdpUnit"]
  selectedGroupNames: GetFinalEnergyDimensionQueryVariables["groupNames"]
  selectedSectors: GetFinalEnergyDimensionQueryVariables["sectors"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | FinalEnergiesDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectGdpUnit"
  | "selectEnergyFamilies"
  | "selectSectors"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectYears"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"]
      selectedGdpUnit?: ReducerState["selectedGdpUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedEnergyFamilies?: ReducerState["selectedEnergyFamilies"]
      selectedSectors?: ReducerState["selectedSectors"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case FinalEnergiesDimensions.ByEnergyFamily:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: FinalEnergiesDimensions.ByEnergyFamily,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
      }
    case FinalEnergiesDimensions.BySector:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: FinalEnergiesDimensions.BySector,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
      }
    case FinalEnergiesDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FinalEnergiesDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
      }
    case FinalEnergiesDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FinalEnergiesDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
        isRange: true,
      }
    case FinalEnergiesDimensions.PerGdp:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: FinalEnergiesDimensions.PerGdp,
        isGroupNamesMulti: true,
        selectedGdpUnit: "GDP (constant 2010 US$)",
        isRange: true,
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectEnergyUnit":
      return {
        ...prevState,
        selectedEnergyUnit: action.payload.selectedEnergyUnit,
      }
    case "selectGdpUnit":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      }
    case "selectEnergyFamilies":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
      }
    case "selectSectors":
      return {
        ...prevState,
        selectedSectors: action.payload.selectedSectors,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
        selectedSectors: action.payload.selectedSectors,
        selectedChartType: "pie",
        isRange: false,
        isSelectEnergyFamilyDisabled: true,
      }
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      }
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
        isSelectEnergyFamilyDisabled: true,
        isRange: false,
      }
    case "selectYears":
      return {
        ...prevState,
        selectedYearRange: action.payload.selectedYearRange,
      }
    default:
      console.warn(`Reducer didn't match any action of type ${action.type}`)
      return prevState
  }
}

export default FinalEnergy
