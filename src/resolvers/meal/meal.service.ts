import { Meal } from "@prisma/client";
import { Service } from "typedi";
import PrismaService from "../../services/prisma.service";
import CategoryService from "../category/category.service";
import { MealOption } from "./meal.gql";

@Service()
class MealService {
  constructor(
    private prismaService: PrismaService,
    private categoryService: CategoryService
  ) {}

  async findMeals(
    filter?: {
      name?: string;
      category?: string;
    },
    sort?: { by: string; order?: string }
  ): Promise<Meal[]> {
    let orderBy = undefined;
    if (sort) orderBy = { [sort.by]: sort.order ? sort.order : "asc" };

    return this.prismaService.meal.findMany({
      orderBy,
      where: {
        AND: {
          category: filter?.category
            ? {
                name: {
                  contains: filter.category,
                  mode: "insensitive",
                },
              }
            : undefined,
          name: filter?.name
            ? {
                contains: filter.name,
                mode: "insensitive",
              }
            : undefined,
        },
      },
    });
  }

  async findMeal(id: string): Promise<Meal | null> {
    return this.prismaService.meal.findFirst({ where: { id } });
  }

  async findMealByNormalizedName(nameNormalized: string): Promise<Meal | null> {
    return this.prismaService.meal.findFirst({ where: { nameNormalized } });
  }

  async findMelasInCategory(category: string): Promise<Meal[]> {
    return this.prismaService.meal.findMany({
      where: {
        category: {
          name: category,
        },
      },
      include: { category: true },
    });
  }

  async searchMeal(query: string): Promise<MealOption[]> {
    return this.prismaService.meal.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });
  }

  async createMeal(
    name: string,
    nameNormalized: string,
    categoryId: string
  ): Promise<Meal> {
    const category = await this.categoryService.findCategory(categoryId);
    if (!category) throw new Error("Invalid categoryId");
    return this.prismaService.meal.create({
      data: {
        name,
        nameNormalized,
        categoryId: categoryId,
      },
    });
  }

  async updateMeal(
    id: string,
    name: string,
    categoryId: string
  ): Promise<Meal> {
    const meal = await this.findMeal(id);
    if (!meal) throw new Error("Invalid mealId");
    const category = this.categoryService.findCategory(categoryId);
    if (!category) throw new Error("Invalid categoryId");

    return this.prismaService.meal.update({
      where: { id },
      data: {
        name,
        categoryId,
      },
    });
  }
}

export default MealService;
