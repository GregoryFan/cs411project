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
    icon: "🍴",
    subtypes: Object.values(FoodType),
    unit: "oz",
    build: (subtype, qty) => new Food(subtype, qty),
  },
  Transportation: {
    icon: "🚗",
    subtypes: Object.values(TransportationMode),
    unit: "mi",
    build: (subtype, qty) => new Transportation(subtype, qty),
  },
  Utility: {
    icon: "🔌",
    subtypes: Object.values(UtilityType),
    units: {
      electricity: "kWh",
      water: "gallons",
      gas: "CCF",
    },
    build: (subtype, qty) => new Utility(subtype, qty),
  },
};

export { ACTIVITY_CONFIG };