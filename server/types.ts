import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from './server';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  JSON: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};


export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

/** All the CO2 equivalent units available. */
export enum Co2eqUnit {
  GtCo2eq = 'GtCO2eq',
  MtCo2eq = 'MtCO2eq',
  KtCo2eq = 'KtCO2eq',
  GtCeq = 'GtCeq',
  MtCeq = 'MtCeq',
  KtCeq = 'KtCeq',
  TCo2eq = 'tCO2eq'
}

export type Co2FromEnergy = {
  __typename?: 'CO2FromEnergy';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  emissionsUnits?: Maybe<Scalars['JSON']>;
  /** Sorted energy families by total of each one. */
  energyFamilies: Array<NameColor>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  gdpUnits: Array<Scalars['String']>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<Co2FromEnergyDimensions>;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
  perCapita: DimensionResult;
  perGDP: DimensionResult;
  byEnergyFamily: DimensionResult;
};


export type Co2FromEnergyMultiSelectsArgs = {
  dimension: Co2FromEnergyDimensions;
};


export type Co2FromEnergyTotalArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type Co2FromEnergyPerCapitaArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type Co2FromEnergyPerGdpArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  gdpUnit: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type Co2FromEnergyByEnergyFamilyArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  energyFamilies: Array<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum Co2FromEnergyDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  PerGdp = 'perGDP',
  ByEnergyFamily = 'byEnergyFamily'
}

export type Co2ImportsExports = {
  __typename?: 'Co2ImportsExports';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  multiSelects: Array<MultiSelect>;
  countries: Array<NameColor>;
  /** Will return CO2 imports, exports and territorial emissions type name */
  types: Array<Scalars['String']>;
  /** Units is all the units available for conversion */
  emissionsUnits?: Maybe<Scalars['JSON']>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<Co2ImportsExportsDimensions>;
  /** Total imports and/or exports of CO2 per country */
  total: DimensionResult;
  /** Get CO2 imports and exports by country from one country */
  byCountry: DimensionResult;
  /** Get CO2 imports and exports by continent from one country */
  byContinent: DimensionResult;
  /** Get CO2 imports and export by sector from one country */
  bySector: DimensionResult;
};


export type Co2ImportsExportsCountriesArgs = {
  dimension: Co2ImportsExportsDimensions;
};


export type Co2ImportsExportsTypesArgs = {
  dimension: Co2ImportsExportsDimensions;
};


export type Co2ImportsExportsTotalArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  types: Array<Maybe<Scalars['String']>>;
  emissionsUnit?: Maybe<Co2eqUnit>;
};


export type Co2ImportsExportsByCountryArgs = {
  groupName?: Maybe<Scalars['String']>;
  types: Array<Maybe<Scalars['String']>>;
  numberOfCountries: Scalars['Int'];
};


export type Co2ImportsExportsByContinentArgs = {
  groupName?: Maybe<Scalars['String']>;
  types: Array<Maybe<Scalars['String']>>;
};


export type Co2ImportsExportsBySectorArgs = {
  groupName?: Maybe<Scalars['String']>;
  types: Array<Maybe<Scalars['String']>>;
  numberOfSectors: Scalars['Int'];
};

export enum Co2ImportsExportsDimensions {
  Total = 'total',
  ByCountry = 'byCountry',
  ByContinent = 'byContinent',
  BySector = 'bySector'
}

/** All the CO2 units available. */
export enum Co2Unit {
  GtCo2 = 'GtCO2',
  MtCo2 = 'MtCO2',
  KtCo2 = 'KtCO2',
  GtC = 'GtC',
  MtC = 'MtC',
  KtC = 'KtC',
  TCo2 = 'tCO2',
  Kco2 = 'KCO2'
}

export type Coal = {
  __typename?: 'Coal';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  countries: Array<NameColor>;
  dimensions: Array<CoalDimensions>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  /** Units is all the units available for conversion */
  multiSelects: Array<MultiSelect>;
  energyUnits?: Maybe<Scalars['JSON']>;
  total: DimensionResult;
  perCapita: DimensionResult;
};


export type CoalTotalArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};


export type CoalPerCapitaArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};

export enum CoalDimensions {
  ImportExport = 'importExport',
  Total = 'total',
  PerCapita = 'perCapita'
}

export enum DashStyle {
  Dash = 'Dash',
  DashDot = 'DashDot',
  Dot = 'Dot',
  LongDash = 'LongDash',
  LongDashDot = 'LongDashDot',
  LongDashDotDot = 'LongDashDotDot',
  ShortDash = 'ShortDash',
  ShortDashDot = 'ShortDashDot',
  ShortDashDotDot = 'ShortDashDotDot',
  ShortDot = 'ShortDot',
  Solid = 'Solid'
}

