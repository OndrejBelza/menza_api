import { MealPrice } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class MealPricesLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, MealPrice[]>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(
    keys: readonly string[]
  ): Promise<Array<MealPrice[]>> {
    const mealPrices = await this.prismaService.mealPrice.findMany({
      where: {
        mealId: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) =>
      mealPrices.filter((mealPrice) => mealPrice.mealId === key)
    );
  }

  async load(key: string): Promise<MealPrice[]> {
    return this.loader.load(key);
  }
}

export default MealPricesLoader;
