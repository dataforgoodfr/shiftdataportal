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
  Share,
  RadioSelect,
  CTA,
  CategoryName,
  MainChartTitle,
  DimensionsSelect,
  SelectContainer,
  GraphInfos,
  TypesInput,
  SharingButtons,
} from "../../components"
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart"
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl"
import {
  EnergyUnit,
  GetRenewableEnergyDimensionQuery,
  GetRenewableEnergyDimensionQueryVariables,
  RenewableEnergiesDimensions,
  RenewableEnergiesInputsQuery,
  RenewableEnergiesInputsQueryVariables,
} from "../../types"
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton"
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable"

const RenewableEnergy: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedEnergyUnit,
      selectedYearRange,
      selectedType,
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
  } = useQuery<RenewableEnergiesInputsQuery, RenewableEnergiesInputsQueryVariables>(INPUTS, {
    variables: {
      type: selectedType,
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
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
      type: selectedType,
      "energy-families": selectedEnergyFamilies,
    })
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyUnit,
    selectedGroupNames,
    debouncedYearRange,
    isRange,
    isSelectEnergyFamilyDisabled,
    isGroupNamesMulti,
    selectedType,
    selectedEnergyFamilies,
  ])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetRenewableEnergyDimensionQuery,
    GetRenewableEnergyDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      energyUnit: selectedEnergyUnit === "%" ? EnergyUnit.Mtoe : selectedEnergyUnit,
      total: selectedDimension === "total",
      shareOfPrimaryEnergy: selectedDimension === "shareOfPrimaryEnergy",
      byEnergyFamily: selectedDimension === "byEnergyFamily",
      energyFamilies: selectedEnergyFamilies,
      dimension: selectedDimension,
      type: selectedType,
      groupNames: selectedGroupNames,
      groupName: selectedGroupNames[0],
      yearStart: 0,
      yearEnd: 3000,
    },
  })

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : ""
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max
    setGraphTitle(`Renewable Energy ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`)
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange])

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
  } else if (loadingInputs || !dataInputs || !dataInputs.renewableEnergies || !dataInputs.primaryEnergies) {
    inputs = <p>Loading...</p>
  } else {
    const { energyUnits, zones, groups, countries, dimensions, energyFamilies } = dataInputs.renewableEnergies
    const { types } = dataInputs.primaryEnergies
    inputs = (
      <Fragment>
        <div>
          {
            <DimensionsSelect
              dimensions={dimensions}
              onChange={(newDimension) =>
                dispatch({
                  type: newDimension as ReducerActions,
                  payload: { selectedEnergyFamilies: energyFamilies.map(({ name }) => name) },
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
            zones={zones}
            multiSelect={[
              ...(dimensionData?.renewableEnergies?.total?.multiSelects && selectedDimension === "total"
                ? dimensionData.renewableEnergies.total.multiSelects
                : []),
              ...(dimensionData?.renewableEnergies?.shareOfPrimaryEnergy?.multiSelects &&
              selectedDimension === "shareOfPrimaryEnergy"
                ? dimensionData.renewableEnergies.shareOfPrimaryEnergy.multiSelects
                : []),
              ...(dimensionData?.renewableEnergies?.multiSelects ? dimensionData.renewableEnergies.multiSelects : []),
            ]}
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
          {selectedDimension !== "shareOfPrimaryEnergy" && (
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

          <RadioSelect
            label="Type"
            inputName="Type"
            selectedOption={selectedType}
            options={types}
            onChange={(selectedType) => {
              dispatch({
                type: "selectType",
                payload: { selectedType },
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
        title={graphTitle}
        highchartsSeriesAndCategories={
          dimensionData?.renewableEnergies && dimensionData.renewableEnergies[selectedDimension]
            ? (dimensionData.renewableEnergies[
                selectedDimension
              ] as unknown as StackedChartProps["highchartsSeriesAndCategories"])
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
        <CategoryName type="ENERGY" />
        <MainChartTitle>
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} Renewable Energy {selectedType}
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
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.renewableEnergies && dimensionData.renewableEnergies[selectedDimension]
                ? (dimensionData.renewableEnergies[
                    selectedDimension
                  ] as unknown as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.renewableEnergies?.mdInfos && <GraphInfos>{dataInputs.renewableEnergies.mdInfos}</GraphInfos>}
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
RenewableEnergy.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedDimension: (query["dimension"] as RenewableEnergiesDimensions)
        ? (query["dimension"] as RenewableEnergiesDimensions)
        : RenewableEnergiesDimensions.Total,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
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
      selectedEnergyFamilies: query["energy-families"]
        ? Array.isArray(query["energy-families"])
          ? (query["energy-families"] as string[])
          : [query["energy-families"] as string]
        : ["Hydroelectricity", "Biomass and Waste", "Wind", "Geothermal", "Solar, Tide, Wave, Fuel Cell", "Biodiesel"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.TWh,
      // Group name multi only when dimension is "byEnergyFamily"
      isGroupNamesMulti: (query["multi"] as String) === undefined ? true : query["multi"] === "true" ? true : false,
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      selectedType: (query["type"] as string) ? (query["type"] as string) : "Consumption",
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query renewableEnergiesInputs($type: String!) {
    primaryEnergies {
      types
    }
    renewableEnergies {
      mdInfos
      dimensions
      energyUnits
      energyFamilies(type: $type) {
        name
        color
      }
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
    }
  }
`

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getRenewableEnergyDimension(
    $groupNames: [String]!
    $groupName: String
    $energyUnit: EnergyUnit!
    $yearStart: Int!
    $yearEnd: Int!
    $type: String!
    $total: Boolean!
    $shareOfPrimaryEnergy: Boolean!
    $byEnergyFamily: Boolean!
    $dimension: RenewableEnergiesDimensions!
    $energyFamilies: [String]!
  ) {
    renewableEnergies {
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
        multiSelects {
          name
          data {
            name
            color
          }
        }
      }
      shareOfPrimaryEnergy(type: $type, groupNames: $groupNames, yearStart: $yearStart, yearEnd: $yearEnd)
        @include(if: $shareOfPrimaryEnergy) {
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
      total(groupNames: $groupNames, energyUnit: $energyUnit, type: $type, yearStart: $yearStart, yearEnd: $yearEnd)
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
  selectedDimension: RenewableEnergiesDimensions
  selectedEnergyUnit: GetRenewableEnergyDimensionQueryVariables["energyUnit"] | "%"
  selectedGroupNames: GetRenewableEnergyDimensionQueryVariables["groupNames"]
  selectedType: GetRenewableEnergyDimensionQueryVariables["type"]
  selectedEnergyFamilies: GetRenewableEnergyDimensionQueryVariables["energyFamilies"]
  iframe: boolean
  isRange: boolean
  isSelectEnergyFamilyDisabled: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions =
  | RenewableEnergiesDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectEnergyFamilies"
  | "selectDimension"
  | "selectLine"
  | "selectPie"
  | "selectStacked"
  | "selectStackedPercent"
  | "selectRanking"
  | "selectYears"
  | "selectType"
  | "selectEnergyFamilies"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedYearRange?: ReducerState["selectedYearRange"]
      selectedType?: ReducerState["selectedType"]
      selectedEnergyFamilies?: ReducerState["selectedEnergyFamilies"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case RenewableEnergiesDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: RenewableEnergiesDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.TWh,
      }
    case RenewableEnergiesDimensions.ShareOfPrimaryEnergy:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: RenewableEnergiesDimensions.ShareOfPrimaryEnergy,
        isGroupNamesMulti: true,
        selectedEnergyUnit: "%",
      }
    case RenewableEnergiesDimensions.ByEnergyFamily:
      return {
        ...prevState,
        selectedChartType: "stacked",
        chartTypes: ["stacked", "stacked-percent", "pie", "line", "ranking"] as ChartType[],
        selectedDimension: RenewableEnergiesDimensions.ByEnergyFamily,
        // Keep only the first country
        selectedGroupNames: prevState.selectedGroupNames.splice(0, 1),
        isGroupNamesMulti: false,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectEnergyFamilies":
      return {
        ...prevState,
        selectedEnergyFamilies: action.payload.selectedEnergyFamilies,
      }
    case "selectEnergyUnit":
      return {
        ...prevState,
        selectedEnergyUnit: action.payload.selectedEnergyUnit,
      }
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
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

export default RenewableEnergy
