import cO2Conversions from "./cO2Conversions.json";
import { Co2Unit } from "../types";

export default (unitSource: Co2Unit, unitTarget: Co2Unit): number => {
  return cO2Conversions[unitSource][unitTarget];
};
