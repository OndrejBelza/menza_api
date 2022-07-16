import { Meal } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class MealLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, Meal | undefined>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(
    keys: readonly string[]
  ): Promise<Array<Meal | undefined>> {
    const meals = await this.prismaService.meal.findMany({
      where: {
        id: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) => meals.find((meal) => meal.id === key));
  }

  async load(key: string): Promise<Meal | undefined> {
    return this.loader.load(key);
  }
}

export default MealLoader;
