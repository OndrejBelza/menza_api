import { Menu } from "./menu.gql";

type BaseMenu = Omit<Menu, "mealPrices" | "restaurant"> & {
  restaurantId: string;
};

export default BaseMenu;
