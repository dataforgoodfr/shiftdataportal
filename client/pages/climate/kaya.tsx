import { useQuery } from "@apollo/client"
import gql from "graphql-tag"
import { NextPage } from "next"
import Head from "next/head"
import { ParsedUrlQueryInput } from "querystring"
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react"
import { Range } from "react-input-range"
import { useDebounce } from "use-debounce"
import {
  Footer,
  GroupNamesSelect,
  Main,
  Nav,
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
  GetKayaDimensionQuery,
  GetKayaDimensionQueryVariables,
  KayaDimensions,
  KayaInputsQuery,
  KayaInputsQueryVariables,
} from "../../types"

import useOnYearRangeChange from "../../hooks/useOnYearRangeChange"

const Kaya: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null)
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      selectedGroupNames,
      selectedYearRange,
      isRange,
      chartTypes,
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
  } = useQuery<KayaInputsQuery, KayaInputsQueryVariables>(INPUTS, {
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
      "group-names": selectedGroupNames,
      "is-range": isRange,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
    })
  }, [selectedChartType, chartTypes, selectedDimension, selectedGroupNames, debouncedYearRange, isRange])
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams)

  const [graphTitle, setGraphTitle] = useState<string>("")
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetKayaDimensionQuery,
    GetKayaDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupName: selectedGroupNames[0],
      total: selectedDimension === "total",
    },
  })

  // Update graph title

  useEffect(() => {
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : ""
    setGraphTitle(`KAYA Identity, ${displayedGroupNames} ${selectedYearRange.min}-${selectedYearRange.max}`)
  }, [selectedGroupNames, selectedYearRange])

  const onYearRangeChange = useOnYearRangeChange(dispatch)
  let inputs: any

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>
  } else if (loadingInputs || !dataInputs || !dataInputs.kaya) {
    inputs = <p>Loading...</p>
  } else {
    const { zones, groups, countries } = dataInputs.kaya
    inputs = (
      <Fragment>
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={false}
            multiSelect={[]}
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
        unit={"base 100"}
        isLoading={dimensionLoading}
        type={selectedChartType}
        yearRange={selectedYearRange}
        title={graphTitle}
        highchartsSeriesAndCategories={
          dimensionData?.kaya && dimensionData.kaya[selectedDimension]
            ? ({
                series: dimensionData.kaya[selectedDimension].series,
                categories: dimensionData.kaya[selectedDimension].categories,
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
        <MainChartTitle>{selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} KAYA Identity</MainChartTitle>
        <div>CO2 = Population x GDP per capita x Energy per GDP x CO2 per energy.</div>
        <div>
          {inputs}
          <StackedChart
            onYearRangeChange={onYearRangeChange}
            isRange={isRange}
            ref={stackedChartRef}
            unit={"base 100"}
            isLoading={dimensionLoading}
            type={selectedChartType}
            yearRange={selectedYearRange}
            title={graphTitle}
            highchartsSeriesAndCategories={
              dimensionData?.kaya && dimensionData.kaya[selectedDimension]
                ? ({
                    series: dimensionData.kaya[selectedDimension].series,
                    categories: dimensionData.kaya[selectedDimension].categories,
                  } as StackedChartProps["highchartsSeriesAndCategories"])
                : { series: [], categories: [] }
            }
          />
        </div>
        <ShareChart chartRef={stackedChartRef}></ShareChart>
        {dataInputs?.kaya?.mdInfos && <GraphInfos>{dataInputs.kaya.mdInfos}</GraphInfos>}
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
Kaya.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedDimension: (query["dimension"] as KayaDimensions)
        ? (query["dimension"] as KayaDimensions)
        : KayaDimensions.Total,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
      chartTypes: (query["chart-types"] as ChartType[] | ChartType)
        ? Array.isArray(query["chart-types"] as ChartType[] | ChartType)
          ? (query["chart-types"] as ChartType[])
          : [query["chart-types"] as ChartType]
        : (["line"] as ChartType[]),
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["World"],
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  }
}

export const INPUTS = gql`
  query kayaInputs {
    kaya {
      mdInfos
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
  query getKayaDimension($groupName: String, $total: Boolean!) {
    kaya {
      total(groupName: $groupName) @include(if: $total) {
        categories
        series {
          name
          data
          color
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
  selectedDimension: KayaDimensions
  selectedGroupNames: GetKayaDimensionQueryVariables["groupName"][]
  iframe: boolean
  isRange: boolean
  selectedYearRange: Range
  chartHeight: string
}
type ReducerActions = KayaDimensions | "selectGroupNames" | "selectDimension" | "selectLine" | "selectYears"
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"]
      selectedDimension?: ReducerState["selectedDimension"]
      selectedYearRange?: ReducerState["selectedYearRange"]
    }
  }
> = (prevState, action) => {
  switch (action.type) {
    case KayaDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line"],
        selectedDimension: KayaDimensions.Total,
        isRange: true,
      }
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      }
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
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

export default Kaya
