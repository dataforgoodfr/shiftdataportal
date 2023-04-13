import slugify from "slugify";

const colors2 = [
  {
    name: "transport",
    slug: "transport",
    value: "#0390c0"
  },
  {
    name: "industry",
    slug: "industry",
    value: "#a852d9"
  },
  {
    name: "fuel-ethanol",
    slug: "fuel-ethanol",
    value: "#a6d8e3"
  },
  {
    name: "biodiesel",
    slug: "biodiesel",
    value: "#abe9bc"
  },
  {
    name: "tide",
    slug: "tide",
    value: "#CB8A01"
  },
  {
    name: "solar thermal",
    slug: "solar-thermal",
    value: "#CB8A01"
  },
  {
    name: "solar pv",
    slug: "solar-pv",
    value: "#CB8A01"
  },
  {
    name: "biomass",
    slug: "biomass",
    value: "#a852d9"
  },
  {
    name: "wind",
    slug: "wind",
    value: "#00C7B4"
  },
  {
    name: "hydro",
    slug: "hydro",
    value: "#8daacb"
  },
  {
    name: "electricity-heat",
    slug: "electricityheat",
    value: "#fc7362"
  },
  {
    name: "electricityheat",
    slug: "electricity-heat",
    value: "#fc7362"
  },
  {
    name: "manufacturing-construction",
    slug: "manufacturing-construction",
    value: "#b3b3b3"
  },
  {
    name: "manufacturingconstruction",
    slug: "manufacturingconstruction",
    value: "#b3b3b3"
  },
  {
    name: "bunker",
    slug: "bunker",
    value: "#e5b694"
  },
  {
    name: "bunkers",
    slug: "bunkers",
    value: "#e5b694"
  },
  {
    name: "f-gas",
    slug: "f-gas",
    value: "#996800"
  },
  {
    name: "transportation",
    slug: "transportation",
    value: "#0390c0"
  },
  {
    name: "industrial",
    slug: "industrial",
    value: "#66c296"
  },
  {
    name: "fugitive",
    slug: "fugitive",
    value: "#CB8A01"
  },
  {
    name: "gas",
    slug: "gas",
    value: "#FB8888"
  },
  {
    name: "commercial and public services",
    slug: "commercial-and-public-services",
    value: "#CB8A01"
  },
  {
    name: "crude oil",
    slug: "crude-oil",
    value: "#6D6D6D"
  },
  {
    name: "residential",
    slug: "residential",
    value: "#996800"
  },
  {
    name: "other",
    slug: "other",
    value: "#a6d8e3"
  },
  {
    name: "others",
    slug: "others",
    value: "#a6d8e3"
  },
  {
    name: "biofuels and waste",
    slug: "biofuels-and-waste",
    value: "#abe9bc"
  },
  {
    name: "oil products",
    slug: "oil-products",
    value: "#fc7362"
  },
  {
    name: "biomass and waste electricity",
    slug: "biomass-and-waste-electricity",
    value: "#a852d9"
  },
  {
    name: "biomass and waste",
    slug: "biomass-and-waste",
    value: "#a852d9"
  },
  {
    name: "solar, tide, wave, fuel cell",
    slug: "solar-tide-wave-fuel-cell",
    value: "#CB8A01"
  },
  {
    name: "solar, tide and wave electricity",
    slug: "solar-tide-and-wave-electricity",
    value: "#CB8A01"
  },
  {
    name: "solar, tide and wave",
    slug: "solar-tide-and-wave",
    value: "#CB8A01"
  },
  {
    name: "solar",
    slug: "solar",
    value: "#CB8A01"
  },
  {
    name: "geothermal electricity",
    slug: "geothermal-electricity",
    value: "#b4dcbc"
  },
  {
    name: "geothermal",
    slug: "geothermal",
    value: "#b4dcbc"
  },
  {
    name: "hydroelectric pumped storage",
    slug: "hydroelectric-pumped-storage",
    value: "#8daacb"
  },
  {
    name: "hydroelectric electricity",
    slug: "hydroelectric-electricity",
    value: "#8daacb"
  },
  {
    name: "hydroelectricity",
    slug: "hydroelectricity",
    value: "#8daacb"
  },
  {
    name: "nuclear",
    slug: "nuclear",
    value: "#ffd92f"
  },
  {
    name: "oil",
    slug: "oil",
    value: "#BC301A"
  },
  {
    name: "brown coal",
    slug: "brown-coal",
    value: "#143c00"
  },
  {
    name: "hard coal",
    slug: "hard-coal",
    value: "#ff7800"
  },
  {
    name: "coal",
    slug: "coal",
    value: "#4F1008"
  },
  {
    name: "waste",
    slug: "waste",
    value: "#abe9bc"
  },
  {
    name: "other fuel combustion",
    slug: "other-fuel-combustion",
    value: "#a6d8e3"
  },
  {
    name: "construction",
    slug: "construction",
    value: "#b3b3b3"
  },
  {
    name: "manufacturing",
    slug: "manufacturing",
    value: "#b3b3b3"
  },
  {
    name: "lucf",
    slug: "lucf",
    value: "#e78ad2"
  },
  {
    name: "land-use change & forestry",
    slug: "land-use-change-and-forestry",
    value: "#e78ad2"
  },
  {
    name: "international bunkers",
    slug: "international-bunkers",
    value: "#e5b694"
  },
  {
    name: "industrial processes",
    slug: "industrial-processes",
    value: "#66c296"
  },
  {
    name: "fugitive emissions",
    slug: "fugitive-emissions",
    value: "#CB8A01"
  },
  {
    name: "energy",
    slug: "energy",
    value: "#bbd854"
  },
  {
    name: "heat",
    slug: "heat",
    value: "#C648FF"
  },
  {
    name: "electricity",
    slug: "electricity",
    value: "#CB8A01"
  },
  {
    name: "agriculture",
    slug: "agriculture",
    value: "#8daacb"
  },
  {
    name: "sf6s",
    slug: "sf6s",
    value: "#e7c52b"
  },
  {
    name: "pfcs",
    slug: "pfcs",
    value: "#e5b694"
  },
  {
    name: "n2o",
    slug: "n2o",
    value: "#996800"
  },
  {
    name: "hfcss",
    slug: "hfcss",
    value: "#8daacb"
  },
  {
    name: "co2",
    slug: "co2",
    value: "#ff2500"
  },
  {
    name: "ch4",
    slug: "ch4",
    value: "#008000"
  },
  { name: "Solvent and Other Product Use", slug: "solvent-and-other-product-use", value: "#8daacb" },
  { name: "Industrial Processes and Product Use", slug: "industrial-processes-and-product-use", value: "#a852d9" },
  { name: "Land Use, Land-Use Change and Forestry", slug: "land-use-land-use-change-and-forestry", value: "#e78ad2" },
  { name: "Solvent and other product use: paint", slug: "solvent-and-other-product-use:-paint", value: "#e78ad2" },
  {
    name: "Non-energy use of lubricants/waxes (CO2)",
    slug: "non-energy-use-of-lubricantswaxes-(co2)",
    value: "#e78ad2"
  },
  { name: "Indirect N2O from non-agricultural NH3", slug: "indirect-n2o-from-non-agricultural-nh3", value: "#e78ad2" },
  { name: "Production of other minerals", slug: "production-of-other-minerals", value: "#e78ad2" },
  { name: "Fugitive emissions from gaseous fuels", slug: "fugitive-emissions-from-gaseous-fuels", value: "#e78ad2" },
  {
    name: "Solvent and other product use: chemicals",
    slug: "solvent-and-other-product-use:-chemicals",
    value: "#e78ad2"
  },
  {
    name: "Solvent and other product use: degrease",
    slug: "solvent-and-other-product-use:-degrease",
    value: "#e78ad2"
  },
  { name: "Public electricity and heat production", slug: "public-electricity-and-heat-production", value: "#e78ad2" },
  {
    name: "Manufacturing Industries and Construction",
    slug: "manufacturing-industries-and-construction",
    value: "#e78ad2"
  },
  { name: "Fugitive emissions from oil and gas", slug: "fugitive-emissions-from-oil-and-gas", value: "#e78ad2" },
  { name: "Fugitive emissions from solid fuels", slug: "fugitive-emissions-from-solid-fuels", value: "#e78ad2" },
  { name: "Solid waste disposal on land", slug: "solid-waste-disposal-on-land", value: "#e78ad2" },
  { name: "Wastewater handling", slug: "wastewater-handling", value: "#e78ad2" },
  { name: "Manure in pasture/range/paddock", slug: "manure-in-pasturerangepaddock", value: "#e78ad2" },
  { name: "Solvent and other product use: other", slug: "solvent-and-other-product-use:-other", value: "#e78ad2" },
  { name: "Indirect N2O from non-agricultural NOx", slug: "indirect-n2o-from-non-agricultural-nox", value: "#e78ad2" },
  { name: "Residential and other sectors", slug: "residential-and-other-sectors", value: "#8daacb" },
  { name: "Road transportation", slug: "road-transportation", value: "#0390c0" },
  { name: "Enteric fermentation", slug: "enteric-fermentation", value: "#e5b694" },
  { name: "Other Energy Industries", slug: "other-energy-industries", value: "#e78ad2" },
  { name: "Rice cultivation", slug: "rice-cultivation", value: "#0390c0" },
  { name: "Production of chemicals", slug: "production-of-chemicals", value: "#e78ad2" },
  { name: "Agricultural waste burning", slug: "agricultural-waste-burning", value: "#8daacb" },
  { name: "Direct soil emissions", slug: "direct-soil-emissions", value: "#CB8A01" },
  { name: "Cement production", slug: "cement-production", value: "#e78ad2" },
  { name: "Manure management", slug: "manure-management", value: "#e78ad2" },
  { name: "Domestic aviation", slug: "domestic-aviation", value: "#b3b3b3" },
  { name: "Production of metals", slug: "production-of-metals", value: "#e78ad2" },
  { name: "Indirect N2O from agriculture", slug: "indirect-n2o-from-agriculture", value: "#e78ad2" },
  { name: "Rail transportation", slug: "rail-transportation", value: "#0390c0" },
  { name: "Lime production", slug: "lime-production", value: "#e78ad2" },
  { name: "Other transportation", slug: "other-transportation", value: "#0390c0" },
  { name: "Memo: International navigation", slug: "memo:-international-navigation", value: "#e5b694" },
  { name: "Inland navigation", slug: "inland-navigation", value: "#e5b694" },
  { name: "Other direct soil emissions", slug: "other-direct-soil-emissions", value: "#a6d8e3" },
  { name: "Memo: International aviation", slug: "memo:-international-aviation", value: "#e5b694" },
  { name: "Limestone and dolomite use", slug: "limestone-and-dolomite-use", value: "#a852d9" },
  { name: "Waste incineration", slug: "waste-incineration", value: "#e5b694" },
  { name: "Fossil fuel fires", slug: "fossil-fuel-fires", value: "#a6d8e3" },
  { name: "Soda ash production and use", slug: "soda-ash-production-and-use", value: "#e78ad2" },
  { name: "Other waste handling", slug: "other-waste-handling", value: "#e78ad2" },
  { name: "LULUCF", slug: "lulucf", value: "#e78ad2" },
  { name: "F-gases", slug: "f-gases", value: "#e78ad2" },
  { name: "Peat", slug: "peat", value: "#834200" },
  { name: "Other Energy", slug: "other-energy", value: "#CB8A01" },
  { name: "Electricity & Heat", slug: "electricity-and-heat", value: "#fc7362" },
  { name: "Industry and Construction", slug: "industry-and-construction", value: "#a852d9" },
  { name: "Other Agriculture", slug: "other-agriculture", value: "#8daacb" },
  { name: "Other Sectors", slug: "other-sectors", value: "#e5b694" },
  { name: "Electricity, Gas and Water", slug: "electricity-gas-and-water", value: "#fc7362" },
  {
    name: "Petroleum, Chemical and Non-Metallic Mineral Products",
    slug: "petroleum-chemical-and-non-metallic-mineral-products",
    value: "#BC301A"
  },
  { name: "Mining and Quarrying", slug: "mining-and-quarrying", value: "#e5b694" },
  { name: "Electrical and Machinery", slug: "electrical-and-machinery", value: "#8daacb" },
  { name: "Metal Products", slug: "metal-products", value: "#e78ad2" },
  { name: "Transport Equipment", slug: "transport-equipment", value: "#0390c0" },
  { name: "Textiles and Wearing Apparel", slug: "textiles-and-wearing-apparel", value: "#fc7362" },
  { name: "Food & Beverages", slug: "food-and-beverages", value: "#fc7362" },
  {
    name: "Finacial Intermediation and Business Activities",
    slug: "finacial-intermediation-and-business-activities",
    value: "#fc7362"
  },
  { name: "Wood and Paper", slug: "wood-and-paper", value: "#fc7362" },
  { name: "Other Manufacturing", slug: "other-manufacturing", value: "#fc7362" },
  { name: "Wholesale Trade", slug: "wholesale-trade", value: "#fc7362" },
  { name: "Education, Health and Other Services", slug: "education-health-and-other-services", value: "#fc7362" },
  { name: "Post and Telecommunications", slug: "post-and-telecommunications", value: "#fc7362" },
  { name: "Retail Trade", slug: "retail-trade", value: "#fc7362" },
  { name: "Recycling", slug: "recycling", value: "#fc7362" },
  { name: "Hotels and Restraurants", slug: "hotels-and-restraurants", value: "#fc7362" },
  { name: "Fishing", slug: "fishing", value: "#fc7362" },
  { name: "Maintenance and Repair", slug: "maintenance-and-repair", value: "#fc7362" },
  { name: "Public Administration", slug: "public-administration", value: "#fc7362" },
  { name: "Private Households", slug: "private-households", value: "#fc7362" },
  { name: "Re-export & Re-import", slug: "re-export-and-re-import", value: "#fc7362" },
  { name: "Fossil Fuels", slug: "fossil-fuels", value: "#fc7362" }
];

const typeColor = (type: string): string => {
  if (!type) {
    console.warn(`"type" shouldn't be null, return default color`);
    return "#DDD";
  } else {
    const slugType = slugify(type.toLowerCase());

    const match = colors2.find(({ slug }) => slugType === slug);

    if (match && match.value) {
      return match.value;
    } else {
      console.warn(`Didn't find any matching colors for type name : "${type}" and slug : "${slugType}"`);
      return "#DDD";
    }
  }
};

export default typeColor;
