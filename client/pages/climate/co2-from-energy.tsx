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
  Main,
  Share,
  TypesInput,
  DimensionsSelect,
  Nav,
  RadioSelect,
  CategoryName,
  MainChartTitle,
  CTA,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components"
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  Co2Unit,
  GetCo2FromEnergyDimensionQuery,
  GetCo2FromEnergyDimensionQueryVariables,
  Co2FromEnergyDimensions,
  Co2FromEnergyInputsQuery,
  Co2FromEnergyInputsQueryVariables,
} from "../../types"
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"

const Co2FromEnergy: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedCO2Unit,
      selectedYearRange,
      selectedEnergyFamilies,
      selectedGdpUnit,
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params })
  // Query all the inputs options, automatically re-fetches when a variable changes
  const {
    loading: loadingInputs,
    data: dataInputs,
    error: errorInputs,
  } = useQuery<Co2FromEnergyInputsQuery, Co2FromEnergyInputsQueryVariables>(INPUTS, {
    variables: {
      dimension: selectedDimension,
    },
  })
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))

  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "disable-en": isSelectEnergyFamilyDisabled,
      "energy-families": selectedEnergyFamilies,
      "emissions-unit": selectedCO2Unit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      gdpUnits: selectedGdpUnit,
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
    selectedCO2Unit,
    selectedGroupNames,
    selectedGdpUnit,
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
    GetCo2FromEnergyDimensionQuery,
    GetCo2FromEnergyDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      emissionsUnit: selectedCO2Unit,
      perGDP: selectedDimension === "perGDP",
      groupName: selectedGroupNames[0],
      dimension: selectedDimension,
      gdpUnit: selectedGdpUnit,
      byEnergyFamily: selectedDimension === "byEnergyFamily",
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      energyFamilies: selectedEnergyFamilies,
      yearStart: 0,
      yearEnd: 3000,
    },
  })

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    setGraphTitle(`CO2 Emissions from Fossil Fuels${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedYearRange, selectedDimension, isRange])
  function handleCsvDownloadClick() {
    stackedChartRef.current.downloadCSV()
  }
  function handleScreenshotDownloadClick() {
    stackedChartRef.current.exportChart()
  }
  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.cO2FromEnergy) {
    inputs = <p>Loading...</p>
  } else {
    const { emissionsUnits, zones, groups, countries, energyFamilies, dimensions, gdpUnits } = dataInputs.cO2FromEnergy
    inputs = (
      <Fragment>
        <div>
          {
            <DimensionsSelect
              dimensions={dimensions}
              onChange={(newDimension) =>
                dispatch({
                  type: newDimension as ReducerActions,
                  payload: { selectedGdpUnit },
                })
              }
              selectedDimension={selectedDimension}
            />
          }
        </div>
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.cO2FromEnergy[selectedDimension]?.multiSelects
                ? dimensionData.cO2FromEnergy[selectedDimension].multiSelects
                : []),
              ...(dimensionData?.cO2FromEnergy?.multiSelects ? dimensionData.cO2FromEnergy.multiSelects : []),
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
          {selectedDimension === "byEnergyFamily" && (
            <TypesInput
              label="Sources"
              isLoading={loadingInputs}
              typeName="Source"
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
          <RadioSelect
            label="Unit"
            inputName="Unit"
            selectedOption={selectedCO2Unit}
            options={Object.keys(emissionsUnits)}
            onChange={(selectedCO2Unit) => {
              dispatch({
                type: "selectEmissionsUnit",
                payload: { selectedCO2Unit },
              })
            }}
          />
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
        unit={selectedCO2Unit}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        title={graphTitle}
        highchartsSeriesAndCategories={
          dimensionData?.cO2FromEnergy && dimensionData.cO2FromEnergy[selectedDimension]
            ? ({
                categories: dimensionData.cO2FromEnergy[selectedDimension].categories,
                series: dimensionData.cO2FromEnergy[selectedDimension].series,
              } as StackedChartProps["highchartsSeriesAndCategories"])
            : { series: [], categories: [] }
        }
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
        <CategoryName type="CLIMATE" />
        <MainChartTitle>
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} CO<sub>2</sub> Emissions from Fossil Fuels
        </MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedCO2Unit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.cO2FromEnergy && dimensionData.cO2FromEnergy[selectedDimension]
                ? ({
                    categories: dimensionData.cO2FromEnergy[selectedDimension].categories,
                    series: dimensionData.cO2FromEnergy[selectedDimension].series,
                  } as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.cO2FromEnergy?.mdInfos && <GraphInfos>{dataInputs.cO2FromEnergy.mdInfos}</GraphInfos>}
        <SharingButtons title={graphTitle} />
        <CTA>
          <CTA.Energy />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  )
}
Co2FromEnergy.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedEnergyFamilies: query["energy-families"]
        ? Array.isArray(query["energy-families"])
          ? (query["energy-families"] as string[])
          : [query["energy-families"] as string]
        : ["Oil", "Coal", "Gas", "All Fossil Fuels"],
      selectedGdpUnit: (query["gdp-unit"] as string) ? (query["gdp-unit"] as string) : "GDP (constant 2011 US$)",
      selectedDimension: (query["dimension"] as Co2FromEnergyDimensions)
        ? (query["dimension"] as Co2FromEnergyDimensions)
        : Co2FromEnergyDimensions.ByEnergyFamily,
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
      selectedCO2Unit: (query["emissions-unit"] as Co2Unit) ? (query["emissions-unit"] as Co2Unit) : Co2Unit.MtCo2,
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
  query co2FromEnergyInputs {
    cO2FromEnergy {
      mdInfos
      emissionsUnits
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
      gdpUnits
      dimensions
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getCo2FromEnergyDimension(
    $energyFamilies: [String!]!
    $gdpUnit: String!
    $groupNames: [String]!
    $groupName: String
    $emissionsUnit: CO2Unit!
    $byEnergyFamily: Boolean!
    $total: Boolean!
    $perCapita: Boolean!
    $yearStart: Int!
    $perGDP: Boolean!
    $yearEnd: Int!
    $dimension: CO2FromEnergyDimensions!
  ) {
    cO2FromEnergy {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      byEnergyFamily(
        energyFamilies: $energyFamilies
        emissionsUnit: $emissionsUnit
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
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
      total(groupNames: $groupNames, emissionsUnit: $emissionsUnit, yearStart: $yearStart, yearEnd: $yearEnd)
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
      perGDP(
        gdpUnit: $gdpUnit
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
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
      perCapita(groupNames: $groupNames, emissionsUnit: $emissionsUnit, yearStart: $yearStart, yearEnd: $yearEnd)
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
  selectedDimension: Co2FromEnergyDimensions
  selectedEnergyFamilies: GetCo2FromEnergyDimensionQueryVariables["energyFamilies"]
  selectedCO2Unit: GetCo2FromEnergyDimensionQueryVariables["emissionsUnit"]
  selectedGroupNames: GetCo2FromEnergyDimensionQueryVariables["groupNames"]
  selectedGdpUnit: GetCo2FromEnergyDimensionQueryVariables["gdpUnit"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | Co2FromEnergyDimensions
  | "selectGroupNames"
  | "selectEmissionsUnit"
  | "selectGdpUnit"
  | "selectEnergyFamilies"
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
      selectedCO2Unit?: ReducerState["selectedCO2Unit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedEnergyFamilies?: ReducerState["selectedEnergyFamilies"]
      selectedGdpUnit?: ReducerState["selectedGdpUnit"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case Co2FromEnergyDimensions.ByEnergyFamily:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: Co2FromEnergyDimensions.ByEnergyFamily,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedCO2Unit: Co2Unit.MtCo2,
        isRange: true,
      }
    case Co2FromEnergyDimensions.PerGdp:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: Co2FromEnergyDimensions.PerGdp,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        selectedGdpUnit: action.payload.selectedGdpUnit,
        isGroupNamesMulti: true,
        selectedCO2Unit: Co2Unit.TCo2,
      }
    case Co2FromEnergyDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: Co2FromEnergyDimensions.Total,
        isGroupNamesMulti: true,
        selectedCO2Unit: Co2Unit.MtCo2,
        isRange: true,
      }
    case Co2FromEnergyDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: Co2FromEnergyDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedCO2Unit: Co2Unit.TCo2,
        isRange: true,
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectEmissionsUnit":
      return {
        ...prevState,
        selectedCO2Unit: action.payload.selectedCO2Unit,
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
    case "selectGdpUnit":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
        selectedGdpUnit: action.payload.selectedGdpUnit,
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

export default Co2FromEnergy
