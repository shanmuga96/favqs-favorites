import express, { NextFunction, Request, Response } from "express";
import { config } from "./config/env";
import quoteRoutes from "./routes/quoteRoutes";
import { UpstreamApiError } from "./clients/favqsClient";

const app = express();

app.use( express.json() );

// Health check for the service
app.get( "/health", ( req: Request, res: Response ) =>
{
    res.json( { status: "ok", timeStamp: new Date().toISOString() } );
} );

app.use( "/api", quoteRoutes );

// Centralized error handler
app.use( ( err: Error, req: Request, res: Response, next: NextFunction ) =>
{
    console.error( "[Error Logger]:", err.message );

    if ( err instanceof UpstreamApiError )
    {
        res.status( err.statusCode ).json( { error: err.message } );
    }

    res.status( 500 ).json( { error: "Internal server error" } );
} );

app.listen( config?.port, () =>
{
    console.log( `Server running on http://localhost:${ config?.port }` );
    if ( !config.favqsApiKey )
    {
        console.warn( "Warning: Missing FAVQS_API_KEY in the .env" );
    }
} );
