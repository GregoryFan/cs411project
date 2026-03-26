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
    icon: "Food Image",
    subtypes: Object.values(FoodType),
    unit: "oz",
    build: (subtype, qty) => new Food(subtype, qty),
  },
  Transportation: {
    icon: "Car Image",
    subtypes: Object.values(TransportationMode),
    unit: "mi",
    build: (subtype, qty) => new Transportation(subtype, qty),
  },
  Utility: {
    icon: "Utility Image",
    subtypes: Object.values(UtilityType),
    unit: "kWh",
    build: (subtype, qty) => new Utility(subtype, qty),
  },
};

export { ACTIVITY_CONFIG };