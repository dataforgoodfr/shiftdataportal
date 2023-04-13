import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { NextPage } from "next";
import Head from "next/head";
import { ParsedUrlQueryInput } from "querystring";
import React, { Fragment, useEffect, useReducer, useState, useRef } from "react";
import { Range } from "react-input-range";
import { useDebounce } from "use-debounce";
import {
  ChartTypesSelect,
  Footer,
  GroupNamesSelect,
  Nav,
  Main,
  Share,
  RadioSelect,
  CTA,
  MainChartTitle,
  CategoryName,
  DimensionsSelect,
  SelectContainer,
  GraphInfos,
  SharingButtons,
} from "../../components";
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart";
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl";
import {
  EnergyUnit,
  GetEnergyIntensityGdpDimensionQuery,
  GetEnergyIntensityGdpDimensionQueryVariables,
  EnergyIntensityGdpDimensions,
  EnergyIntensityGdpInputsQuery,
  EnergyIntensityGdpInputsQueryVariables,
} from "../../types";
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton";
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange";
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable";

const EnergyIntensityGDP: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null);
  // Reducer state
  const [
    {
      selectedDimension,
      selectedChartType,
      isGroupNamesMulti,
      selectedGroupNames,
      selectedEnergyUnit,
      selectedEnergyType,
      selectedGdpUnit,
      selectedYearRange,
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params });
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    EnergyIntensityGdpInputsQuery,
    EnergyIntensityGdpInputsQueryVariables
  >(INPUTS, {
    variables: {
      dimension: selectedDimension,
    },
  });

  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}));

  // Prevent re-fetching data each time year changes
  const [debouncedYearRange] = useDebounce(selectedYearRange, 300);

  // Update the url params when any dependency changes (the array in the useEffect hook)
  useEffect(() => {
    setUrlParams({
      "chart-type": selectedChartType,
      "chart-types": chartTypes,
      "disable-en": isSelectEnergyFamilyDisabled,
      "energy-unit": selectedEnergyUnit,
      "group-names": selectedGroupNames,
      "is-range": isRange,
      "gdp-unit": selectedGdpUnit,
      "energy-type": selectedEnergyType,
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
    });
  }, [
    selectedChartType,
    chartTypes,
    selectedDimension,
    selectedEnergyUnit,
    selectedGroupNames,
    debouncedYearRange,
    isRange,
    isSelectEnergyFamilyDisabled,
    selectedGdpUnit,
    selectedEnergyType,
    isGroupNamesMulti,
  ]);
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams);

  const [graphTitle, setGraphTitle] = useState<string>("");
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetEnergyIntensityGdpDimensionQuery,
    GetEnergyIntensityGdpDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      groupNames: selectedGroupNames,
      energyUnit: selectedEnergyUnit,
      gdpUnit: selectedGdpUnit,
      energyType: selectedEnergyType,
      total: selectedDimension === "total",
      yearStart: 0,
      yearEnd: 3000,
    },
  });

  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : "";
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : "";
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max;
    setGraphTitle(
      `${selectedEnergyType} intensity of GDP${displayedDimension}, ${displayedGroupNames} ${displayedYears}`
    );
  }, [selectedGroupNames, selectedEnergyType, selectedYearRange, selectedDimension, isRange]);

  function handleCsvDownloadClick() {
    stackedChartRef.current.downloadCSV();
  }
  function handleScreenshotDownloadClick() {
    stackedChartRef.current.exportChart();
  }
  const onYearRangeChange = useOnYearRangeChange(dispatch);
  let inputs: any;

  if (errorInputs) {
    inputs = <p>Error, couldn\'t fetch data. Might be an internet connection problem.</p>;
  } else if (loadingInputs || !dataInputs || !dataInputs.energyIntensityGDP) {
    inputs = <p>Loading...</p>;
  } else {
    const { energyUnits, zones, groups, countries, gdpUnits, energyTypes } = dataInputs.energyIntensityGDP;

    inputs = (
      <Fragment>
        <DimensionsSelect
          dimensions={[EnergyIntensityGdpDimensions.Total]}
          selectedDimension={EnergyIntensityGdpDimensions.Total}
        />
        <SelectContainer>
          <GroupNamesSelect
            isLoading={loadingInputs}
            isMulti={isGroupNamesMulti}
            multiSelect={[
              ...(dimensionData?.energyIntensityGDP?.total?.multiSelects
                ? dimensionData.energyIntensityGDP.total.multiSelects
                : []),
              ...(dimensionData?.energyIntensityGDP?.multiSelects ? dimensionData.energyIntensityGDP.multiSelects : []),
            ]}
            zones={zones}
            groups={groups}
            countries={countries}
            value={selectedGroupNames}
            setSelectedGroupNames={(selectedGroupNames) => {
              dispatch({
                type: "selectGroupNames",
                payload: { selectedGroupNames },
              });
            }}
          />
          <RadioSelect
            label="GDP Unit"
            inputName="GDP Unit"
            selectedOption={selectedGdpUnit}
            options={gdpUnits}
            onChange={(selectedGdpUnit) => {
              dispatch({
                type: "selectGdpUnit",
                payload: { selectedGdpUnit },
              });
            }}
          />
          <RadioSelect
            label="Energy Types"
            inputName="Energy Type"
            selectedOption={selectedEnergyType}
            options={energyTypes}
            onChange={(selectedEnergyType) => {
              dispatch({
                type: "selectEnergyType",
                payload: { selectedEnergyType },
              });
            }}
          />
          <RadioSelect
            label="Unit"
            inputName="Unit"
            selectedOption={selectedEnergyUnit}
            options={Object.keys(energyUnits)}
            onChange={(selectedEnergyUnit) => {
              dispatch({
                type: "selectEnergyUnit",
                payload: { selectedEnergyUnit },
              });
            }}
          />
          <ChartTypesSelect
            aria-label="chartTypes"
            selected={selectedChartType}
            available={chartTypes}
            onChange={(value: ChartType) => {
              switch (value) {
                case "line":
                  dispatch({ type: "selectLine" });
                  break;
                case "ranking":
                  dispatch({ type: "selectRanking" });
                  break;
                default:
                  console.warn(`ChartTypes input "${value}" didn't match any chartTypes`);
              }
            }}
          />
        </SelectContainer>
      </Fragment>
    );
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
          dimensionData?.energyIntensityGDP && dimensionData.energyIntensityGDP[selectedDimension]
            ? ({
                series: dimensionData.energyIntensityGDP[selectedDimension].series,
                categories: dimensionData.energyIntensityGDP[selectedDimension].categories,
              } as StackedChartProps["highchartsSeriesAndCategories"])
            : { series: [], categories: [] }
        }
      />
    );
  }
  return (
    <Fragment>
      <Head>
        <title>The Shift Project - {graphTitle}</title>
      </Head>
      <Nav />
      <Main>
        <CategoryName type="ENERGY" />
        <MainChartTitle>Energy Intensity of GDP</MainChartTitle>
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
              dimensionData?.energyIntensityGDP && dimensionData.energyIntensityGDP[selectedDimension]
                ? ({
                    series: dimensionData.energyIntensityGDP[selectedDimension].series,
                    categories: dimensionData.energyIntensityGDP[selectedDimension].categories,
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
        {dataInputs?.energyIntensityGDP?.mdInfos && <GraphInfos>{dataInputs.energyIntensityGDP.mdInfos}</GraphInfos>}
        <SharingButtons title={graphTitle} />
        <CTA>
          <CTA.Climate />
          <CTA.Shift />
        </CTA>
      </Main>
      <Footer />
    </Fragment>
  );
};
EnergyIntensityGDP.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedChartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
      chartTypes: (query["chart-types"] as ChartType[] | ChartType)
        ? Array.isArray(query["chart-types"] as ChartType[] | ChartType)
          ? (query["chart-types"] as ChartType[])
          : [query["chart-types"] as ChartType]
        : (["line", "ranking"] as ChartType[]),
      selectedGroupNames: (query["group-names"] as string[] | string)
        ? Array.isArray(query["group-names"] as string[] | string)
          ? (query["group-names"] as string[])
          : [query["group-names"] as string]
        : ["World"],
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.Mtoe,
      selectedGdpUnit: (query["gdp-unit"] as string) ? (query["gdp-unit"] as string) : "GDP (constant 2010 US$)",
      selectedEnergyType: (query["energy-type"] as string)
        ? (query["energy-type"] as string)
        : "Total Primary Oil Consumption",
      isGroupNamesMulti: true,
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      chartType: (query["chart-type"] as ChartType) ? (query["chart-type"] as ChartType) : "line",
      selectedDimension: (query["dimension"] as EnergyIntensityGdpDimensions)
        ? (query["dimension"] as EnergyIntensityGdpDimensions)
        : EnergyIntensityGdpDimensions.Total,
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  };
};

