import {
  Arg,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { Service } from "typedi";
import { AdminGuard } from "../../middlewares/admin.middleware";
import MealService from "../meal/meal.service";
import BaseCategory from "./baseCategory";
import { Category, UpdateCategoryInput } from "./category.gql";
import CategoryService from "./category.service";

@Service()
@Resolver(Category)
class CategoryResolver {
  constructor(
    private categoryService: CategoryService,
    private mealService: MealService
  ) {}

  @FieldResolver()
  async meals(@Root() category: Category) {
    return this.mealService.findMelasInCategory(category.name);
  }

  @Query(() => [Category])
  async categories(): Promise<BaseCategory[]> {
    return this.categoryService.findCategories();
  }

  @Query(() => Category, { nullable: true })
  async category(@Arg("id") id: string): Promise<BaseCategory | null> {
    return this.categoryService.findCategory(id);
  }

  @Mutation(() => Category)
  @UseMiddleware(AdminGuard)
  async createCategory(@Arg("name") name: string): Promise<BaseCategory> {
    return this.categoryService.createCategory(name);
  }

  @Mutation(() => Category)
  @UseMiddleware(AdminGuard)
  async deleteCategory(
    @Arg("id") id: string
  ): Promise<Omit<Category, "meals">> {
    return this.categoryService.deleteCategory(id);
  }

  @Mutation(() => Category)
  @UseMiddleware(AdminGuard)
  async updateCategory(
    @Arg("input", () => UpdateCategoryInput) input: UpdateCategoryInput
  ): Promise<BaseCategory> {
    const { id, name } = input;
    return this.categoryService.updateCategory(id, name);
  }
}

export default CategoryResolver;
