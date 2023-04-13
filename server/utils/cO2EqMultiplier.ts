import cO2EqConversions from "./cO2EqConversions.json";
import { Co2eqUnit } from "../types";
export default (unitSource: Co2eqUnit, unitTarget: Co2eqUnit): number => {
  return cO2EqConversions[unitSource][unitTarget];
};
