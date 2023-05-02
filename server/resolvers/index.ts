import FinalEnergies from "./finalEnergies";
import PrimaryEnergies from "./primaryEnergies";
import Electricity from "./electricity";
import GHGByGas from "./gHGByGas";
import CO2FromEnergy from "./cO2FromEnergy";
import EnergyIntensityGDP from "./energyIntensityGDP";
import Oil from "./oil";
import Gas from "./gas";
import Coal from "./coal";
import Footprint from "./footprint";
import Kaya from "./kaya";
import ImportExport from "./importExport";
import RenewableEnergies from "./renewableEnergies";
import Nuclear from "./nuclear";
import Co2ImportsExports from "./co2ImportsExports";

import { Resolvers } from "../types";

const resolvers: Resolvers = {
  Query: {
    primaryEnergies: () => [],
    finalEnergies: () => [],
    gHGByGas: () => [],
    cO2FromEnergy: () => [],
    electricity: () => [],
    energyIntensityGDP: () => [],
    oil: () => [],
    gas: () => [],
    coal: () => [],
    footprint: () => [],
    kaya: () => [],
    importExport: () => [],
    renewableEnergies: () => [],
    nuclear: () => [],
    co2ImportsExports: () => [],
  },
  FinalEnergies,
  PrimaryEnergies,
  Electricity,
  GHGByGas,
  CO2FromEnergy,
  EnergyIntensityGDP,
  Oil,
  Gas,
  Coal,
  Footprint,
  Kaya,
  ImportExport,
  RenewableEnergies,
  Nuclear,
  Co2ImportsExports,
};

export default resolvers;
