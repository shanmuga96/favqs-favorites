import { config } from "../config/env";

/**
 * SHape of a raw Quote object
 * @see https://favqs.com/api to get to know the shapre of raw Quote object
 */
export interface FavQsRawQuote
{
    id: number;
    body: string;
    author: string;
    dialogue?: boolean;
    favorite?: boolean;
    tags?: string[];
    url?: string;
    favorites_count?: number;
    upvotes_count?: number;
    downvotes_count?: number;
    author_permalink?: string;
}

/**
 * Response strucutre of GET FavQs /api/qotd
 */
interface FavQsQotdResponse
{
    qotd_date: string;
    quote: FavQsRawQuote;
    error_code?: number;
    message?: string;
}

/**
 * Custom error class for upstream communication errors with FavQs.
 */
export class UpstreamApiError extends Error
{
    /**
     * 
     * @param message readable error description
     * @param statusCode HTTP Status code to reqturn downstream
     * @param upstreamErrorCode Optional FavQa-specific error code from their payload
     */
    constructor (
        message: string,
        public statusCode: number,
        public upstreamErrorCode?: number
    )
    {
        super( message );
        this.name = "UpstreamApiError";
    }
}

/**
 * HTTP Client to communicate with FavQs(https://favqs.com/api) API.
 */

export const favqsClient = {
    async getQuoteOfTheDay (): Promise<FavQsRawQuote>
    {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Attach App Token if configured (required for general API calls, optional for /qotd)
        if ( config.favqsApiKey )
        {
            headers.Authorization = `Token token="${ config.favqsApiKey }"`;
        }

        let response: Response;
        try
        {
            response = await fetch( `${ config.favqaBaseUrl }/qotd`, {
                method: 'GET',
                headers,
            } );
        } catch ( networkError )
        {
            throw new UpstreamApiError(
                'Unable to reach upstream FavQs service (network failure)',
                502
            );
        }

        // Check upstream HTTP status codes (FavQs documents 200, 404, 500)
        if ( !response.ok )
        {
            if ( response.status === 404 )
            {
                throw new UpstreamApiError( 'FavQs endpoint not found', 404 );
            }
            if ( response.status >= 500 )
            {
                throw new UpstreamApiError( 'FavQs upstream server encountered an error', 502 );
            }
            throw new UpstreamApiError(
                `FavQs upstream responded with unexpected status ${ response.status }`,
                502
            );
        }

        const data = ( await response.json() ) as FavQsQotdResponse;

        // FavQs returns HTTP 200 with an error_code property for application/validation errors
        if ( data.error_code )
        {
            throw new UpstreamApiError(
                data.message || 'FavQs returned an upstream error code',
                502,
                data.error_code
            );
        }

        if ( !data.quote || !data.quote.id || !data.quote.body )
        {
            throw new UpstreamApiError( 'Malformed quote payload received from FavQs /qotd', 502 );
        }

        return data.quote;
    },
};