export type DimensionResult = {
  __typename?: 'DimensionResult';
  categories: Array<Scalars['String']>;
  series: Array<Maybe<Serie>>;
  multiSelects?: Maybe<Array<MultiSelect>>;
};

export type Electricity = {
  __typename?: 'Electricity';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  capacityEnergyFamilies: Array<NameColor>;
  generationEnergyFamilies: Array<NameColor>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  /** Available dimensions e.g. by energy family, per capita, total */
  dimensions: Array<ElectricityDimensions>;
  /** Types are Generation or Capacity */
  types: Array<Scalars['String']>;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
  /** Share of primary energy by energy families */
  byEnergyFamily: DimensionResult;
  /** Per capita */
  perCapita: DimensionResult;
};


export type ElectricityMultiSelectsArgs = {
  dimension: ElectricityDimensions;
};


export type ElectricityTotalArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: ElectricityTypes;
};


export type ElectricityByEnergyFamilyArgs = {
  capacityEnergyFamilies: Array<Maybe<Scalars['String']>>;
  generationEnergyFamilies: Array<Maybe<Scalars['String']>>;
  energyUnit?: Maybe<EnergyUnit>;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: ElectricityTypes;
};


export type ElectricityPerCapitaArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum ElectricityDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  ByEnergyFamily = 'byEnergyFamily',
  PerGdp = 'perGDP'
}

export enum ElectricityTypes {
  Generation = 'Generation',
  Capacity = 'Capacity'
}

export type EnergyIntensityGdp = {
  __typename?: 'EnergyIntensityGDP';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  energyTypes: Array<Scalars['String']>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  gdpUnits: Array<Scalars['String']>;
  /** Total of Primary Oil, Final Energy, Electricity or Primary Energy Consumption by different GDP units */
  total: DimensionResult;
};


export type EnergyIntensityGdpTotalArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  energyType: Scalars['String'];
  gdpUnit: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum EnergyIntensityGdpDimensions {
  Total = 'total'
}

/** All the energy units available. */
export enum EnergyUnit {
  Mtoe = 'Mtoe',
  Mbtu = 'Mbtu',
  MbPerD = 'Mb_per_d',
  Mtce = 'Mtce',
  TcfGas = 'Tcf_gas',
  Bcm = 'Bcm',
  TWh = 'TWh',
  GblPerYr = 'Gbl_per_yr',
  Tj = 'TJ',
  Mmbtu = 'Mmbtu',
  Ej = 'EJ',
  Toe = 'toe',
  KWh = 'KWh'
}

/** The World Final Energy History. */
export type FinalEnergies = {
  __typename?: 'FinalEnergies';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  energyFamilies: Array<NameColor>;
  sectors: Array<NameColor>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  /** Multi-select presets */
  multiSelects: Array<MultiSelect>;
  /** Available dimensions e.g. by energy family, by sector, per capita, total */
  dimensions: Array<FinalEnergiesDimensions>;
  /** Share of primary energy by energy families */
  byEnergyFamily: DimensionResult;
  bySector: DimensionResult;
  /** Per capita */
  perCapita: DimensionResult;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
};


/** The World Final Energy History. */
export type FinalEnergiesMultiSelectsArgs = {
  dimension: FinalEnergiesDimensions;
};


/** The World Final Energy History. */
export type FinalEnergiesByEnergyFamilyArgs = {
  energyFamilies?: Maybe<Array<Maybe<Scalars['String']>>>;
  energyUnit: EnergyUnit;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


/** The World Final Energy History. */
export type FinalEnergiesBySectorArgs = {
  sectors: Array<Scalars['String']>;
  energyUnit: EnergyUnit;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


/** The World Final Energy History. */
export type FinalEnergiesPerCapitaArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


/** The World Final Energy History. */
export type FinalEnergiesTotalArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum FinalEnergiesDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  ByEnergyFamily = 'byEnergyFamily',
  BySector = 'bySector',
  PerGdp = 'perGDP'
}

export type Footprint = {
  __typename?: 'Footprint';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  emissionsUnits?: Maybe<Scalars['JSON']>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  gdpUnits: Array<Scalars['String']>;
  /** Scopes will fetch 'Carbon Footprint' and 'Territorial Emissions' */
  scopes: Array<Scalars['String']>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<FootprintDimensions>;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
  perCapita: DimensionResult;
  perGDP: DimensionResult;
};


export type FootprintMultiSelectsArgs = {
  dimension: FootprintDimensions;
};


export type FootprintTotalArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  scopes: Array<Maybe<Scalars['String']>>;
};


export type FootprintPerCapitaArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  scopes: Array<Maybe<Scalars['String']>>;
};


