export const roleAccess = {
    admin: [
      "Home", "Menu", "Reservations", "Inventory",
      "Orders", "Payments", "Employees", "Prueba"
    ],
    kitchen: ["Menu", "Inventory", "Orders"],
    service: ["Reservations", "Orders", "Payments"]
  };
  
  export function canAccess(viewLabel, userType) {
    return roleAccess[userType]?.includes(viewLabel);
  }
  