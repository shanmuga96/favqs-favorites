import { Request, Response, NextFunction } from "express";
import { quoteService } from "../service/quoteService";

export const quoteController = {
    async getQuote ( req: Request, res: Response, next: NextFunction ): Promise<void>
    {
        try
        {
            const quote = await quoteService.getQuoteOfTheDay();
            res.status( 200 ).json( quote );
        }
        catch ( error )
        {
            next( error );
        }
    }
};