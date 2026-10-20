import { favqsClient } from "../clients/favqsClient";


/**
 * Data Transfer Object(DTO) exposed to our client
 * Keeping this at minimum as mentioned in the Assessment doc.
 */
export interface QuoteDto
{
    id: number;
    body: string;
    author: string;
}


export const quoteService = {
    /**
     * Retrieves the Quote of the Day and maps it to QuoteDto
     * @returns - the normalized quote payload
     */
    async getQuoteOfTheDay (): Promise<QuoteDto>
    {
        const rawQuote = await favqsClient.getQuoteOfTheDay();
        return {
            id: rawQuote.id,
            body: rawQuote.body,
            author: rawQuote.author
        };
    }
};