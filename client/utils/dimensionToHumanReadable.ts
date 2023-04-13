import {
  FinalEnergiesDimensions,
  GasDimensions,
  Co2FromEnergyDimensions,
  ElectricityDimensions,
  EnergyIntensityGdpDimensions,
  GhgByGasDimensions,
  OilDimensions,
  PrimaryEnergiesDimensions,
  FootprintDimensions,
  ImportExportDimensions,
  CoalDimensions,
  RenewableEnergiesDimensions,
  NuclearDimensions,
  Co2ImportsExportsDimensions
} from "../types";
import { IDimension as ReadableIDimension } from "../pages/energy";
export type IDimension =
  | FinalEnergiesDimensions
  | GasDimensions
  | Co2FromEnergyDimensions
  | ElectricityDimensions
  | EnergyIntensityGdpDimensions
  | FinalEnergiesDimensions
  | GasDimensions
  | GhgByGasDimensions
  | OilDimensions
  | PrimaryEnergiesDimensions
  | FootprintDimensions
  | ImportExportDimensions
  | CoalDimensions
  | RenewableEnergiesDimensions
  | NuclearDimensions
  | Co2ImportsExportsDimensions
  | "ranking";
export default function dimensionToHumanReadable(dimension: IDimension): ReadableIDimension["title"]  {
  switch (dimension) {
    case "byGas":
      return "by gas";
    case "perCapita":
      return "per capita";
    case "total":
      return "total";
    case "perGDP":
      return "per GDP";
    case "byEnergyFamily":
      return "by source";
    case "bySector":
      return "by sector";
    case "ranking":
      return "top countries";
    case "provenReserve":
      return "proven reserves";
    case "oldExtrapolation":
      return "old extrapolation";
    case "extrapolation":
      return "extrapolation";
    case "importExport":
      return "import / export";
    case "shareOfPrimaryEnergy":
      return "share of primary energy";
    case "shareOfElectricityGeneration":
      return "share of electricity generation";
    case "byCountry":
      return "by country";
    case "byContinent":
      return "by continent";
    default:
      console.warn(`Dimension : ${dimension} not found, fallbacking to 'Unknown'`);
      return "unknown";
  }
};
