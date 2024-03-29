import { MealPicture } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class MealPicturesLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, MealPicture[]>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(
    keys: readonly string[]
  ): Promise<Array<MealPicture[]>> {
    const pictures = await this.prismaService.mealPicture.findMany({
      where: {
        mealId: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) =>
      pictures.filter((picture) => picture.mealId === key)
    );
  }

  async load(key: string): Promise<MealPicture[]> {
    return this.loader.load(key);
  }
}

export default MealPicturesLoader;
