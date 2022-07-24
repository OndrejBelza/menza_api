import "reflect-metadata";
import "dotenv-safe/config";
import express from "express";
import { Container } from "typedi";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { MenuResolver } from "./resolvers/menu/menu.resolver";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import MealResolver from "./resolvers/meal/meal.resolver";
import CategoryResolver from "./resolvers/category/category.resolver";
import { MyContext } from "./types/context";
import RestaurantResolver from "./resolvers/restaurant/restaurant.resolver";
import MealPriceResolver from "./resolvers/mealPrice/mealPrice.resolver";
import MealPictureResolver from "./resolvers/mealPicture/mealPicture.resolver";
import { registerController, useContainer } from "cron-decorators";
import {
  typeDefs as scalarTypeDefs,
  resolvers as scalarResolvers,
} from "graphql-scalars";

const app = express();

useContainer(Container);
registerController([
  __dirname + "/crons/**/*.ts",
  __dirname + "/crons/**/*.js",
]);

async function main() {
  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: "*",
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [
        MenuResolver,
        MealResolver,
        CategoryResolver,
        RestaurantResolver,
        MealPriceResolver,
        MealPictureResolver,
      ],
      container: Container,
      validate: false,
    }),
    typeDefs: [...scalarTypeDefs],
    resolvers: [scalarResolvers],
    introspection: true,
    context: ({ req, res }): MyContext => ({ req, res }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: "*",
    },
  });

  app.listen(process.env.PORT, () => {
    console.log(
      `Server is listening on http://localhost:${process.env.PORT}/graphql`
    );
  });
}

main().catch(console.error);
