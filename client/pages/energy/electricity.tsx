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
  GetElectricityDimensionQuery,
  GetElectricityDimensionQueryVariables,
  ElectricityDimensions,
  ElectricityInputsQuery,
  ElectricityInputsQueryVariables,
  ElectricityTypes,
} from "../../types"
import { DownloadScreenshotButton, IframeButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"
import { ShareChart } from "../../components/Share"

const Electricity: NextPage<DefaultProps> = ({ params }) => {
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
      selectedGenerationEnergyFamilies,
      selectedCapacityEnergyFamilies,
      selectedType,
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
  } = useQuery<ElectricityInputsQuery, ElectricityInputsQueryVariables>(INPUTS, {
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
      "ef-generation": selectedGenerationEnergyFamilies,
      "ef-capacity": selectedCapacityEnergyFamilies,
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      "gdp-unit": selectedGdpUnit,
      type: selectedType,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedGenerationEnergyFamilies,
    selectedCapacityEnergyFamilies,
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
    GetElectricityDimensionQuery,
    GetElectricityDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      energyUnit: selectedEnergyUnit,
      groupName: selectedGroupNames[0],
      dimension: selectedDimension,
      capacityEnergyFamilies: selectedCapacityEnergyFamilies,
      generationEnergyFamilies: selectedGenerationEnergyFamilies,
      type: selectedType,
      gdpEnergyType: "Total Electricity Consumption",
      byEnergyFamily: selectedDimension === "byEnergyFamily",
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      perGDP: selectedDimension === "perGDP",
      gdpUnit: selectedGdpUnit,
      yearStart: 0,
      yearEnd: 3000,
    },
  })
  useEffect(() => {
    if (dimensionData?.electricity && dimensionData.electricity[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        dimensionData.electricity[selectedDimension] as StackedChartProps["highchartsSeriesAndCategories"]
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
    setGraphTitle(`Electricity ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.electricity) {
    inputs = <p>Loading...</p>
  } else {
    const {
      energyUnits,
      zones,
      groups,
      countries,
      capacityEnergyFamilies,
      generationEnergyFamilies,
      dimensions,
      types,
    } = dataInputs.electricity
    const { gdpUnits } = dataInputs.energyIntensityGDP
    inputs = (
      <Fragment>
        <div>
          {
            <DimensionsSelect
              dimensions={dimensions}
              onChange={(newDimension) =>
                dispatch({
                  type: newDimension as ReducerActions,
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
              ...(dimensionData?.electricity[selectedDimension]?.multiSelects
                ? dimensionData.electricity[selectedDimension].multiSelects
                : []),
              ...(dimensionData?.energyIntensityGDP?.total?.multiSelects
                ? dimensionData.energyIntensityGDP.total.multiSelects
                : []),
              ...(dimensionData?.electricity?.multiSelects ? dimensionData.electricity.multiSelects : []),
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
          {selectedDimension === "byEnergyFamily" && selectedType === "Generation" && (
            <TypesInput
              label="Source"
              typeName="Source"
              isLoading={loadingInputs}
              types={generationEnergyFamilies}
              selectedTypes={selectedGenerationEnergyFamilies}
              setSelectedTypes={(selectedGenerationEnergyFamilies) => {
                dispatch({
                  type: "selectGenerationEnergyFamilies",
                  payload: { selectedGenerationEnergyFamilies },
                })
              }}
            />
          )}
          {selectedDimension === "byEnergyFamily" && selectedType === "Capacity" && (
            <TypesInput
              label="Source"
              typeName="Source"
              isLoading={loadingInputs}
              types={capacityEnergyFamilies}
              selectedTypes={selectedCapacityEnergyFamilies}
              setSelectedTypes={(selectedCapacityEnergyFamilies) => {
                dispatch({
                  type: "selectCapacityEnergyFamilies",
                  payload: { selectedCapacityEnergyFamilies },
                })
              }}
            />
          )}
          {(selectedDimension === "byEnergyFamily" || selectedDimension === "total") && (
            <RadioSelect
              label="Generation / Capacity"
              inputName="Generation / Capacity"
              selectedOption={selectedType}
              options={types}
              onChange={(selectedType) => {
                dispatch({
                  type: "selectType",
                  payload: { selectedType },
                })
              }}
            />
          )}
          {selectedType === "Generation" && (
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
                      selectedGenerationEnergyFamilies: generationEnergyFamilies.map((item) => item.name),
                      selectedCapacityEnergyFamilies: capacityEnergyFamilies.map((item) => item.name),
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
        unit={selectedType === "Generation" ? selectedEnergyUnit : "GW"}
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
        <MainChartTitle>Electricity {selectedType}</MainChartTitle>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={selectedType === "Generation" ? selectedEnergyUnit : "GW"}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            highchartsSeriesAndCategories={highchartsSeriesAndCategories}
            title={graphTitle}
          />
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        {dataInputs?.electricity?.mdInfos && <GraphInfos>{dataInputs.electricity.mdInfos}</GraphInfos>}
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
Electricity.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedGenerationEnergyFamilies: query["ef-generation"]
        ? Array.isArray(query["ef-generation"])
          ? (query["ef-generation"] as string[])
          : [query["ef-generation"] as string]
        : ["Oil", "Coal", "Gas", "Nuclear"],
      selectedCapacityEnergyFamilies: query["ef-capacity"]
        ? Array.isArray(query["ef-capacity"])
          ? (query["ef-capacity"] as string[])
          : [query["ef-capacity"] as string]
        : [
            "Fossil Fuels",
            "Hydroelectricity",
            "Nuclear",
            "Hydroelectric Pumped Storage",
            "Wind",
            "Solar, Tide, Wave, Fuel Cell",
            "Biomass and Waste",
            "Geothermal",
          ],
      selectedDimension: (query["dimension"] as ElectricityDimensions)
        ? (query["dimension"] as ElectricityDimensions)
        : ElectricityDimensions.ByEnergyFamily,
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
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.TWh,
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
      selectedType: (query["type"] as ElectricityTypes)
        ? (query["type"] as ElectricityTypes)
        : ElectricityTypes.Generation,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query electricityInputs {
    energyIntensityGDP {
      gdpUnits
    }
    electricity {
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
      generationEnergyFamilies {
        name
        color
      }
      capacityEnergyFamilies {
        name
        color
      }
      dimensions
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getElectricityDimension(
    $generationEnergyFamilies: [String]!
    $capacityEnergyFamilies: [String]!
    $groupNames: [String]!
    $groupName: String
    $energyUnit: EnergyUnit!
    $byEnergyFamily: Boolean!
    $total: Boolean!
    $perCapita: Boolean!
    $perGDP: Boolean!
    $yearStart: Int!
    $yearEnd: Int!
    $dimension: ElectricityDimensions!
    $gdpUnit: String!
    $gdpEnergyType: String!
    $type: ElectricityTypes!
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
    electricity {
      multiSelects(dimension: $dimension) {
        name
        data {
          name
          color
        }
      }
      byEnergyFamily(
        generationEnergyFamilies: $generationEnergyFamilies
        capacityEnergyFamilies: $capacityEnergyFamilies
        energyUnit: $energyUnit
        groupName: $groupName
        yearStart: $yearStart
        yearEnd: $yearEnd
        type: $type
      ) @include(if: $byEnergyFamily) {
        categories
        series {
          name
          data
          color
        }
      }
      total(groupNames: $groupNames, energyUnit: $energyUnit, yearStart: $yearStart, yearEnd: $yearEnd, type: $type)
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
  selectedDimension: ElectricityDimensions
  selectedGenerationEnergyFamilies: GetElectricityDimensionQueryVariables["generationEnergyFamilies"]
  selectedCapacityEnergyFamilies: GetElectricityDimensionQueryVariables["capacityEnergyFamilies"]
  selectedType: GetElectricityDimensionQueryVariables["type"]
  selectedEnergyUnit: GetElectricityDimensionQueryVariables["energyUnit"]
  selectedGdpUnit: GetElectricityDimensionQueryVariables["gdpUnit"]
  selectedGroupNames: GetElectricityDimensionQueryVariables["groupNames"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | ElectricityDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectGdpUnit"
  | "selectCapacityEnergyFamilies"
  | "selectGenerationEnergyFamilies"
  | "selectType"
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
      selectedGenerationEnergyFamilies?: ReducerState["selectedGenerationEnergyFamilies"]
      selectedCapacityEnergyFamilies?: ReducerState["selectedCapacityEnergyFamilies"]
      selectedType?: ReducerState["selectedType"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case ElectricityDimensions.ByEnergyFamily:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: ElectricityDimensions.ByEnergyFamily,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.TWh,
        isRange: true,
      }
    case ElectricityDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: ElectricityDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.TWh,
        isRange: true,
      }
    case ElectricityDimensions.PerCapita:
      return {
        ...prevState,
        selectedType: ElectricityTypes.Generation,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: ElectricityDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.KWh,
        isRange: true,
      }
    case ElectricityDimensions.PerGdp:
      return {
        ...prevState,
        selectedType: ElectricityTypes.Generation,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: ElectricityDimensions.PerGdp,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.KWh,
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
    case "selectGenerationEnergyFamilies":
      return {
        ...prevState,
        selectedGenerationEnergyFamilies: action.payload.selectedGenerationEnergyFamilies,
      }
    case "selectCapacityEnergyFamilies":
      return {
        ...prevState,
        selectedCapacityEnergyFamilies: action.payload.selectedCapacityEnergyFamilies,
      }
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      }
    case "selectPie":
      return {
        ...prevState,
        selectedGenerationEnergyFamilies: action.payload.selectedGenerationEnergyFamilies,
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

export default Electricity
