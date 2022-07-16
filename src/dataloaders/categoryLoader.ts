import { Category } from "@prisma/client";
import DataLoader from "dataloader";
import { Service } from "typedi";
import PrismaService from "../services/prisma.service";

@Service()
class CategoryLoader {
  private loader;
  constructor(private prismaService: PrismaService) {
    this.loader = new DataLoader<string, Category | undefined>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(
    keys: readonly string[]
  ): Promise<Array<Category | undefined>> {
    const categories = await this.prismaService.category.findMany({
      where: {
        id: {
          in: [...keys],
        },
      },
    });
    return keys.map((key) =>
      categories.find((category) => category.id === key)
    );
  }

  async load(key: string): Promise<Category | undefined> {
    return this.loader.load(key);
  }
}

export default CategoryLoader;
