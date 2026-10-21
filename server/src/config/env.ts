import dotenv from "dotenv";
import path from "path";

// Load the .env from the server's root folder
dotenv.config( { path: path.resolve( __dirname, "../../.env" ) } );

interface EnvConfig
{
    port: number;
    favqsApiKey: string;
    favqsBaseUrl: string;
    allowedOrigins: string[];
}

const parseAllowedOrigins = ( envVar?: string ): string[] =>
{
    const defaultOrigins = [
        "http://localhost:3000",
        "http://localhost:8081",
        'http://127.0.0.1:8081',
        "http://localhost:5173", // Vite
    ];

    if ( !envVar || envVar.trim() === "" )
    {
        return defaultOrigins;
    }

    // Split, trim whitespaces, and remove empty entries
    return envVar
        .split( "," )
        .map( ( origin ) => origin.trim() )
        .filter( Boolean );
};

const getEnvVar = ( key: string, defaultValue?: string ): string =>
{
    const value = process.env[ key ] || defaultValue;
    if ( !value )
    {
        throw new Error( `[Config Error]: Missing required env variable ${ key }` );
    }
    return value;
};

export const config: EnvConfig = {
    port: parseInt( process.env.PORT || "3000", 10 ),
    favqsApiKey: process.env.FAVQS_API_KEY || '',
    favqsBaseUrl: process.env.FAVQS_BASE_URL || "https://favqs.com/api",
    allowedOrigins: parseAllowedOrigins( process.env.ALLOWED_ORIGINS ),
};
