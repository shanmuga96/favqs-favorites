/**
 * Quote object matching the response of GET /api/quote
 */
export interface Quote
{
    id: number;
    body: string;
    author: string;
}

/**
 * Saved Favorite quote object returned by GET /api/favorites
 */
export interface FavoriteQuote extends Quote
{
    createdAt?: string;
}

/**
 * Payload required to save a quote as Favorite (POST /api/favorites)
 */

export interface SaveFavoriteQuotePayload
{
    id: number;
    body: string;
    author: string;
}

/**
 * Type-sage navigation parameters for the Bottom Tab Navigator
 */
export type RootTabParamList = {
    Home: undefined;
    Favorites: undefined;
};