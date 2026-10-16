
import { z } from "zod";

 const getEventsSchema = z.object({
     query: z.object({
        search: z.string().trim().optional().default(""),

       page: z.coerce.number().int().min(1).optional().default(1),

      limit: z.coerce.number().int().min(1).max(50).optional().default(6),

    sort: z
      .enum([
        "soonest",
        "latest",
        "shortest",
        "longest",
        "seats_high",
        "seats_low",
      ])
      .optional()
      .default("soonest"),

    availability: z
      .enum(["all", "available", "soldout", "cancelled"])
      .optional()
      .default("all"),

      includeCancelled: z.enum(["true", "false"])
        .optional()
         .default("false")
         .transform((value) => value === "true"),
  }),
});
export {getEventsSchema}
