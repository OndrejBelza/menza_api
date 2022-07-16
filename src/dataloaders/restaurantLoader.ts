import { Restaurant } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class RestaurantLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, Restaurant | undefined>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(
    keys: readonly string[]
  ): Promise<Array<Restaurant | undefined>> {
    const restaurants = await this.prismaService.restaurant.findMany({
      where: {
        id: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) =>
      restaurants.find((restaurant) => restaurant.id === key)
    );
  }

  async load(key: string): Promise<Restaurant | undefined> {
    return this.loader.load(key);
  }
}

export default RestaurantLoader;
