import type { H3Event } from "h3";
import type { ZodType, z } from "zod";

function validationError(error: z.ZodError) {
  return createError({
    statusCode: 400,
    message: "Validation failed",
    data: {
      issues: error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    },
  });
}

export async function validateBody<T extends ZodType>(event: H3Event, schema: T): Promise<z.output<T>> {
  const result = schema.safeParse((await readBody(event)) ?? {});
  if (!result.success) throw validationError(result.error);
  return result.data;
}

export function validateQuery<T extends ZodType>(event: H3Event, schema: T): z.output<T> {
  const result = schema.safeParse(getQuery(event));
  if (!result.success) throw validationError(result.error);
  return result.data;
}
