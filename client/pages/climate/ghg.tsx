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
  RadioSelect,
  CategoryName,
  MainChartTitle,
  CTA,
  GraphInfos,
  SelectContainer,
  SharingButtons,
} from "../../components"
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  Co2eqUnit,
  GetGhgByGasDimensionQuery,
  GetGhgByGasDimensionQueryVariables,
  GhgByGasDimensions,
  GhgByGasInputsQuery,
  GhgByGasInputsQueryVariables,
} from "../../types"

import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import { ShareChart } from "../../components/Share"
import useGraphTitle from "../../hooks/useGraphTitle"

const GhgByGas: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedCo2eqUnit,
      selectedYearRange,
      selectedSectors,
      selectedGases,
      selectedSource,
      isRange,
      chartTypes,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params })
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    GhgByGasInputsQuery,
    GhgByGasInputsQueryVariables
  >(INPUTS, {
    variables: {
      source: selectedSource,
      dimension: selectedDimension,
    },
  })

  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}))
  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300)

  // Select all sectors if the list changes (normally when data source changes)
  const tempSectors = dataInputs?.gHGByGas?.sectors
  useEffect(() => {
    if (tempSectors) {
      dispatch({ type: "selectSectors", payload: { selectedSectors: tempSectors.map((sector) => sector.name) } })
    }
  }, [tempSectors])
  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "emissions-unit": selectedCo2eqUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      source: selectedSource,
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
    selectedCo2eqUnit,
    selectedGroupNames,
    selectedSectors,
    debouncedYearRange,
    selectedSource,
    isRange,
    isGroupNamesMulti,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useGraphTitle(
    "Greenhouse Gas",
    selectedGroupNames,
    selectedYearRange,
    selectedDimension,
    isRange
  )
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetGhgByGasDimensionQuery,
    GetGhgByGasDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      emissionsUnit: selectedCo2eqUnit,
      groupName: selectedGroupNames[0],
      sectors: selectedSectors,
      gases: selectedGases,
      dimension: selectedDimension,
      source: selectedSource,
      total: selectedDimension === "total",
      bySector: selectedDimension === "bySector",
      perCapita: selectedDimension === "perCapita",
      byGas: selectedDimension === "byGas",
      includingLUCF: true,
      yearStart: 0,
      yearEnd: 3000,
    },
  })

  // Update graph title
  useEffect(() => {
    setGraphTitle()
  }, [selectedGroupNames, selectedYearRange, selectedDimension, isRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any
  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.gHGByGas) {
    inputs = <p>Loading...</p>
  } else {
    const { emissionsUnits, zones, groups, countries, dimensions, sectors, gases, sources } = dataInputs.gHGByGas

    inputs = (
      <Fragment>
        <DimensionsSelect
          dimensions={dimensions}
          onChange={(newDimension) =>
            dispatch({
              type: newDimension as ReducerActions,
              payload: { selectedSectors: sectors.map((sector) => sector.name) },
            })
          }
          selectedDimension={selectedDimension}
        />
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.gHGByGas?.perCapita?.multiSelects
                ? dimensionData.gHGByGas.perCapita.multiSelects
                : []),
              ...(dimensionData?.gHGByGas?.total?.multiSelects ? dimensionData.gHGByGas.total.multiSelects : []),
              ...(dimensionData?.gHGByGas?.multiSelects ? dimensionData.gHGByGas.multiSelects : []),
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
          {selectedDimension === "bySector" && (
            <TypesInput
              label="Sectors"
              typeName="Sectors"
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
          {selectedDimension === "byGas" && (
            <TypesInput
              label="Gases"
              typeName="Gases"
              isLoading={loadingInputs}
              types={gases}
              selectedTypes={selectedGases}
              setSelectedTypes={(selectedGases) => {
                dispatch({
                  type: "selectGases",
                  payload: { selectedGases },
                })
              }}
            />
          )}
          <RadioSelect
            label="Unit"
            inputName="Unit"
            selectedOption={selectedCo2eqUnit}
            options={Object.keys(emissionsUnits)}
            onChange={(selectedCo2eqUnit) => {
              dispatch({
                type: "selectCo2eqUnit",
                payload: { selectedCo2eqUnit },
              })
            }}
          />
          <RadioSelect
            label="Data Source"
            inputName="Data Source"
            selectedOption={selectedSource}
            options={sources}
            onChange={(selectedSource) => {
              dispatch({
                type: "selectSource",
                payload: { selectedSource, selectedSectors: sectors.map((sector) => sector.name) },
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
                      selectedGases: gases.map((item) => item.name),
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
        unit={selectedCo2eqUnit}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        title={graphTitle}
        highchartsSeriesAndCategories={
          dimensionData?.gHGByGas && dimensionData.gHGByGas[selectedDimension]
            ? (dimensionData.gHGByGas[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"])
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
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} Greenhouse Gas Emissions
        </MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedCo2eqUnit}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.gHGByGas && dimensionData.gHGByGas[selectedDimension]
                ? (dimensionData.gHGByGas[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        {dataInputs?.gHGByGas?.mdInfos && <GraphInfos>{dataInputs.gHGByGas.mdInfos}</GraphInfos>}
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
GhgByGas.getInitialProps = async function({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedSectors: query.sectors
        ? Array.isArray(query.sectors)
          ? (query.sectors as string[])
          : [query.sectors as string]
        : ["Transportation"],
      selectedDimension: (query["dimension"] as GhgByGasDimensions)
        ? (query["dimension"] as GhgByGasDimensions)
        : GhgByGasDimensions.ByGas,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "stacked",
      selectedSource: (query["source"] as string) ? (query["source"] as string) : "CAIT",
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
      selectedCo2eqUnit: (query["emissions-unit"] as Co2eqUnit)
        ? (query["emissions-unit"] as Co2eqUnit)
        : Co2eqUnit.MtCo2eq,
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
      selectedGases: (query["gases"] as string[] | string)
        ? Array.isArray(query["gases"] as string[] | string)
          ? (query["gases"] as string[])
          : [query["gases"] as string]
        : ["CO2", "CH4", "N2O", "F-Gases"],
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query ghgByGasInputs($dimension: GHGByGasDimensions!, $source: String!) {
    gHGByGas {
      mdInfos
      sources(dimension: $dimension)
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
      sectors(source: $source) {
        name
        color
      }
      gases(source: $source) {
        name
        color
      }
      dimensions
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getGhgByGasDimension(
    $sectors: [String!]!
    $gases: [String!]!
    $source: String!
    $groupNames: [String]!
    $groupName: String
    $emissionsUnit: CO2eqUnit!
    $includingLUCF: Boolean!
    $total: Boolean!
    $perCapita: Boolean!
    $bySector: Boolean!
    $byGas: Boolean!
    $yearStart: Int!
    $yearEnd: Int!
    $dimension: GHGByGasDimensions!
  ) {
    gHGByGas {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      total(
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        source: $source
      ) @include(if: $total) {
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
        emissionsUnit: $emissionsUnit
        source: $source
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
      byGas(
        gases: $gases
        groupName: $groupName
        emissionsUnit: $emissionsUnit
        source: $source
        yearStart: $yearStart
        yearEnd: $yearEnd
        includingLUCF: $includingLUCF
      ) @include(if: $byGas) {
        categories
        series {
          name
          data
          color
        }
      }
      perCapita(
        groupNames: $groupNames
        emissionsUnit: $emissionsUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        source: $source
      ) @include(if: $perCapita) {
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
  selectedDimension: GhgByGasDimensions
  selectedCo2eqUnit: GetGhgByGasDimensionQueryVariables["emissionsUnit"]
  selectedGroupNames: GetGhgByGasDimensionQueryVariables["groupNames"]
  selectedGases: GetGhgByGasDimensionQueryVariables["gases"]
  selectedSectors: GetGhgByGasDimensionQueryVariables["sectors"]
  selectedSource: GetGhgByGasDimensionQueryVariables["source"]
  iframe: boolean
  isRange: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | GhgByGasDimensions
  | "selectGroupNames"
  | "selectCo2eqUnit"
  | "selectSectors"
  | "selectGases"
  | "selectSource"
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
      selectedCo2eqUnit?: ReducerState["selectedCo2eqUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedSectors?: ReducerState["selectedSectors"]
      selectedGases?: ReducerState["selectedGases"]
      selectedYearRange?: ReducerState["selectedYearRange"]
      selectedSource?: ReducerState["selectedSource"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case GhgByGasDimensions.ByGas:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: GhgByGasDimensions.ByGas,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      }
    case GhgByGasDimensions.BySector:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: GhgByGasDimensions.BySector,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        selectedSectors: action.payload.selectedSectors,
        isGroupNamesMulti: false,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
      }
    case GhgByGasDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: GhgByGasDimensions.Total,
        isGroupNamesMulti: true,
        selectedCo2eqUnit: Co2eqUnit.MtCo2eq,
        isRange: true,
      }
    case GhgByGasDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: GhgByGasDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedCo2eqUnit: Co2eqUnit.TCo2eq,
        isRange: true,
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectCo2eqUnit":
      return {
        ...prevState,
        selectedCo2eqUnit: action.payload.selectedCo2eqUnit,
      }
    case "selectSource":
      return {
        ...prevState,
        selectedSource: action.payload.selectedSource,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      }
    case "selectGases":
      return {
        ...prevState,
        selectedGases: action.payload.selectedGases,
      }
    case "selectSectors":
      return {
        ...prevState,
        selectedSectors: action.payload.selectedSectors,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedSectors: action.payload.selectedSectors,
        selectedGases: action.payload.selectedGases,
        selectedChartType: "pie",
        isRange: false,
      }
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
      }
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
      }
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
      }
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
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

export default GhgByGas
