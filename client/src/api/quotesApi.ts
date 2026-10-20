import { Platform } from "react-native";
import { Quote, FavoriteQuote, SaveFavoriteQuotePayload } from "../types";

/**
 * Configure API Base URL.
 * - Android Emulator uses 10.0.2.2 to access host machine localhost.
 * - iOS Simulator and Web can directly reach localhost.
 * - For a physical mobile device, replace with your local machines's LAN IP (e.g., http://192.168.1.50:3000/api).
 */

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';

class ApiError extends Error
{
    constructor ( message: string, public status?: number )
    {
        super( message );
        this.name = 'ApiError';
    };
}

async function request<T> ( endpoint: string, options?: RequestInit ): Promise<T>
{
    const url = `${ BASE_URL }${ endpoint }`;
    try
    {
        const response = await fetch( url, {
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers
            },
            ...options
        } );

        if ( !response.ok )
        {
            let errorMessage = `Request failed with status ${ response.status }`;
            try
            {
                const errorBody = await response.json();
                if ( errorBody?.error )
                {
                    errorMessage = errorBody.error;
                }
            } catch
            {
                // Fallback to default message if body is not JSON
            }
            throw new ApiError( errorMessage, response.status );
        }

        // Handle 204 No Content ot empty responses
        if ( response.status === 204 )
        {
            return {} as T;
        }

        return ( await response.json() ) as T;
    } catch ( error )
    {
        if ( error instanceof ApiError )
        {
            throw error;
        }
        // Handle network unreachable / connection refused
        throw new ApiError( 'Cannot connect to the server. Please verify the backend app is up and running.', 0 );
    }
}

export const quotesApi = {

    /**
     * Fetches the Quote of the Day from backend
     * @returns 
     */
    async getQuoteOfTheDay (): Promise<Quote>
    {
        return request<Quote>( '/quote' );
    },

    /**
     * Fetches all favorite Quotes from backend
     * @returns 
     */
    async getFavoriteQuotes (): Promise<FavoriteQuote[]>
    {
        return request<FavoriteQuote[]>( '/favorites' );
    },

    /**
     * Saves a liked quote to server favorites
     * @param payload 
     * @returns 
     */
    async saveFavorite ( payload: SaveFavoriteQuotePayload ): Promise<FavoriteQuote>
    {
        return request<FavoriteQuote>( '/favorites', {
            method: 'POST',
            body: JSON.stringify( payload )
        } );
    },

    /**
     * Removes a quote from the favorites list by it's ID
     * @param id 
     * @returns 
     */
    async removeFavorite ( id: number ): Promise<{ message: string; }>
    {
        return request<{ message: string; }>( '/favorites/${id}', {
            method: 'DELETE'
        } );
    }
};