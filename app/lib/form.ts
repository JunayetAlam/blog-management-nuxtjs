import type { TypedSchema, TypedSchemaError } from "vee-validate";
import type { z } from "zod";

// vee-validate's official zod adapter only supports zod 3; this is the same contract for zod 4
export function toTypedSchema<T extends z.ZodType>(schema: T): TypedSchema<z.input<T>, z.output<T>> {
  return {
    __type: "VVTypedSchema",
    async parse(values) {
      const result = await schema.safeParseAsync(values);
      if (result.success) return { value: result.data, errors: [] };

      const byPath = new Map<string, string[]>();
      for (const issue of result.error.issues) {
        // ["tags", 0, "name"] → "tags[0].name", vee-validate's path format
        const path = issue.path
          .map((key, i) => (typeof key === "number" ? `[${key}]` : i ? `.${String(key)}` : String(key)))
          .join("");
        byPath.set(path, [...(byPath.get(path) ?? []), issue.message]);
      }
      const errors: TypedSchemaError[] = [...byPath].map(([path, messages]) => ({ path, errors: messages }));
      return { errors };
    },
  };
}
