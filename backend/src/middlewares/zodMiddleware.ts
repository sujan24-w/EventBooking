import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

 const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
   console.log("call from frontend");
   
    const result = schema.safeParse(req.body);
 console.log(result?.error?.issues[0].message);
 
  
    if (!result.success) {
  res.status(400).json({
    message: result.error.issues[0].message,
  });
  return;
}

    req.body = result.data;
    next();
  };
};




const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ query: req.query });

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Query validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }
    const data= result.data as{
       query: {
        search: string;
        page: number;
        limit: number;
        sort: string;
        availability: string;
        includeCancelled :boolean,
       }
    }

    res.locals.validatedQuery = data.query;
    next();
  };
};



export {validate, validateQuery};