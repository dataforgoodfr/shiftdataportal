import energyConversions from "./energyConversions.json";
import { EnergyUnit } from "../types";

export default (unitSource: EnergyUnit, unitTarget: EnergyUnit): number => {
  return energyConversions[unitSource][unitTarget];
};
