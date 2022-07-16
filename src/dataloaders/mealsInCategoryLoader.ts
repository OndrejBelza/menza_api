import { Meal } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class MealsInCategoryLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, Meal[]>((keys) =>
      this.batchLoadMeals(keys)
    );
  }

  private async batchLoadMeals(
    keys: readonly string[]
  ): Promise<Array<Meal[]>> {
    const meals = await this.prismaService.meal.findMany({
      where: {
        categoryId: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) => meals.filter((meal) => meal.categoryId === key));
  }

  async load(key: string): Promise<Meal[]> {
    return this.loader.load(key);
  }
}

export default MealsInCategoryLoader;
