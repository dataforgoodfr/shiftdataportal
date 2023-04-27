export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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


export type FootprintInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type FootprintInputsQuery = (
  { __typename?: 'Query' }
  & { footprint?: Maybe<(
    { __typename?: 'Footprint' }
    & Pick<Footprint, 'mdInfos' | 'emissionsUnits' | 'scopes' | 'gdpUnits' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetFootprintDimensionQueryVariables = Exact<{
  gdpUnit: Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  emissionsUnit: Co2Unit;
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  perGDP: Scalars['Boolean'];
  yearEnd: Scalars['Int'];
  dimension: FootprintDimensions;
  scopes: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetFootprintDimensionQuery = (
  { __typename?: 'Query' }
  & { footprint?: Maybe<(
    { __typename?: 'Footprint' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color' | 'dashStyle'>
      )>> }
    )>, perGDP?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color' | 'dashStyle'>
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color' | 'dashStyle'>
      )>> }
    )> }
  )> }
);

export type Co2FromEnergyInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type Co2FromEnergyInputsQuery = (
  { __typename?: 'Query' }
  & { cO2FromEnergy?: Maybe<(
    { __typename?: 'CO2FromEnergy' }
    & Pick<Co2FromEnergy, 'mdInfos' | 'emissionsUnits' | 'gdpUnits' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, energyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetCo2FromEnergyDimensionQueryVariables = Exact<{
  energyFamilies: Array<Scalars['String']> | Scalars['String'];
  gdpUnit: Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  emissionsUnit: Co2Unit;
  byEnergyFamily: Scalars['Boolean'];
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  perGDP: Scalars['Boolean'];
  yearEnd: Scalars['Int'];
  dimension: Co2FromEnergyDimensions;
}>;


export type GetCo2FromEnergyDimensionQuery = (
  { __typename?: 'Query' }
  & { cO2FromEnergy?: Maybe<(
    { __typename?: 'CO2FromEnergy' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, byEnergyFamily?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, perGDP?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type Co2ImportsExportsInputsQueryVariables = Exact<{
  dimension: Co2ImportsExportsDimensions;
}>;


export type Co2ImportsExportsInputsQuery = (
  { __typename?: 'Query' }
  & { co2ImportsExports?: Maybe<(
    { __typename?: 'Co2ImportsExports' }
    & Pick<Co2ImportsExports, 'mdInfos' | 'emissionsUnits' | 'dimensions' | 'types'>
    & { countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetCo2ImportsExportsDimensionQueryVariables = Exact<{
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  emissionsUnit: Co2eqUnit;
  total: Scalars['Boolean'];
  byCountry: Scalars['Boolean'];
  byContinent: Scalars['Boolean'];
  bySector: Scalars['Boolean'];
  types: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetCo2ImportsExportsDimensionQuery = (
  { __typename?: 'Query' }
  & { co2ImportsExports?: Maybe<(
    { __typename?: 'Co2ImportsExports' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, byCountry?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, byContinent?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, bySector?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )> }
  )> }
);

export type GhgByGasInputsQueryVariables = Exact<{
  dimension: GhgByGasDimensions;
  source: Scalars['String'];
}>;


export type GhgByGasInputsQuery = (
  { __typename?: 'Query' }
  & { gHGByGas?: Maybe<(
    { __typename?: 'GHGByGas' }
    & Pick<GhgByGas, 'mdInfos' | 'sources' | 'emissionsUnits' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, sectors: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, gases: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetGhgByGasDimensionQueryVariables = Exact<{
  sectors: Array<Scalars['String']> | Scalars['String'];
  gases: Array<Scalars['String']> | Scalars['String'];
  source: Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  emissionsUnit: Co2eqUnit;
  includingLUCF: Scalars['Boolean'];
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  bySector: Scalars['Boolean'];
  byGas: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  dimension: GhgByGasDimensions;
}>;


export type GetGhgByGasDimensionQuery = (
  { __typename?: 'Query' }
  & { gHGByGas?: Maybe<(
    { __typename?: 'GHGByGas' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, bySector?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, byGas?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type KayaInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type KayaInputsQuery = (
  { __typename?: 'Query' }
  & { kaya?: Maybe<(
    { __typename?: 'Kaya' }
    & Pick<Kaya, 'mdInfos'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetKayaDimensionQueryVariables = Exact<{
  groupName?: Maybe<Scalars['String']>;
  total: Scalars['Boolean'];
}>;


export type GetKayaDimensionQuery = (
  { __typename?: 'Query' }
  & { kaya?: Maybe<(
    { __typename?: 'Kaya' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )> }
  )> }
);

export type CoalInputsQueryVariables = Exact<{
  countriesOnly: Scalars['Boolean'];
}>;


export type CoalInputsQuery = (
  { __typename?: 'Query' }
  & { primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & Pick<PrimaryEnergies, 'types'>
  )>, importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { importExportTypes: ImportExport['types'] }
  )>, coal?: Maybe<(
    { __typename?: 'Coal' }
    & Pick<Coal, 'mdInfos' | 'dimensions' | 'energyUnits'>
    & { groups?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, zones?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetCoalDimensionQueryVariables = Exact<{
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  yearStart: Scalars['Int'];
  perCapita: Scalars['Boolean'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
  total: Scalars['Boolean'];
  importExport: Scalars['Boolean'];
  importExportsTypes: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetCoalDimensionQuery = (
  { __typename?: 'Query' }
  & { importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'dashStyle' | 'color'>
      )>> }
    )> }
  )>, coal?: Maybe<(
    { __typename?: 'Coal' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type ElectricityInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type ElectricityInputsQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'gdpUnits'>
  )>, electricity?: Maybe<(
    { __typename?: 'Electricity' }
    & Pick<Electricity, 'mdInfos' | 'energyUnits' | 'types' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, generationEnergyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, capacityEnergyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetElectricityDimensionQueryVariables = Exact<{
  generationEnergyFamilies: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  capacityEnergyFamilies: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  byEnergyFamily: Scalars['Boolean'];
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  perGDP: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  dimension: ElectricityDimensions;
  gdpUnit: Scalars['String'];
  gdpEnergyType: Scalars['String'];
  type: ElectricityTypes;
}>;


export type GetElectricityDimensionQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )>, electricity?: Maybe<(
    { __typename?: 'Electricity' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, byEnergyFamily?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type EnergyIntensityGdpInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type EnergyIntensityGdpInputsQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'mdInfos' | 'gdpUnits' | 'energyUnits' | 'energyTypes'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetEnergyIntensityGdpDimensionQueryVariables = Exact<{
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  energyType: Scalars['String'];
  gdpUnit: Scalars['String'];
  total: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
}>;


export type GetEnergyIntensityGdpDimensionQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'mdInfos'>
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type FinalEnergyInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type FinalEnergyInputsQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'gdpUnits'>
  )>, finalEnergies?: Maybe<(
    { __typename?: 'FinalEnergies' }
    & Pick<FinalEnergies, 'mdInfos' | 'energyUnits' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, energyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, sectors: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetFinalEnergyDimensionQueryVariables = Exact<{
  energyFamilies: Array<Scalars['String']> | Scalars['String'];
  sectors: Array<Scalars['String']> | Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  byEnergyFamily: Scalars['Boolean'];
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  perGDP: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  bySector: Scalars['Boolean'];
  yearEnd: Scalars['Int'];
  dimension: FinalEnergiesDimensions;
  gdpUnit: Scalars['String'];
  gdpEnergyType: Scalars['String'];
}>;


export type GetFinalEnergyDimensionQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )>, finalEnergies?: Maybe<(
    { __typename?: 'FinalEnergies' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, byEnergyFamily?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, bySector?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type GasInputsQueryVariables = Exact<{
  countriesOnly: Scalars['Boolean'];
}>;


export type GasInputsQuery = (
  { __typename?: 'Query' }
  & { primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & Pick<PrimaryEnergies, 'types'>
  )>, importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { importExportTypes: ImportExport['types'] }
  )>, gas?: Maybe<(
    { __typename?: 'Gas' }
    & Pick<Gas, 'mdInfos' | 'dimensions' | 'energyUnits'>
    & { groups?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, zones?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, sectors: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetGasDimensionQueryVariables = Exact<{
  sectors: Array<Scalars['String']> | Scalars['String'];
  groupName?: Maybe<Scalars['String']>;
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  yearStart: Scalars['Int'];
  bySector: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  total: Scalars['Boolean'];
  importExport: Scalars['Boolean'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
  importExportsTypes: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetGasDimensionQuery = (
  { __typename?: 'Query' }
  & { importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'dashStyle' | 'color'>
      )>> }
    )> }
  )>, gas?: Maybe<(
    { __typename?: 'Gas' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, provenReserve: (
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    ), bySector?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type NuclearInputsQueryVariables = Exact<{ [key: string]: never; }>;


export type NuclearInputsQuery = (
  { __typename?: 'Query' }
  & { nuclear?: Maybe<(
    { __typename?: 'Nuclear' }
    & Pick<Nuclear, 'mdInfos' | 'dimensions' | 'energyUnits'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetNuclearDimensionQueryVariables = Exact<{
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  total: Scalars['Boolean'];
  shareOfElectricityGeneration: Scalars['Boolean'];
  dimension: NuclearDimensions;
}>;


export type GetNuclearDimensionQuery = (
  { __typename?: 'Query' }
  & { nuclear?: Maybe<(
    { __typename?: 'Nuclear' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, shareOfElectricityGeneration?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type OilInputsQueryVariables = Exact<{
  countriesOnly: Scalars['Boolean'];
}>;


export type OilInputsQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'gdpUnits'>
  )>, primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & Pick<PrimaryEnergies, 'types'>
  )>, importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { importExportTypes: ImportExport['types'] }
  )>, oil?: Maybe<(
    { __typename?: 'Oil' }
    & Pick<Oil, 'mdInfos' | 'energyUnits' | 'dimensions' | 'reserves' | 'curves' | 'oldUrrs' | 'oldCurves'>
    & { groups?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, zones?: Maybe<Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>>, multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, sectors: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, scenari: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, oldScenari: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetOilDimensionQueryVariables = Exact<{
  sectors: Array<Scalars['String']> | Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  perCapita: Scalars['Boolean'];
  perGDP: Scalars['Boolean'];
  importExport: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  bySector: Scalars['Boolean'];
  extrapolation: Scalars['Boolean'];
  reserve: Scalars['String'];
  curves: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  scenari: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  oldExtrapolation: Scalars['Boolean'];
  oldUrr: Scalars['String'];
  oldCurves: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  oldScenari: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
  total: Scalars['Boolean'];
  gdpUnit: Scalars['String'];
  importExportsTypes: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetOilDimensionQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )> }
  )>, importExport?: Maybe<(
    { __typename?: 'ImportExport' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>>, series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'dashStyle' | 'color'>
      )>> }
    )> }
  )>, oil?: Maybe<(
    { __typename?: 'Oil' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, provenReserve: (
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    ), bySector?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, extrapolation?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color' | 'dashStyle'>
      )>> }
    )>, oldExtrapolation?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color' | 'dashStyle'>
      )>> }
    )> }
  )> }
);

export type PrimaryEnergyInputsQueryVariables = Exact<{
  type: Scalars['String'];
}>;


export type PrimaryEnergyInputsQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & Pick<EnergyIntensityGdp, 'gdpUnits'>
  )>, primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & Pick<PrimaryEnergies, 'mdInfos' | 'energyUnits' | 'types' | 'dimensions'>
    & { groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, energyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetPrimaryEnergyDimensionQueryVariables = Exact<{
  type: Scalars['String'];
  energyFamilies: Array<Scalars['String']> | Scalars['String'];
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  byEnergyFamily: Scalars['Boolean'];
  total: Scalars['Boolean'];
  perCapita: Scalars['Boolean'];
  perGDP: Scalars['Boolean'];
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  dimension: PrimaryEnergiesDimensions;
  gdpUnit: Scalars['String'];
  gdpEnergyType: Scalars['String'];
}>;


export type GetPrimaryEnergyDimensionQuery = (
  { __typename?: 'Query' }
  & { energyIntensityGDP?: Maybe<(
    { __typename?: 'EnergyIntensityGDP' }
    & { total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )>, primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, byEnergyFamily?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, perCapita?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);

export type RenewableEnergiesInputsQueryVariables = Exact<{
  type: Scalars['String'];
}>;


export type RenewableEnergiesInputsQuery = (
  { __typename?: 'Query' }
  & { primaryEnergies?: Maybe<(
    { __typename?: 'PrimaryEnergies' }
    & Pick<PrimaryEnergies, 'types'>
  )>, renewableEnergies?: Maybe<(
    { __typename?: 'RenewableEnergies' }
    & Pick<RenewableEnergies, 'mdInfos' | 'dimensions' | 'energyUnits'>
    & { energyFamilies: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, groups: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, zones: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )>, countries: Array<(
      { __typename?: 'NameColor' }
      & Pick<NameColor, 'name' | 'color'>
    )> }
  )> }
);

export type GetRenewableEnergyDimensionQueryVariables = Exact<{
  groupNames: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  groupName?: Maybe<Scalars['String']>;
  energyUnit: EnergyUnit;
  yearStart: Scalars['Int'];
  yearEnd: Scalars['Int'];
  type: Scalars['String'];
  total: Scalars['Boolean'];
  shareOfPrimaryEnergy: Scalars['Boolean'];
  byEnergyFamily: Scalars['Boolean'];
  dimension: RenewableEnergiesDimensions;
  energyFamilies: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
}>;


export type GetRenewableEnergyDimensionQuery = (
  { __typename?: 'Query' }
  & { renewableEnergies?: Maybe<(
    { __typename?: 'RenewableEnergies' }
    & { multiSelects: Array<(
      { __typename?: 'MultiSelect' }
      & Pick<MultiSelect, 'name'>
      & { data: Array<(
        { __typename?: 'NameColor' }
        & Pick<NameColor, 'name' | 'color'>
      )> }
    )>, byEnergyFamily?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, shareOfPrimaryEnergy?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )>, total?: Maybe<(
      { __typename?: 'DimensionResult' }
      & Pick<DimensionResult, 'categories'>
      & { series: Array<Maybe<(
        { __typename?: 'Serie' }
        & Pick<Serie, 'name' | 'data' | 'color'>
      )>>, multiSelects?: Maybe<Array<(
        { __typename?: 'MultiSelect' }
        & Pick<MultiSelect, 'name'>
        & { data: Array<(
          { __typename?: 'NameColor' }
          & Pick<NameColor, 'name' | 'color'>
        )> }
      )>> }
    )> }
  )> }
);
