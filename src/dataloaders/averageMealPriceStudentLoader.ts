import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class AverageMealPriceStudentLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, number>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(keys: readonly string[]): Promise<Array<number>> {
    const averagePrices = await this.prismaService.mealPrice.groupBy({
      by: ["mealId"],
      _avg: {
        priceStudent: true,
      },
      where: {
        mealId: {
          in: [...keys],
        },
      },
    });

    return keys.map(
      (key) =>
        averagePrices.find((averagePrice) => averagePrice.mealId === key)?._avg
          .priceStudent || NaN
    );
  }

  async load(key: string): Promise<number> {
    return this.loader.load(key);
  }
}

export default AverageMealPriceStudentLoader;
