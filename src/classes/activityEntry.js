
//This class represents an entry of activities, which includes the activities themselves and
//  the date it was performed.
class ActivityEntry{
    constructor(activities, date){
        this.activities = activities;
        this.date = date;
        this.totalCarbonImpact = this.getCarbonImpact();
    }
    
    getCarbonImpact(){
        let totalImpact = 0;
        for(let activity of this.activities){
            totalImpact += activity.getCarbonImpact();
        }
        return totalImpact;
    }
}

export {ActivityEntry};