export type FootprintPerGdpArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  gdpUnit: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  scopes: Array<Maybe<Scalars['String']>>;
};

export enum FootprintDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  PerGdp = 'perGDP'
}

export type Gas = {
  __typename?: 'Gas';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  countries: Array<NameColor>;
  dimensions: Array<GasDimensions>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  /** Sectors available */
  sectors: Array<NameColor>;
  /** Final consumption by sector */
  bySector: DimensionResult;
  provenReserve: DimensionResult;
  total: DimensionResult;
  perCapita: DimensionResult;
};


export type GasBySectorArgs = {
  sectors: Array<Scalars['String']>;
  energyUnit: EnergyUnit;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type GasProvenReserveArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type GasTotalArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};


export type GasPerCapitaArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum GasDimensions {
  ProvenReserve = 'provenReserve',
  ImportExport = 'importExport',
  Total = 'total',
  PerCapita = 'perCapita',
  BySector = 'bySector'
}

export type GhgByGas = {
  __typename?: 'GHGByGas';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** All the units available for conversion */
  emissionsUnits?: Maybe<Scalars['JSON']>;
  gases: Array<NameColor>;
  sectors: Array<NameColor>;
  /** Sources is the names of the datasets sources */
  sources: Array<Scalars['String']>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** GDP units */
  gdpUnits: Array<Scalars['String']>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  /** Available dimensions e.g. by gas, by sector, per capita, total */
  dimensions: Array<GhgByGasDimensions>;
  /** Share of emissions by gases */
  byGas: DimensionResult;
  /** Share of emissions by sector */
  bySector: DimensionResult;
  perGDP: DimensionResult;
  /** Per capita. Multiple locations supported */
  perCapita: DimensionResult;
  /** Total of all the Gases by countries, zones and groups. Multiple locations supported */
  total: DimensionResult;
};


export type GhgByGasGasesArgs = {
  source: Scalars['String'];
};


export type GhgByGasSectorsArgs = {
  source: Scalars['String'];
};


export type GhgByGasSourcesArgs = {
  dimension: GhgByGasDimensions;
};


export type GhgByGasMultiSelectsArgs = {
  dimension: GhgByGasDimensions;
};


