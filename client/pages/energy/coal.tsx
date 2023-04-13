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
  CategoryName,
  MainChartTitle,
  DimensionsSelect,
  SelectContainer,
  GraphInfos,
  TypesInput,
  SharingButtons,
} from "../../components";
import StackedChart, { ChartType, StackedChartProps } from "../../components/StackedChart";
import useSyncParamsWithUrl from "../../hooks/useSyncParamsWithUrl";
import {
  EnergyUnit,
  GetCoalDimensionQuery,
  GetCoalDimensionQueryVariables,
  CoalDimensions,
  CoalInputsQuery,
  CoalInputsQueryVariables,
} from "../../types";
import { DownloadScreenshotButton, ExportDataButton, IframeButton } from "../../components/LightButton";
import useOnYearRangeChange from "../../hooks/useOnYearRangeChange";
import dimensionToHumanReadable from "../../utils/dimensionToHumanReadable";

const Coal: NextPage<DefaultProps> = ({ params }) => {
  const stackedChartRef = useRef(null);
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
      isRange,
      chartTypes,
      isSelectEnergyFamilyDisabled,
      selectedImportExportTypes,
      chartHeight,
      iframe,
    },
    dispatch,
  ] = useReducer(reducer, { ...params });
  // Query all the inputs options, automatically re-fetches when a variable changes
  const { loading: loadingInputs, data: dataInputs, error: errorInputs } = useQuery<
    CoalInputsQuery,
    CoalInputsQueryVariables
  >(INPUTS, {
    variables: {
      countriesOnly: selectedDimension === "importExport",
    },
  });
  // Manage specific state with URL params
  const [urlParams, setUrlParams] = useState<ParsedUrlQueryInput>(() => ({}));
  // The data used in the graph
  const [highchartsSeriesAndCategories, setHighchartsSeriesAndCategories] = useState({ series: [], categories: [] });
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
      dimension: selectedDimension,
      end: debouncedYearRange.max,
      start: debouncedYearRange.min,
      multi: isGroupNamesMulti,
      type: selectedType,
      "import-types": selectedImportExportTypes,
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
    isGroupNamesMulti,
    selectedType,
    selectedImportExportTypes,
  ]);
  // Applies the urlParams change to the real URL.
  useSyncParamsWithUrl(urlParams);

  const [graphTitle, setGraphTitle] = useState<string>("");
  // Fetches the graph data, automatically re-fetches when any variable changes
  const { data: dimensionData, loading: dimensionLoading } = useQuery<
    GetCoalDimensionQuery,
    GetCoalDimensionQueryVariables
  >(GET_DIMENSION, {
    variables: {
      energyUnit: selectedEnergyUnit,
      total: selectedDimension === "total",
      perCapita: selectedDimension === "perCapita",
      importExport: selectedDimension === "importExport",
      importExportsTypes: selectedImportExportTypes,
      type: selectedType,
      groupNames: selectedGroupNames,
      yearStart: 0,
      yearEnd: 3000,
    },
  });

  useEffect(() => {
    if (dimensionData?.coal && dimensionData.coal[selectedDimension]) {
      setHighchartsSeriesAndCategories(
        (dimensionData.coal[selectedDimension] as unknown) as StackedChartProps["highchartsSeriesAndCategories"]
      );
    } else if (dimensionData?.importExport?.total) {
      setHighchartsSeriesAndCategories(dimensionData.importExport.total);
    } else {
      setHighchartsSeriesAndCategories({ series: [], categories: [] });
    }
  }, [dimensionData, selectedDimension]);
  // Update graph title
  useEffect(() => {
    const displayedDimension = selectedDimension !== "total" ? ` ${dimensionToHumanReadable(selectedDimension)}` : "";
    const displayedGroupNames = selectedGroupNames.length === 1 ? selectedGroupNames[0] + "," : "";
    const displayedYears = isRange ? `${selectedYearRange.min}-${selectedYearRange.max}` : selectedYearRange.max;
    setGraphTitle(`Coal ${selectedType}${displayedDimension}, ${displayedGroupNames} ${displayedYears}`);
  }, [selectedGroupNames, selectedType, selectedYearRange, selectedDimension, isRange]);

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
  } else if (
    loadingInputs ||
    !dataInputs ||
    !dataInputs.coal ||
    !dataInputs.primaryEnergies ||
    !dataInputs.importExport
  ) {
    inputs = <p>Loading...</p>;
  } else {
    const { energyUnits, zones, groups, countries, dimensions } = dataInputs.coal;
    const { types } = dataInputs.primaryEnergies;
    const { importExportTypes } = dataInputs.importExport;
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
              ...(dimensionData?.coal?.total?.multiSelects && selectedDimension === "total"
                ? dimensionData.coal.total.multiSelects
                : []),
              ...(dimensionData?.coal?.perCapita?.multiSelects && selectedDimension === "perCapita"
                ? dimensionData.coal.perCapita.multiSelects
                : []),
              ...(dimensionData?.importExport?.total?.multiSelects && selectedDimension === "importExport"
                ? dimensionData?.importExport?.total?.multiSelects
                : []),
              ...(dimensionData?.coal?.multiSelects ? dimensionData.coal.multiSelects : []),
            ]}
            zones={zones ? zones : []}
            groups={groups ? groups : []}
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
          {selectedDimension !== "importExport" && (
            <RadioSelect
              label="Type"
              inputName="Type"
              selectedOption={selectedType}
              options={types}
              onChange={(selectedType) => {
                dispatch({
                  type: "selectType",
                  payload: { selectedType },
                });
              }}
            />
          )}

          {selectedDimension === "importExport" && (
            <TypesInput
              typeName="Import/Export"
              label="Import/Export"
              isLoading={loadingInputs}
              types={importExportTypes.map((type) => ({ name: type, color: "#000000" }))}
              selectedTypes={selectedImportExportTypes}
              setSelectedTypes={(selectedImportExportTypes) => {
                dispatch({
                  type: "selectImportExportTypes",
                  payload: { selectedImportExportTypes },
                });
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
                  });
                  break;
                case "line":
                  dispatch({ type: "selectLine" });
                  break;
                case "stacked":
                  dispatch({ type: "selectStacked" });
                  break;
                case "ranking":
                  dispatch({ type: "selectRanking" });
                  break;
                case "stacked-percent":
                  dispatch({ type: "selectStackedPercent" });
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
        highchartsSeriesAndCategories={highchartsSeriesAndCategories}
        title={graphTitle}
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
        <MainChartTitle>
          {selectedGroupNames.length === 1 && `${selectedGroupNames[0]}`} Coal{" "}
          {selectedDimension !== "importExport" && selectedType}
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
        </div>
        <Share>
          <DownloadScreenshotButton onClick={handleScreenshotDownloadClick} />
          <ExportDataButton onClick={handleCsvDownloadClick} />
          <IframeButton />
        </Share>
        {dataInputs?.coal?.mdInfos && <GraphInfos>{dataInputs.coal.mdInfos}</GraphInfos>}
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
Coal.getInitialProps = async function ({ query }) {
  // Get all the parameters from the URL or set default state
  return {
    params: {
      // If URL params specifies that it is an iframe set iframe to true else false
      iframe: (query["iframe"] as string) ? JSON.parse(query["iframe"] as string) : false,
      selectedDimension: (query["dimension"] as CoalDimensions)
        ? (query["dimension"] as CoalDimensions)
        : CoalDimensions.Total,
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
      selectedEnergyUnit: (query["energy-unit"] as EnergyUnit) ? (query["energy-unit"] as EnergyUnit) : EnergyUnit.Mtoe,
      // Group name multi only when dimension is "byEnergyFamily"
      isGroupNamesMulti: (query["multi"] as String) === undefined ? true : query["multi"] === "true" ? true : false,
      selectedYearRange:
        query["start"] && query["end"]
          ? {
              min: parseInt(query["start"] as string),
              max: parseInt(query["end"] as string),
            }
          : { min: null, max: null },
      selectedImportExportTypes: (query["import-types"] as string[] | string)
        ? Array.isArray(query["import-types"] as string[] | string)
          ? (query["import-types"] as string[])
          : [query["import-types"] as string]
        : ["Imports", "Exports", "Net Imports"],
      isRange: (query["is-range"] as string) ? JSON.parse(query["is-range"] as string) : true,
      isSelectEnergyFamilyDisabled: (query["disable-en"] as string) ? JSON.parse(query["disable-en"] as string) : false,
      selectedType: (query["type"] as string) ? (query["type"] as string) : "Consumption",
      chartHeight: (query["chart-height"] as string) ? (query["chart-height"] as string) : "75rem",
    },
  };
};

export const INPUTS = gql`
  query coalInputs($countriesOnly: Boolean!) {
    primaryEnergies {
      types
    }
    importExport {
      importExportTypes: types
    }
    coal {
      mdInfos
      dimensions
      energyUnits
      groups @skip(if: $countriesOnly) {
        name
        color
      }
      zones @skip(if: $countriesOnly) {
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
  query getCoalDimension(
    $groupNames: [String]!
    $energyUnit: EnergyUnit!
    $yearStart: Int!
    $perCapita: Boolean!
    $yearEnd: Int!
    $type: String!
    $total: Boolean!
    $importExport: Boolean!
    $importExportsTypes: [String]!
  ) {
    importExport {
      total(
        groupNames: $groupNames
        types: $importExportsTypes
        energyFamily: "Coal"
        yearStart: $yearStart
        yearEnd: $yearEnd
      ) @include(if: $importExport) {
        multiSelects {
          name
          data {
            name
            color
          }
        }
        categories
        series {
          name
          data
          dashStyle
          color
        }
      }
    }
    coal {
      multiSelects {
        name
        data {
          name
          color
        }
      }
      perCapita(
        groupNames: $groupNames
        energyUnit: $energyUnit
        yearStart: $yearStart
        yearEnd: $yearEnd
        type: $type
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
`;
interface DefaultProps {
  params: ReducerState;
}
interface ReducerState {
  chartTypes: ChartType[];
  selectedChartType: ChartType;
  isGroupNamesMulti: boolean;
  selectedDimension: CoalDimensions;
  selectedEnergyUnit: GetCoalDimensionQueryVariables["energyUnit"];
  selectedGroupNames: GetCoalDimensionQueryVariables["groupNames"];
  selectedType: GetCoalDimensionQueryVariables["type"];
  selectedImportExportTypes: GetCoalDimensionQueryVariables["importExportsTypes"];
  iframe: boolean;
  isRange: boolean;
  isSelectEnergyFamilyDisabled: boolean;
  selectedYearRange: Range;
  chartHeight: string;
}
type ReducerActions =
  | CoalDimensions
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
  | "selectImportExportTypes";
const reducer: React.Reducer<
  ReducerState,
  {
    type: ReducerActions;
    payload?: {
      selectedGroupNames?: ReducerState["selectedGroupNames"];
      selectedEnergyUnit?: ReducerState["selectedEnergyUnit"];
      selectedDimension?: ReducerState["selectedDimension"];
      selectedYearRange?: ReducerState["selectedYearRange"];
      selectedType?: ReducerState["selectedType"];
      selectedImportExportTypes?: ReducerState["selectedImportExportTypes"];
    };
  }
> = (prevState, action) => {
  switch (action.type) {
    case CoalDimensions.Total:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: CoalDimensions.Total,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Mtoe,
      };
    case CoalDimensions.PerCapita:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"],
        selectedDimension: CoalDimensions.PerCapita,
        isGroupNamesMulti: true,
        selectedEnergyUnit: EnergyUnit.Toe,
        isRange: true,
        showUnitSelect: true,
      };
    case CoalDimensions.ImportExport:
      return {
        ...prevState,
        selectedChartType: "line",
        chartTypes: ["line", "ranking"] as ChartType[],
        selectedDimension: CoalDimensions.ImportExport,
        isGroupNamesMulti: true,
        showUnitSelect: false,
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
    case "selectType":
      return {
        ...prevState,
        selectedType: action.payload.selectedType,
      };
    case "selectImportExportTypes":
      return {
        ...prevState,
        selectedImportExportTypes: action.payload.selectedImportExportTypes,
      };
    case "selectDimension":
      return {
        ...prevState,
        selectedDimension: action.payload.selectedDimension,
      };
    case "selectStacked":
      return {
        ...prevState,
        selectedChartType: "stacked",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
      };
    case "selectStackedPercent":
      return {
        ...prevState,
        selectedChartType: "stacked-percent",
        isRange: true,
        isSelectEnergyFamilyDisabled: false,
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

export default Coal;
