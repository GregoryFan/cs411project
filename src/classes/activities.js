//This file contains the class definitions for the base activities, and all subclasses of activities.


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
        //TODO: implement carbon impact calculation based on food type and quantity
        return 67;
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
        //TODO: implement carbon impact calculation based on transport type and distance
        return 67;
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
        //TODO: implement carbon impact calculation based on utility type and usage
        return 67;
    }
}

//Declare enums for food types, transportation modes, and utility types
const FoodType = {
    BEEF: "beef",
    CHICKEN: "chicken",
    PORK: "pork",
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