export type GhgByGasByGasArgs = {
  emissionsUnit: Co2eqUnit;
  gases: Array<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  includingLUCF: Scalars['Boolean'];
  source: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type GhgByGasBySectorArgs = {
  source: Scalars['String'];
  sectors: Array<Scalars['String']>;
  emissionsUnit?: Maybe<Co2eqUnit>;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type GhgByGasPerGdpArgs = {
  emissionsUnit?: Maybe<Co2Unit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  gdpUnit: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type GhgByGasPerCapitaArgs = {
  emissionsUnit?: Maybe<Co2eqUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  source: Scalars['String'];
};


export type GhgByGasTotalArgs = {
  source: Scalars['String'];
  emissionsUnit?: Maybe<Co2eqUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum GhgByGasDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  ByGas = 'byGas',
  BySector = 'bySector'
}

export type ImportExport = {
  __typename?: 'ImportExport';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  dimensions: Array<ImportExportDimensions>;
  types: Array<Scalars['String']>;
  total: DimensionResult;
};


export type ImportExportTotalArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  types: Array<Maybe<Scalars['String']>>;
  energyFamily: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum ImportExportDimensions {
  Total = 'total'
}


export type Kaya = {
  __typename?: 'Kaya';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<KayaDimensions>;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
};


export type KayaTotalArgs = {
  groupName?: Maybe<Scalars['String']>;
};

export enum KayaDimensions {
  Total = 'total'
}

export type MultiSelect = {
  __typename?: 'MultiSelect';
  name: Scalars['String'];
  data: Array<NameColor>;
};

export type NameColor = {
  __typename?: 'NameColor';
  name: Scalars['String'];
  color: Scalars['String'];
};

export type Nuclear = {
  __typename?: 'Nuclear';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<NuclearDimensions>;
  shareOfElectricityGeneration: DimensionResult;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
};


export type NuclearMultiSelectsArgs = {
  dimension: NuclearDimensions;
};


export type NuclearShareOfElectricityGenerationArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type NuclearTotalArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum NuclearDimensions {
  Total = 'total',
  ShareOfElectricityGeneration = 'shareOfElectricityGeneration'
}

export type Oil = {
  __typename?: 'Oil';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  scenari: Array<NameColor>;
  curves: Array<Scalars['String']>;
  reserves: Array<Scalars['String']>;
  oldScenari: Array<NameColor>;
  oldCurves: Array<Scalars['String']>;
  oldUrrs: Array<Scalars['String']>;
  /** Available dimensions e.g. by energy family, per capita, total */
  dimensions: Array<OilDimensions>;
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  /** Sectors available */
  sectors: Array<NameColor>;
  bySector: DimensionResult;
  perCapita: DimensionResult;
  provenReserve: DimensionResult;
  extrapolation: DimensionResult;
  oldExtrapolation: DimensionResult;
  total: DimensionResult;
};


export type OilMultiSelectsArgs = {
  countriesOnly: Scalars['Boolean'];
};


export type OilBySectorArgs = {
  sectors: Array<Scalars['String']>;
  energyUnit?: Maybe<EnergyUnit>;
  groupName?: Maybe<Scalars['String']>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type OilPerCapitaArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};


export type OilProvenReserveArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type OilExtrapolationArgs = {
  scenari: Array<Maybe<Scalars['String']>>;
  reserve: Scalars['String'];
  curves: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type OilOldExtrapolationArgs = {
  scenari: Array<Maybe<Scalars['String']>>;
  urr: Scalars['String'];
  curves: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type OilTotalArgs = {
  energyUnit?: Maybe<EnergyUnit>;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};

export enum OilDimensions {
  ProvenReserve = 'provenReserve',
  Extrapolation = 'extrapolation',
  ImportExport = 'importExport',
  Total = 'total',
  PerCapita = 'perCapita',
  BySector = 'bySector',
  PerGdp = 'perGDP',
  OldExtrapolation = 'oldExtrapolation'
}

/** The World Energy History consumption and production */
export type PrimaryEnergies = {
  __typename?: 'PrimaryEnergies';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  /** Sources is the names of the datasets sources */
  energyFamilies: Array<NameColor>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  /** Multi-select presets */
  multiSelects: Array<MultiSelect>;
  /** Types is Production or Consumption */
  types: Array<Scalars['String']>;
  /** Available dimensions e.g. by energy family, per capita, total */
  dimensions: Array<PrimaryEnergiesDimensions>;
  /** Share of primary energy by energy families */
  byEnergyFamily: DimensionResult;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
  /** Per capita */
  perCapita: DimensionResult;
};


/** The World Energy History consumption and production */
export type PrimaryEnergiesEnergyFamiliesArgs = {
  type: Scalars['String'];
};


/** The World Energy History consumption and production */
export type PrimaryEnergiesMultiSelectsArgs = {
  dimension: PrimaryEnergiesDimensions;
  type: Scalars['String'];
};


/** The World Energy History consumption and production */
export type PrimaryEnergiesByEnergyFamilyArgs = {
  energyFamilies: Array<Maybe<Scalars['String']>>;
  energyUnit: EnergyUnit;
  groupName?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


/** The World Energy History consumption and production */
export type PrimaryEnergiesTotalArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  type: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


/** The World Energy History consumption and production */
export type PrimaryEnergiesPerCapitaArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
};

export enum PrimaryEnergiesDimensions {
  Total = 'total',
  PerCapita = 'perCapita',
  PerGdp = 'perGDP',
  ByEnergyFamily = 'byEnergyFamily'
}

export type Query = {
  __typename?: 'Query';
  primaryEnergies?: Maybe<PrimaryEnergies>;
  finalEnergies?: Maybe<FinalEnergies>;
  gHGByGas?: Maybe<GhgByGas>;
  electricity?: Maybe<Electricity>;
  cO2FromEnergy?: Maybe<Co2FromEnergy>;
  energyIntensityGDP?: Maybe<EnergyIntensityGdp>;
  oil?: Maybe<Oil>;
  gas?: Maybe<Gas>;
  coal?: Maybe<Coal>;
  footprint?: Maybe<Footprint>;
  kaya?: Maybe<Kaya>;
  importExport?: Maybe<ImportExport>;
  renewableEnergies?: Maybe<RenewableEnergies>;
  nuclear?: Maybe<Nuclear>;
  co2ImportsExports?: Maybe<Co2ImportsExports>;
};

export type RenewableEnergies = {
  __typename?: 'RenewableEnergies';
  /** Markdown of the graph's description */
  mdInfos: Scalars['String'];
  /** Units is all the units available for conversion */
  energyUnits?: Maybe<Scalars['JSON']>;
  countries: Array<NameColor>;
  /** Groups is EU27, OECD... */
  groups: Array<NameColor>;
  /** Zones is basically continents */
  zones: Array<NameColor>;
  multiSelects: Array<MultiSelect>;
  energyFamilies: Array<NameColor>;
  /** Available dimensions e.g. by energy family, per capita, total, per GDP */
  dimensions: Array<RenewableEnergiesDimensions>;
  /** Types is Production or Consumption */
  types: Array<Scalars['String']>;
  shareOfPrimaryEnergy: DimensionResult;
  /** Share of primary energy by energy families */
  byEnergyFamily: DimensionResult;
  /** Total of all the energy families by countries, zones and groups. */
  total: DimensionResult;
};


export type RenewableEnergiesMultiSelectsArgs = {
  dimension: RenewableEnergiesDimensions;
  type: Scalars['String'];
};


export type RenewableEnergiesEnergyFamiliesArgs = {
  type: Scalars['String'];
};


export type RenewableEnergiesShareOfPrimaryEnergyArgs = {
  groupNames: Array<Maybe<Scalars['String']>>;
  type: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type RenewableEnergiesByEnergyFamilyArgs = {
  energyFamilies: Array<Maybe<Scalars['String']>>;
  energyUnit: EnergyUnit;
  groupName?: Maybe<Scalars['String']>;
  type: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};


export type RenewableEnergiesTotalArgs = {
  energyUnit: EnergyUnit;
  groupNames: Array<Maybe<Scalars['String']>>;
  type: Scalars['String'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
};

export enum RenewableEnergiesDimensions {
  Total = 'total',
  ShareOfPrimaryEnergy = 'shareOfPrimaryEnergy',
  ByEnergyFamily = 'byEnergyFamily'
}

export type Serie = {
  __typename?: 'Serie';
  name: Scalars['String'];
  data: Array<Maybe<Scalars['Float']>>;
  color: Scalars['String'];
  dashStyle?: Maybe<DashStyle>;
  type?: Maybe<SerieType>;
};

export enum SerieType {
  Spline = 'spline',
  Line = 'line'
}




export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  PrimaryEnergies: ResolverTypeWrapper<any>;
  String: ResolverTypeWrapper<any>;
  JSON: ResolverTypeWrapper<any>;
  NameColor: ResolverTypeWrapper<any>;
  PrimaryEnergiesDimensions: ResolverTypeWrapper<any>;
  MultiSelect: ResolverTypeWrapper<any>;
  EnergyUnit: ResolverTypeWrapper<any>;
  Int: ResolverTypeWrapper<any>;
  DimensionResult: ResolverTypeWrapper<any>;
  Serie: ResolverTypeWrapper<any>;
  Float: ResolverTypeWrapper<any>;
  DashStyle: ResolverTypeWrapper<any>;
  SerieType: ResolverTypeWrapper<any>;
  FinalEnergies: ResolverTypeWrapper<any>;
  FinalEnergiesDimensions: ResolverTypeWrapper<any>;
  GHGByGas: ResolverTypeWrapper<any>;
  GHGByGasDimensions: ResolverTypeWrapper<any>;
  CO2eqUnit: ResolverTypeWrapper<any>;
  Boolean: ResolverTypeWrapper<any>;
  CO2Unit: ResolverTypeWrapper<any>;
  Electricity: ResolverTypeWrapper<any>;
  ElectricityDimensions: ResolverTypeWrapper<any>;
  ElectricityTypes: ResolverTypeWrapper<any>;
  CO2FromEnergy: ResolverTypeWrapper<any>;
  CO2FromEnergyDimensions: ResolverTypeWrapper<any>;
  EnergyIntensityGDP: ResolverTypeWrapper<any>;
  Oil: ResolverTypeWrapper<any>;
  OilDimensions: ResolverTypeWrapper<any>;
  Gas: ResolverTypeWrapper<any>;
  GasDimensions: ResolverTypeWrapper<any>;
  Coal: ResolverTypeWrapper<any>;
  CoalDimensions: ResolverTypeWrapper<any>;
  Footprint: ResolverTypeWrapper<any>;
  FootprintDimensions: ResolverTypeWrapper<any>;
  Kaya: ResolverTypeWrapper<any>;
  KayaDimensions: ResolverTypeWrapper<any>;
  ImportExport: ResolverTypeWrapper<any>;
  ImportExportDimensions: ResolverTypeWrapper<any>;
  RenewableEnergies: ResolverTypeWrapper<any>;
  RenewableEnergiesDimensions: ResolverTypeWrapper<any>;
  Nuclear: ResolverTypeWrapper<any>;
  NuclearDimensions: ResolverTypeWrapper<any>;
  Co2ImportsExports: ResolverTypeWrapper<any>;
  Co2ImportsExportsDimensions: ResolverTypeWrapper<any>;
  CacheControlScope: ResolverTypeWrapper<any>;
  EnergyIntensityGdpDimensions: ResolverTypeWrapper<any>;
  Upload: ResolverTypeWrapper<any>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  PrimaryEnergies: any;
  String: any;
  JSON: any;
  NameColor: any;
  MultiSelect: any;
  Int: any;
  DimensionResult: any;
  Serie: any;
  Float: any;
  FinalEnergies: any;
  GHGByGas: any;
  Boolean: any;
  Electricity: any;
  CO2FromEnergy: any;
  EnergyIntensityGDP: any;
  Oil: any;
  Gas: any;
  Coal: any;
  Footprint: any;
  Kaya: any;
  ImportExport: any;
  RenewableEnergies: any;
  Nuclear: any;
  Co2ImportsExports: any;
  Upload: any;
};

export type CacheControlDirectiveArgs = {   maxAge?: Maybe<Scalars['Int']>;
  scope?: Maybe<CacheControlScope>; };

export type CacheControlDirectiveResolver<Result, Parent, ContextType = Context, Args = CacheControlDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type Co2FromEnergyResolvers<ContextType = Context, ParentType extends ResolversParentTypes['CO2FromEnergy'] = ResolversParentTypes['CO2FromEnergy']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emissionsUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  energyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<Co2FromEnergyMultiSelectsArgs, 'dimension'>>;
  gdpUnits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['CO2FromEnergyDimensions']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2FromEnergyTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2FromEnergyPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  perGDP?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2FromEnergyPerGdpArgs, 'groupNames' | 'gdpUnit' | 'yearStart' | 'yearEnd'>>;
  byEnergyFamily?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2FromEnergyByEnergyFamilyArgs, 'energyFamilies' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Co2ImportsExportsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Co2ImportsExports'] = ResolversParentTypes['Co2ImportsExports']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType, RequireFields<Co2ImportsExportsCountriesArgs, 'dimension'>>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<Co2ImportsExportsTypesArgs, 'dimension'>>;
  emissionsUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['Co2ImportsExportsDimensions']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2ImportsExportsTotalArgs, 'groupNames' | 'types'>>;
  byCountry?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2ImportsExportsByCountryArgs, 'types' | 'numberOfCountries'>>;
  byContinent?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2ImportsExportsByContinentArgs, 'types'>>;
  bySector?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<Co2ImportsExportsBySectorArgs, 'types' | 'numberOfSectors'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CoalResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Coal'] = ResolversParentTypes['Coal']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['CoalDimensions']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<CoalTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<CoalPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DimensionResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['DimensionResult'] = ResolversParentTypes['DimensionResult']> = {
  categories?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  series?: Resolver<Array<Maybe<ResolversTypes['Serie']>>, ParentType, ContextType>;
  multiSelects?: Resolver<Maybe<Array<ResolversTypes['MultiSelect']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ElectricityResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Electricity'] = ResolversParentTypes['Electricity']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  capacityEnergyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  generationEnergyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<ElectricityMultiSelectsArgs, 'dimension'>>;
  dimensions?: Resolver<Array<ResolversTypes['ElectricityDimensions']>, ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<ElectricityTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  byEnergyFamily?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<ElectricityByEnergyFamilyArgs, 'capacityEnergyFamilies' | 'generationEnergyFamilies' | 'yearStart' | 'yearEnd' | 'type'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<ElectricityPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnergyIntensityGdpResolvers<ContextType = Context, ParentType extends ResolversParentTypes['EnergyIntensityGDP'] = ResolversParentTypes['EnergyIntensityGDP']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  energyTypes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType>;
  gdpUnits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<EnergyIntensityGdpTotalArgs, 'groupNames' | 'energyType' | 'gdpUnit' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FinalEnergiesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['FinalEnergies'] = ResolversParentTypes['FinalEnergies']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  energyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  sectors?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<FinalEnergiesMultiSelectsArgs, 'dimension'>>;
  dimensions?: Resolver<Array<ResolversTypes['FinalEnergiesDimensions']>, ParentType, ContextType>;
  byEnergyFamily?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FinalEnergiesByEnergyFamilyArgs, 'energyUnit' | 'yearStart' | 'yearEnd'>>;
  bySector?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FinalEnergiesBySectorArgs, 'sectors' | 'energyUnit' | 'yearStart' | 'yearEnd'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FinalEnergiesPerCapitaArgs, 'energyUnit' | 'groupNames' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FinalEnergiesTotalArgs, 'energyUnit' | 'groupNames' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type FootprintResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Footprint'] = ResolversParentTypes['Footprint']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emissionsUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<FootprintMultiSelectsArgs, 'dimension'>>;
  gdpUnits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  scopes?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['FootprintDimensions']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FootprintTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'scopes'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FootprintPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'scopes'>>;
  perGDP?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<FootprintPerGdpArgs, 'groupNames' | 'gdpUnit' | 'yearStart' | 'yearEnd' | 'scopes'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GasResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Gas'] = ResolversParentTypes['Gas']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['GasDimensions']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  sectors?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  bySector?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GasBySectorArgs, 'sectors' | 'energyUnit' | 'yearStart' | 'yearEnd'>>;
  provenReserve?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GasProvenReserveArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GasTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GasPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GhgByGasResolvers<ContextType = Context, ParentType extends ResolversParentTypes['GHGByGas'] = ResolversParentTypes['GHGByGas']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  emissionsUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  gases?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType, RequireFields<GhgByGasGasesArgs, 'source'>>;
  sectors?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType, RequireFields<GhgByGasSectorsArgs, 'source'>>;
  sources?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType, RequireFields<GhgByGasSourcesArgs, 'dimension'>>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  gdpUnits?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<GhgByGasMultiSelectsArgs, 'dimension'>>;
  dimensions?: Resolver<Array<ResolversTypes['GHGByGasDimensions']>, ParentType, ContextType>;
  byGas?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GhgByGasByGasArgs, 'emissionsUnit' | 'gases' | 'includingLUCF' | 'source' | 'yearStart' | 'yearEnd'>>;
  bySector?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GhgByGasBySectorArgs, 'source' | 'sectors' | 'yearStart' | 'yearEnd'>>;
  perGDP?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GhgByGasPerGdpArgs, 'groupNames' | 'gdpUnit' | 'yearStart' | 'yearEnd'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GhgByGasPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'source'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<GhgByGasTotalArgs, 'source' | 'groupNames' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImportExportResolvers<ContextType = Context, ParentType extends ResolversParentTypes['ImportExport'] = ResolversParentTypes['ImportExport']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['ImportExportDimensions']>, ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<ImportExportTotalArgs, 'groupNames' | 'types' | 'energyFamily' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface JsonScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type KayaResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Kaya'] = ResolversParentTypes['Kaya']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['KayaDimensions']>, ParentType, ContextType>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<KayaTotalArgs, never>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MultiSelectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['MultiSelect'] = ResolversParentTypes['MultiSelect']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  data?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NameColorResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NameColor'] = ResolversParentTypes['NameColor']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NuclearResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Nuclear'] = ResolversParentTypes['Nuclear']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<NuclearMultiSelectsArgs, 'dimension'>>;
  dimensions?: Resolver<Array<ResolversTypes['NuclearDimensions']>, ParentType, ContextType>;
  shareOfElectricityGeneration?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<NuclearShareOfElectricityGenerationArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<NuclearTotalArgs, 'energyUnit' | 'groupNames' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type OilResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Oil'] = ResolversParentTypes['Oil']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<OilMultiSelectsArgs, 'countriesOnly'>>;
  scenari?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  curves?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  reserves?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  oldScenari?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  oldCurves?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  oldUrrs?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['OilDimensions']>, ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  sectors?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  bySector?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilBySectorArgs, 'sectors' | 'yearStart' | 'yearEnd'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilPerCapitaArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  provenReserve?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilProvenReserveArgs, 'groupNames' | 'yearStart' | 'yearEnd'>>;
  extrapolation?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilExtrapolationArgs, 'scenari' | 'reserve' | 'curves' | 'yearStart' | 'yearEnd'>>;
  oldExtrapolation?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilOldExtrapolationArgs, 'scenari' | 'urr' | 'curves' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<OilTotalArgs, 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PrimaryEnergiesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['PrimaryEnergies'] = ResolversParentTypes['PrimaryEnergies']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  energyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType, RequireFields<PrimaryEnergiesEnergyFamiliesArgs, 'type'>>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<PrimaryEnergiesMultiSelectsArgs, 'dimension' | 'type'>>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  dimensions?: Resolver<Array<ResolversTypes['PrimaryEnergiesDimensions']>, ParentType, ContextType>;
  byEnergyFamily?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<PrimaryEnergiesByEnergyFamilyArgs, 'energyFamilies' | 'energyUnit' | 'type' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<PrimaryEnergiesTotalArgs, 'energyUnit' | 'groupNames' | 'type' | 'yearStart' | 'yearEnd'>>;
  perCapita?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<PrimaryEnergiesPerCapitaArgs, 'energyUnit' | 'groupNames' | 'yearStart' | 'yearEnd' | 'type'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  primaryEnergies?: Resolver<Maybe<ResolversTypes['PrimaryEnergies']>, ParentType, ContextType>;
  finalEnergies?: Resolver<Maybe<ResolversTypes['FinalEnergies']>, ParentType, ContextType>;
  gHGByGas?: Resolver<Maybe<ResolversTypes['GHGByGas']>, ParentType, ContextType>;
  electricity?: Resolver<Maybe<ResolversTypes['Electricity']>, ParentType, ContextType>;
  cO2FromEnergy?: Resolver<Maybe<ResolversTypes['CO2FromEnergy']>, ParentType, ContextType>;
  energyIntensityGDP?: Resolver<Maybe<ResolversTypes['EnergyIntensityGDP']>, ParentType, ContextType>;
  oil?: Resolver<Maybe<ResolversTypes['Oil']>, ParentType, ContextType>;
  gas?: Resolver<Maybe<ResolversTypes['Gas']>, ParentType, ContextType>;
  coal?: Resolver<Maybe<ResolversTypes['Coal']>, ParentType, ContextType>;
  footprint?: Resolver<Maybe<ResolversTypes['Footprint']>, ParentType, ContextType>;
  kaya?: Resolver<Maybe<ResolversTypes['Kaya']>, ParentType, ContextType>;
  importExport?: Resolver<Maybe<ResolversTypes['ImportExport']>, ParentType, ContextType>;
  renewableEnergies?: Resolver<Maybe<ResolversTypes['RenewableEnergies']>, ParentType, ContextType>;
  nuclear?: Resolver<Maybe<ResolversTypes['Nuclear']>, ParentType, ContextType>;
  co2ImportsExports?: Resolver<Maybe<ResolversTypes['Co2ImportsExports']>, ParentType, ContextType>;
};

export type RenewableEnergiesResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RenewableEnergies'] = ResolversParentTypes['RenewableEnergies']> = {
  mdInfos?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  energyUnits?: Resolver<Maybe<ResolversTypes['JSON']>, ParentType, ContextType>;
  countries?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  groups?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  zones?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType>;
  multiSelects?: Resolver<Array<ResolversTypes['MultiSelect']>, ParentType, ContextType, RequireFields<RenewableEnergiesMultiSelectsArgs, 'dimension' | 'type'>>;
  energyFamilies?: Resolver<Array<ResolversTypes['NameColor']>, ParentType, ContextType, RequireFields<RenewableEnergiesEnergyFamiliesArgs, 'type'>>;
  dimensions?: Resolver<Array<ResolversTypes['RenewableEnergiesDimensions']>, ParentType, ContextType>;
  types?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  shareOfPrimaryEnergy?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<RenewableEnergiesShareOfPrimaryEnergyArgs, 'groupNames' | 'type' | 'yearStart' | 'yearEnd'>>;
  byEnergyFamily?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<RenewableEnergiesByEnergyFamilyArgs, 'energyFamilies' | 'energyUnit' | 'type' | 'yearStart' | 'yearEnd'>>;
  total?: Resolver<ResolversTypes['DimensionResult'], ParentType, ContextType, RequireFields<RenewableEnergiesTotalArgs, 'energyUnit' | 'groupNames' | 'type' | 'yearStart' | 'yearEnd'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SerieResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Serie'] = ResolversParentTypes['Serie']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  data?: Resolver<Array<Maybe<ResolversTypes['Float']>>, ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dashStyle?: Resolver<Maybe<ResolversTypes['DashStyle']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['SerieType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Upload'], any> {
  name: 'Upload';
}

export type Resolvers<ContextType = Context> = {
  CO2FromEnergy?: Co2FromEnergyResolvers<ContextType>;
  Co2ImportsExports?: Co2ImportsExportsResolvers<ContextType>;
  Coal?: CoalResolvers<ContextType>;
  DimensionResult?: DimensionResultResolvers<ContextType>;
  Electricity?: ElectricityResolvers<ContextType>;
  EnergyIntensityGDP?: EnergyIntensityGdpResolvers<ContextType>;
  FinalEnergies?: FinalEnergiesResolvers<ContextType>;
  Footprint?: FootprintResolvers<ContextType>;
  Gas?: GasResolvers<ContextType>;
  GHGByGas?: GhgByGasResolvers<ContextType>;
  ImportExport?: ImportExportResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Kaya?: KayaResolvers<ContextType>;
  MultiSelect?: MultiSelectResolvers<ContextType>;
  NameColor?: NameColorResolvers<ContextType>;
  Nuclear?: NuclearResolvers<ContextType>;
  Oil?: OilResolvers<ContextType>;
  PrimaryEnergies?: PrimaryEnergiesResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RenewableEnergies?: RenewableEnergiesResolvers<ContextType>;
  Serie?: SerieResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
export type DirectiveResolvers<ContextType = Context> = {
  cacheControl?: CacheControlDirectiveResolver<any, any, ContextType>;
};


/**
 * @deprecated
 * Use "DirectiveResolvers" root object instead. If you wish to get "IDirectiveResolvers", add "typesPrefix: I" to your config.
 */
export type IDirectiveResolvers<ContextType = Context> = DirectiveResolvers<ContextType>;