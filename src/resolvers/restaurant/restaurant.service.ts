import { Restaurant } from "@prisma/client";
import { Service } from "typedi";
import PrismaService from "../../services/prisma.service";

@Service()
class RestaurantService {
  constructor(private prismaService: PrismaService) {}

  async findRestaurants(): Promise<Restaurant[]> {
    return this.prismaService.restaurant.findMany();
  }

  async findRestaurant(id: string): Promise<Restaurant | null> {
    return this.prismaService.restaurant.findFirst({ where: { id } });
  }

  async findRestaurantByName(name: string): Promise<Restaurant | null> {
    return this.prismaService.restaurant.findFirst({ where: { name } });
  }

  async createRestaurant(input: {
    name: string;
    menuUrl: string;
    openingHours: string;
    address: string;
    img: string;
  }): Promise<Restaurant> {
    return this.prismaService.restaurant.create({
      data: {
        ...input,
        scrapingStartedAt: new Date(),
      },
    });
  }

  async updateRestaurant(
    id: string,
    input: {
      name?: string;
      menuUrl?: string;
      openingHours?: string;
      address?: string;
      img?: string;
      scrapingStartedAt?: Date;
    }
  ): Promise<Restaurant> {
    const restaurant = await this.findRestaurant(id);
    if (!restaurant) throw new Error("Restaurant does't exit!");
    return this.prismaService.restaurant.update({
      where: {
        id,
      },
      data: {
        ...input,
      },
    });
  }

  async deleteRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await this.findRestaurant(id);
    if (!restaurant) throw new Error("Restaurant does't exit!");
    return this.prismaService.restaurant.delete({ where: { id } });
  }
}

export default RestaurantService;
