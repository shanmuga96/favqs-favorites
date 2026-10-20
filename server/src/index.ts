import express, { Request, Response } from "express";
import { config } from "./config/env";

const app = express();

app.use( express.json() );

// Health check for the service
app.get( "/health", ( req: Request, res: Response ) =>
{
    res.json( { status: "ok", timeStamp: new Date().toISOString() } );
} );

app.listen( config?.port, () =>
{
    console.log( `Server running on http://localhost:${ config?.port }` );
    if ( !config.favqsApiKey )
    {
        console.warn( "Warning: Missing FAVQS_API_KEY in the .env" );
    }
} );