export const INPUTS = gql`
  query energyIntensityGdpInputs {
    energyIntensityGDP {
      mdInfos
      gdpUnits
      energyUnits
      energyTypes
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
`;

// GraphQL query to get all the chart data
export const GET_DIMENSION = gql`
  query getEnergyIntensityGDPDimension(
    $groupNames: [String]!
    $energyUnit: EnergyUnit!
    $energyType: String!
    $gdpUnit: String!
    $total: Boolean!
    $yearStart: Int!
    $yearEnd: Int!
  ) {
    energyIntensityGDP {
      mdInfos
      multiSelects {
        name
        data {
          name
          color
        }
      }
      total(
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        gdpUnit: $gdpUnit
        energyType: $energyType
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
    }
  }
`;
interface DefaultProps {
  params: ReducerState;
}
interface ReducerState {
  chartTypes: ChartType[];
  selectedChartType: ChartType;
  isGroupNamesMulti: boolean;
  selectedDimension: EnergyIntensityGdpDimensions;
  selectedEnergyUnit: GetEnergyIntensityGdpDimensionQueryVariables["energyUnit"];
  selectedGroupNames: GetEnergyIntensityGdpDimensionQueryVariables["groupNames"];
  selectedEnergyType: GetEnergyIntensityGdpDimensionQueryVariables["energyType"];
  selectedGdpUnit: GetEnergyIntensityGdpDimensionQueryVariables["gdpUnit"];
  iframe: boolean;
  isRange: boolean;
  isSelectEnergyFamilyDisabled: boolean;
  selectedYearRange: Range;
  chartHeight: string;
}
type ReducerActions =
  | EnergyIntensityGdpDimensions
  | "selectGroupNames"
  | "selectEnergyUnit"
  | "selectEnergyType"
  | "selectGdpUnit"
  | "selectEnergyFamilies"
  | "selectLine"
  | "selectRanking"
  | "selectYears";
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions;
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"];
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"];
      selectedEnergyType?: ReducerState["selectedEnergyType"];
      selectedGdpUnit?: ReducerState["selectedGdpUnit"];
      selectedDimension?: ReducerState["selectedDimension"];
      selectedYearRange?: ReducerState["selectedYearRange"];
    };
  }
> = (prevState, action) => {
  switch (action.type) {
    case EnergyIntensityGdpDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: EnergyIntensityGdpDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
        isRange: true,
      };
    case "selectGroupNames":
      return {
        ...prevState,
        selectedGroupNames: action.payload.selectedGroupNames,
      };
    case "selectEnergyUnit":
      return {
        ...prevState,
        selectedEnergyUnit: action.payload.selectedEnergyUnit,
      };
    case "selectEnergyType":
      return {
        ...prevState,
        selectedEnergyType: action.payload.selectedEnergyType,
      };
    case "selectGdpUnit":
      return {
        ...prevState,
        selectedGdpUnit: action.payload.selectedGdpUnit,
      };
    case "selectLine":
      return {
        ...prevState,
        selectedChartType: "line",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      };
    case "selectRanking":
      return {
        ...prevState,
        selectedChartType: "ranking",
        isSelectEnergyFamilyDisabled: true,
        isRange: false,
      };
    case "selectYears":
      return {
        ...prevState,
        selectedYearRange: action.payload.selectedYearRange,
      };
    default:
      console.warn(`Reducer didn't match any action of type ${action.type}`);
      return prevState;
  }
};

export default EnergyIntensityGDP;
