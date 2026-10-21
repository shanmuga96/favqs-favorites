/**
 * Stored representation of a user's facorited quotes
 */

export interface FavoriteQuote
{
    id: number;
    body: string;
    author: string;
    createdAt: string;
}

/**
 * In-memory repository storing favorite quotes using a Map.
 */
export class FavoritesRepository
{
    private favorites: Map<number, FavoriteQuote> = new Map();

    /**
     * Saves a new Favorite quote
     * @param quote Quote object containing id, body and author
     * @returns the saved FavoriteQuote record
     * @throws Error if quote ID alreay exists in storage
     */

    public save ( quote: Omit<FavoriteQuote, "createdAt"> ): FavoriteQuote
    {
        if ( this.favorites.has( quote.id ) )
        {
            const err = new Error( `Quote ${ quote.id } is already in favorites.` );
            err.name = "DuplicateFavoriteError";
            throw err;
        }

        const favoriteRecord: FavoriteQuote = {
            ...quote,
            createdAt: new Date().toISOString(),
        };

        this.favorites.set( quote.id, favoriteRecord );
        return favoriteRecord;
    }

    /**
     * Retrieves all the saved favorite quotes
     * @returns Array of FavoriteQuotes (newest first)
     */
    public findAll (): FavoriteQuote[]
    {
        return Array.from( this.favorites.values() ).reverse();
    }

    /**
     * Checks if a specific quote is already favorited
     * @param id The quote id to check
     * @returns boolean value true if it exists or false if it doesn't exist
     */
    public has ( id: number ): boolean
    {
        return this.favorites.has( id );
    }

    /**
     * 
     * @param id The quote id to remove from Favorite Quotes list
     * @returns boolean value true id item existed and removed, else false
     */
    public delete ( id: number ): boolean
    {
        return this.favorites.delete( id );
    }

    /**
     * Clears all favorites from the memory
     */
    public clear (): void
    {
        this.favorites.clear();
    }
}

export const favoritesRepository = new FavoritesRepository();
