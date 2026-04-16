
export function dbActivitiesToRows(activities) {
  return activities.map((a, i) => {
    let subtype = "";
    let quantity = "";
    if (a.type === "Food")           { subtype = a.foodType ?? "";      quantity = String(a.foodQuantity ?? ""); }
    if (a.type === "Transportation") { subtype = a.transportMode ?? ""; quantity = String(a.distance ?? ""); }
    if (a.type === "Utility")        { subtype = a.utilityType ?? "";   quantity = String(a.consumptionValue ?? ""); }
    return { id: i, type: a.type, subtype, quantity };
  });
}