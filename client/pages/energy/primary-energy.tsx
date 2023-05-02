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
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components"

import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  EnergyUnit,
  GetPrimaryEnergyDimensionQuery,
  GetPrimaryEnergyDimensionQueryVariables,
  PrimaryEnergiesDimensions,
  PrimaryEnergyInputsQuery,
  PrimaryEnergyInputsQueryVariables,
} from "../../types"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"
import { ShareChart } from "../../components/Share"

const PrimaryEnergy: NextPage<DefaultProps> = ({ params }) => {
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
      selectedType,
      selectedYearRange,
      selectedEnergyFamilies,
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
  } = useQuery<PrimaryEnergyInputsQuery, PrimaryEnergyInputsQueryVariables>(INPUTS, {
    variables: {
      type: selectedType,
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
      "gdp-unit": selectedGdpUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
      type: selectedType,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyFamilies,
    selectedEnergyUnit,
    selectedGdpUnit,
    selectedGroupNames,
    selectedType,
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
    GetPrimaryEnergyDimensionQuery,
    GetPrimaryEnergyDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      energyUnit: selectedEnergyUnit,
      gdpEnergyType:
        selectedType === "Production" ? "Total Primary Energy Production" : "Total Primary Energy Consumption",
      groupName: selectedGroupNames[0],
      dimension: selectedDimension,
      byEnergyFamily: selectedDimension === "byEnergyFamily",
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      perGDP: selectedDimension === "perGDP",
      gdpUnit: selectedGdpUnit,
      type: selectedType,
      energyFamilies: selectedEnergyFamilies,
      yearStart: 0,
      yearEnd: 3000,
    },
  })
  useEffect(() => {
    if (dimensionData?.primaryEnergies && dimensionData.primaryEnergies[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        dimensionData.primaryEnergies[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"]
      )
    } else if (dimensionData?.energyIntensityGDP?.total) {
      setHighchartsSeriesAndCategories(dimensionData.energyIntensityGDP.total)
    } else {
      setHighchartsSeriesAndCategories({ series: [], categories: [] })
    }
  }, [dimensionData, selectedDimension])

  // Update graph title
  useEffect(() => {
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    setGraphTitle(`Primary Energy ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)

  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.primaryEnergies || !dataInputs.energyIntensityGDP) {
    inputs = <p>Loading...</p>
  } else {
    const {
      energyUnits,
      zones,
      groups,
      countries,
      energyFamilies,
      // This Production or Consumption not the chartType
      types,
      dimensions,
    } = dataInputs.primaryEnergies
    const { gdpUnits } = dataInputs.energyIntensityGDP
    inputs = (
      <Fragment>
        <DimensionsSelect
          dimensions={dimensions}
          onChange={(newDimension) =>
            dispatch({
              type: newDimension as ReducerActions,
              payload: { selectedEnergyFamilies: energyFamilies.map((energyFamily) => energyFamily.name) },
            })
          }
          selectedDimension={selectedDimension}
        />
        <SelectContainer>
          {/* This Production or Consumption not the chartType */}
          <RadioSelect
            label="PROD/CONS"
            inputName="PROD/CONS"
            selectedOption={selectedType}
            options={types}
            onChange={(selectedType) => {
              dispatch({
                type: "selectType",
                payload: { selectedType },
              })
            }}
          />
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.primaryEnergies[selectedDimension]?.multiSelects
                ? dimensionData.primaryEnergies[selectedDimension].multiSelects
                : []),
              ...(dimensionData?.energyIntensityGDP?.total?.multiSelects
                ? dimensionData.energyIntensityGDP.total.multiSelects
                : []),
              ...(dimensionData?.primaryEnergies?.multiSelects ? dimensionData.primaryEnergies.multiSelects : []),
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
                    payload: { selectedEnergyFamilies: energyFamilies.map((item) => item.name) },
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
  const pageTitle = `The Shift Project - ${graphTitle}`
  return (
    <Fragment>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <Nav />
      <Main>
        <CategoryName type="ENERGY" />
        <MainChartTitle>
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} Primary Energy {selectedType}
        </MainChartTitle>
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
          {stackedChartRef?.current?.reflow()}
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        {dataInputs?.primaryEnergies?.mdInfos && <GraphInfos>{dataInputs.primaryEnergies.mdInfos}</GraphInfos>}
        <SharingButtons title={graphTitle} />
        <CTA>
          <CTA.Climate />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  )
}
PrimaryEnergy.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedType: (query.type as string) ? (query.type as string) : "Production",
      selectedEnergyFamilies: query["energy-families"]
        ? Array.isArray(query["energy-families"])
          ? (query["energy-families"] as string[])
          : [query["energy-families"] as string]
        : ["Oil", "Coal", "Gas", "Nuclear"],
      selectedDimension: (query["dimension"] as PrimaryEnergiesDimensions)
        ? (query["dimension"] as PrimaryEnergiesDimensions)
        : PrimaryEnergiesDimensions.ByEnergyFamily,
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
          ? { min: parseInt(query["start"] as string), max: parseInt(query["end"] as string) }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query primaryEnergyInputs($type: String!) {
    energyIntensityGDP {
      gdpUnits
    }
    primaryEnergies {
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
      types
      energyFamilies(type: $type) {
        name
        color
      }
      dimensions
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getPrimaryEnergyDimension(
    $type: String!
    $energyFamilies: [String!]!
    $groupNames: [String]!
    $groupName: String
    $energyUnit: EnergyUnit!
    $byEnergyFamily: Boolean!
    $total: Boolean!
    $perCapita: Boolean!
    $perGDP: Boolean!
    $yearStart: Int!
    $yearEnd: Int!
    $dimension: PrimaryEnergiesDimensions!
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
    primaryEnergies {
      multiSelects(dimension: $dimension, type: $type) {
        name
        data {
          name
          color
        }
      }
      byEnergyFamily(
        energyFamilies: $energyFamilies
        type: $type
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
      total(type: $type, groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd)
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
      perCapita(
        type: $type
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
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
  selectedDimension: PrimaryEnergiesDimensions
  selectedEnergyFamilies: GetPrimaryEnergyDimensionQueryVariables["energyFamilies"]
  selectedEnergyUnit: GetPrimaryEnergyDimensionQueryVariables["energyUnit"]
  selectedGdpUnit: GetPrimaryEnergyDimensionQueryVariables["gdpUnit"]
  selectedGroupNames: GetPrimaryEnergyDimensionQueryVariables["groupNames"]
  selectedType: GetPrimaryEnergyDimensionQueryVariables["type"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | PrimaryEnergiesDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectGdpUnit"
  | "selectEnergyFamilies"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectYears"
  | "selectType"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"]
      selectedGdpUnit?: ReducerState["selectedGdpUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedType?: ReducerState["selectedType"]
      selectedEnergyFamilies?: ReducerState["selectedEnergyFamilies"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case PrimaryEnergiesDimensions.ByEnergyFamily:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: PrimaryEnergiesDimensions.ByEnergyFamily,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
      }
    case PrimaryEnergiesDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: PrimaryEnergiesDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
      }
    case PrimaryEnergiesDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: PrimaryEnergiesDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
        isRange: true,
      }
    case PrimaryEnergiesDimensions.PerGdp:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: PrimaryEnergiesDimensions.PerGdp,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
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
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      }
    case "selectEnergyFamilies":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
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
export default PrimaryEnergy
