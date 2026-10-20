import dotenv from "dotenv";
import path, { dirname } from "path";

// Load the .env from the server's root folder
dotenv.config( { path: path.resolve( __dirname, "../../.env" ) } );

interface EnvConfig
{
    port: number;
    favqsApiKey: string;
    favqaBaseUrl: string;
}

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
    port: parseInt( process.env.PORT || '3000', 10 ),
    favqsApiKey: getEnvVar( 'FAVQS_API_KEY', 'placeholder_key_for_tests' ),
    favqaBaseUrl: process.env.FAVQS_BASE_URL || "https://favqs.com/api"
};
