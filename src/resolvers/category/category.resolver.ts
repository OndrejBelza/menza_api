import { UUIDResolver } from "graphql-scalars";
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
import MealsInCategoryLoader from "../../dataloaders/mealsInCategoryLoader";
import { AdminGuard } from "../../middlewares/admin.middleware";
import BaseCategory from "./baseCategory";
import { Category, UpdateCategoryInput } from "./category.gql";
import CategoryService from "./category.service";

@Service()
@Resolver(Category)
class CategoryResolver {
  constructor(
    private categoryService: CategoryService,
    private mealsInCategoryLoader: MealsInCategoryLoader
  ) {}

  @FieldResolver()
  async meals(@Root() category: Category) {
    return this.mealsInCategoryLoader.load(category.id);
  }

  @Query(() => [Category])
  async categories(): Promise<BaseCategory[]> {
    return this.categoryService.findCategories();
  }

  @Query(() => Category, { nullable: true })
  async category(
    @Arg("id", () => UUIDResolver) id: string
  ): Promise<BaseCategory | null> {
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
    @Arg("id", () => UUIDResolver) id: string
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
