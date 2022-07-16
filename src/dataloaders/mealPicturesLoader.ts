import { MealPicture } from "@prisma/client";
import console from "console";
import DataLoader from "dataloader";
import { Service } from "typedi";

@Service()
class MealPicturesLoader {
  private loader;
  constructor() {
    this.loader = new DataLoader<string, MealPicture>((keys) =>
      this.batchLoad(keys)
    );
  }

  private async batchLoad(keys: readonly string[]): Promise<MealPicture[]> {
    console.log(keys);
    return [];
  }

  async load(key: string): Promise<MealPicture[]> {
    return this.loader.load(key) as any;
  }
}

export default MealPicturesLoader;
