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
import CategoryLoader from "../../dataloaders/categoryLoader";
import MealPicturesLoader from "../../dataloaders/mealPicturesLoader";
import MealPricesLoader from "../../dataloaders/mealPricesLoader";
import { AdminGuard } from "../../middlewares/admin.middleware";
import { Sort } from "../../types/gql/Filter.gql";
import normalizeMealName from "../../utils/normalizeMealName";
import BaseMealPicture from "../mealPicture/baseMealPicture";
import BaseMealPrice from "../mealPrice/baseMealPrice";
import BaseMeal from "./baseMeal";
import {
  CreateMealInput,
  Meal,
  MealFilter,
  MealOption,
  UpdateMealInput,
} from "./meal.gql";
import MealService from "./meal.service";

@Service()
@Resolver(() => Meal)
class MealResolver {
  constructor(
    private mealService: MealService,
    private mealPicturesLoader: MealPicturesLoader,
    private categoryLoader: CategoryLoader,
    private mealPricesLoader: MealPricesLoader
  ) {}

  @FieldResolver()
  category(@Root() meal: Meal & { categoryId: string }) {
    return this.categoryLoader.load(meal.categoryId);
  }

  @FieldResolver()
  async pictures(@Root() meal: Meal): Promise<BaseMealPicture[]> {
    return this.mealPicturesLoader.load(meal.id);
  }

  @FieldResolver()
  async prices(@Root() meal: Meal): Promise<BaseMealPrice[]> {
    return this.mealPricesLoader.load(meal.id);
  }

  @Query(() => [Meal])
  async meals(
    @Arg("filter", () => MealFilter, { nullable: true }) filter?: MealFilter,
    @Arg("sort", () => Sort, { nullable: true }) sort?: Sort
  ): Promise<BaseMeal[]> {
    return this.mealService.findMeals(filter, sort);
  }

  @Query(() => Meal, { nullable: true })
  async meal(
    @Arg("id", () => UUIDResolver) id: string
  ): Promise<BaseMeal | null> {
    return this.mealService.findMeal(id);
  }

  @Query(() => [MealOption])
  async searchMeal(@Arg("query") query: string): Promise<MealOption[]> {
    return this.mealService.searchMeal(query);
  }

  @Mutation(() => Meal)
  @UseMiddleware(AdminGuard)
  async createMeal(
    @Arg("input", () => CreateMealInput) input: CreateMealInput
  ): Promise<BaseMeal> {
    const { name, categoryId } = input;
    return this.mealService.createMeal(
      name,
      normalizeMealName(name),
      categoryId
    );
  }

  @Mutation(() => Meal)
  @UseMiddleware(AdminGuard)
  async updateMeal(
    @Arg("input", () => UpdateMealInput) input: UpdateMealInput
  ): Promise<BaseMeal> {
    const { id, name, categoryId } = input;
    return this.mealService.updateMeal(id, name, categoryId);
  }
}

export default MealResolver;
