import {
  Food,
  Transportation,
  Utility,
  FoodType,
  TransportationMode,
  UtilityType,
} from "@/classes/activities";

//Used as configuration for data entry
const ACTIVITY_CONFIG = {
  Food: {
    max:500, //500 oz of food as a reasonable upper limit
    icon: "🍴",
    subtypes: Object.values(FoodType),
    unit: "oz",
    build: (subtype, qty) => new Food(subtype, qty),
  },
  Transportation: {
    max:2000,//extreme amount of miles in a day
    icon: "🚗",
    subtypes: Object.values(TransportationMode),
    unit: "mi",
    build: (subtype, qty) => new Transportation(subtype, qty),
  },
  Utility: {
    max:10000,
    icon: "🔌",
    subtypes: Object.values(UtilityType),
    units: {
      electricity: "kWh",
      water: "gallons",
      gas: "CCF",
      maxBySubtype:{
        electricity: 200,   // typical daily: 10–50 kWh, 200 is very high
        water: 2000,        // gallons (household high usage)
        gas: 500,           // CCF (very high daily usage)
      }
    },
    build: (subtype, qty) => new Utility(subtype, qty),
  },
};

export { ACTIVITY_CONFIG };