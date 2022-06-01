/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Get, JsonController } from "routing-controllers";

@JsonController()
export class OpenapiController {
  @Get("/openapi")
  async getOpenApi() {
    const { getMetadataArgsStorage } = await import("routing-controllers");
    const { validationMetadatasToSchemas } = await import("class-validator-jsonschema");
    const { routingControllersToSpec } = await import("routing-controllers-openapi");
    // @ts-ignore
    const { defaultMetadataStorage } = await import("class-transformer/cjs/storage");

    const storage = getMetadataArgsStorage();
    const schemas = validationMetadatasToSchemas({
      refPointerPrefix: "#/components/schemas/",
      classTransformerMetadataStorage: defaultMetadataStorage,
    });
    const spec = routingControllersToSpec(storage, {}, { components: { schemas } });

    return spec;
  }
}
