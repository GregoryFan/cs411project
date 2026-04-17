//This file contains the class definitions for the base activities, and all subclasses of activities.

import { Carter_One } from "next/font/google";


//This is the base class of activities. 
//Do NOT use, this is only for inheritance.
class Activity{
    
    getCarbonImpact(){
        throw new Error("getCarbonImpact() must be implemented in subclasses of Activity");
    }
}

class Food extends Activity{
    constructor(foodType, quantity){
        super();
        this.foodType = foodType;
        this.quantity = quantity;
        this.carbonImpact = this.getCarbonImpact();
    }
    
    getCarbonImpact(){
        //carbon emissions based off of 100g(3.53oz) of food 
        const factorsPer3_53oz={
            beef: 15.5,
            pork: 2.4,
            chicken: 1.82,
            fish: 1.34,
            eggs: 0.53,
            vegetables: 0.045,
            fruits: 0.086,
            dairy: 2.79
        };


        const factor = factorsPer3_53oz[this.foodType?.toLowerCase()] ?? 0;
        const qty = Number(this.quantity);

        if (isNaN(qty) || qty < 0) return 0;

        return (qty / 3.53) * factor;
    }
}

class Transportation extends Activity{
    constructor(mode, distance){
        super();
        this.mode = mode;
        this.distance = distance;
        this.carbonImpact = this.getCarbonImpact();
    }
    
    getCarbonImpact(){
        //basis on 1 mile to kg output
        const factorsPerMile={
            car:0.4,
            bus:0.431,
            train:0.0771107
        };
        const factor = factorsPerMile[this.mode?.toLowerCase()] ?? 0;
        const dist = Number(this.distance);

        if (isNaN(dist) || dist < 0) return 0;

        return factor * dist;
    }
}

class Utility extends Activity{
    constructor(utilityType, usage){
        super();
        this.utilityType = utilityType;
        this.usage = usage;
        this.carbonImpact = this.getCarbonImpact();
    }

    getCarbonImpact(){
        // electricity: kg per kWh
        // water: kg per gallon
        // gas: kg per CCF
        const factorsByType = {
            electricity: 0.367,
            water: 0.0015,
            gas: 5.5
        };

        const factor = factorsByType[this.utilityType?.toLowerCase()] ?? 0;
        const usage = Number(this.usage);

        if (isNaN(usage) || usage < 0) return 0;

        return factor * usage;
    }
}

//Declare enums for food types, transportation modes, and utility types
const FoodType = {
    BEEF: "beef",
    CHICKEN: "chicken",
    PORK: "pork",
    EGGS:"eggs",
    FISH: "fish",
    VEGETABLES: "vegetables",
    FRUITS: "fruits",
    DAIRY: "dairy"

};

const TransportationMode = {
    CAR: "car",
    BUS: "bus",
    TRAIN: "train",
};

const UtilityType = {
    ELECTRICITY: "electricity",
    WATER: "water",
    GAS: "gas"
};

export {Activity, Food, Transportation, Utility, FoodType, TransportationMode, UtilityType};