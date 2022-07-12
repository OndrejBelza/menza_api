import { Category } from "@prisma/client";
import { Service } from "typedi";
import PrismaService from "../../services/prisma.service";

@Service()
class CategoryService {
  constructor(private prismaService: PrismaService) {}

  async findCategories(): Promise<Category[]> {
    return this.prismaService.category.findMany();
  }

  async findCategory(id: string): Promise<Category | null> {
    return this.prismaService.category.findFirst({ where: { id } });
  }

  async findCategoryByName(name: string): Promise<Category | null> {
    return this.prismaService.category.findFirst({ where: { name } });
  }

  async deleteCategory(id: string): Promise<Category> {
    const category = await this.findCategory(id);
    if (!category) throw new Error("Invalid categoryId");
    return this.prismaService.category.delete({ where: { id } });
  }

  async createCategory(name: string): Promise<Category> {
    return this.prismaService.category.create({
      data: {
        name,
      },
    });
  }

  async updateCategory(id: string, name: string): Promise<Category> {
    const category = await this.findCategory(id);
    if (!category) throw new Error("Invalid categoryId");
    return this.prismaService.category.update({
      where: { id },
      data: { name },
    });
  }
}

export default CategoryService;
