import express from "express";
import helmet from "helmet";
import "reflect-metadata";
import { useExpressServer } from "routing-controllers";
import { CategoriesController, TodosController } from "~/controllers";
import { AfterLogHandler, BeforeLogHandler, ErrorHandler, NotFoundHandler } from "~/middlewares";
import log from "~/middlewares/log";

const app = express();

// Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!
app.use(helmet());

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

useExpressServer(app, {
  defaultErrorHandler: false,
  controllers: [TodosController, CategoriesController],
  middlewares: [BeforeLogHandler, NotFoundHandler, ErrorHandler, AfterLogHandler],
  defaults: {
    paramOptions: {
      required: true, // with this option, argument will be required by default
    },
  },
});

if (import.meta.env.PROD) {
  app.listen(8080, () => {
    log.info(`App is running at http://localhost:8080 in ${import.meta.env.MODE} mode`);
  });
}

export const viteNodeApp = app;
