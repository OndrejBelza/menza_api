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
import MealPicturesLoader from "../../dataloaders/mealPicturesLoader";
import { AdminGuard } from "../../middlewares/admin.middleware";
import normalizeMealName from "../../utils/normalizeMealName";
import CategoryService from "../category/category.service";
import BaseMealPicture from "../mealPicture/baseMealPicture";
// import MealPictureService from "../mealPicture/mealPicture.service";
import BaseMealPrice from "../mealPrice/baseMealPrice";
import MealPriceService from "../mealPrice/mealPrice.service";
import BaseMeal from "./baseMeal";
import { CreateMealInput, Meal, MealOption, UpdateMealInput } from "./meal.gql";
import MealService from "./meal.service";

@Service()
@Resolver(() => Meal)
class MealResolver {
  constructor(
    private mealService: MealService,
    private categoryService: CategoryService,
    // private mealPicturesService: MealPictureService,
    private mealPriceService: MealPriceService,
    private mealPicturesLoader: MealPicturesLoader
  ) {}

  @FieldResolver()
  category(@Root() meal: Meal & { categoryId: string }) {
    return this.categoryService.findCategory(meal.categoryId);
  }

  @FieldResolver()
  async pictures(@Root() meal: Meal): Promise<BaseMealPicture[]> {
    return this.mealPicturesLoader.load(meal.id);
    // return this.mealPicturesService.findMealPictures(meal.id);
  }

  @FieldResolver()
  async prices(@Root() meal: Meal): Promise<BaseMealPrice[]> {
    return this.mealPriceService.findMealPrices(meal.id);
  }

  @Query(() => [Meal])
  async meals(): Promise<BaseMeal[]> {
    return this.mealService.findMeals();
  }

  @Query(() => Meal, { nullable: true })
  async meal(@Arg("id") id: string): Promise<BaseMeal | null> {
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
