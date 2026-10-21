import { Request, Response, NextFunction } from "express";
import { favoritesRepository } from "../storage/favoritesRepository";

/**
 * Controller handling user favorite quotes endpoints
 */
export const favoritesController = {
    /**
     * GET /api/favorites
     * Retrieves all favorited quotes
     * @param req
     * @param res
     */
    getFavorites ( req: Request, res: Response ): void
    {
        const favorites = favoritesRepository.findAll();
        res.status( 200 ).json( favorites );
    },

    /**
     * POST /api/favorites
     * Validates payload and stores the quote in memory
     * @param req
     * @param res
     * @param next
     * @returns
     */
    saveFavorite ( req: Request, res: Response, next: NextFunction ): void
    {
        try
        {
            const { id, body, author } = req.body;

            // validating incoming inputs
            if (
                id === undefined ||
                id === null ||
                typeof id !== "number" ||
                !Number.isInteger( id )
            )
            {
                res
                    .status( 400 )
                    .json( { error: 'Field "id" is required and must be an integer' } );
                return;
            }

            if ( !body || typeof body !== "string" || body.trim().length === 0 )
            {
                res.status( 400 ).json( {
                    error: 'Field "body" is required and must be a non-empty string.',
                } );
                return;
            }

            if ( !author || typeof author !== "string" || author.trim().length === 0 )
            {
                res.status( 400 ).json( {
                    error: 'Field "author" is required and must be a non-empty string.',
                } );
                return;
            }

            const savedItem = favoritesRepository.save( {
                id,
                body: body.trim(),
                author: author.trim(),
            } );
            res.status( 201 ).json( savedItem );
        } catch ( error: any )
        {
            if ( error.name === "DuplicateFavoriteError" )
            {
                res.status( 409 ).json( { error: "Quote is already in favorites." } );
                return;
            }
            next( error );
        }
    },

    /**
     * Removes a quote from the Favorites list by ID.
     * @param req
     * @param res
     * @returns
     */
    removeFavorite ( req: Request<{ id: string; }>, res: Response ): void
    {
        const rawQuoteId = req.params.id;

        // Strict integer matching to disallow trailing junk like 1abc
        if ( !/^\d+$/.test( rawQuoteId ) )
        {
            res
                .status( 400 )
                .json( { error: "Invalid quote ID parameter. Must be an integer." } );
            return;
        }

        const id = parseInt( rawQuoteId, 10 );

        const deleted = favoritesRepository.delete( id );
        if ( !deleted )
        {
            res.status( 404 ).json( { error: `Favorite quote with ID ${ id } not found` } );
            return;
        }
        res.status( 200 ).json( {
            message: `Favorite quote with ID ${ id } successfully removed from favorites.`,
        } );
    },
};
