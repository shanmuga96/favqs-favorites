import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { config } from "./config/env";
import quoteRoutes from "./routes/quoteRoutes";
import favoriteRoutes from "./routes/favoritesRoutes";
import { UpstreamApiError } from "./clients/favqsClient";

const app = express();

app.use(
    cors( {
        origin: ( origin, callback ) =>
        {
            // Allow requests with no origin (mobile apps, Postman, curl, server-to-server)
            if ( !origin || config.allowedOrigins.includes( origin ) )
            {
                callback( null, true );
            } else
            {
                callback( new Error( `${ origin } is not allowed by CORS` ) );
            }
        },
        credentials: true,
    } ),
);

app.use( express.json() );

// Catch invalid JSON syntax in request body (return 400 instead of 500)
app.use( ( err: any, req: Request, res: Response, next: NextFunction ) =>
{
    if (
        err instanceof SyntaxError &&
        "status" in err &&
        ( err as any ).status === 400
    )
    {
        res.status( 400 ).json( { error: "Malformed JSON payload in request body." } );
        return;
    }
    next( err );
} );

// Health check for the service
app.get( "/health", ( req: Request, res: Response ) =>
{
    res.json( { status: "ok", timeStamp: new Date().toISOString() } );
} );

// Mount all domain routes under /api
app.use( "/api", quoteRoutes );
app.use( "/api", favoriteRoutes );

// Catch-all for unhandled routes (JSON 404 instead of Express HTML)
app.use( ( req: Request, res: Response ) =>
{
    res
        .status( 404 )
        .json( { error: `Route ${ req.method } ${ req.originalUrl } not found.` } );
} );

// Centralized error handler
app.use( ( err: Error, req: Request, res: Response, next: NextFunction ) =>
{
    console.error( "[Error Logger]:", err.message );

    if ( err instanceof UpstreamApiError )
    {
        res
            .status( err.statusCode )
            .json( { error: err.message, upstreamCode: err.upstreamErrorCode } );
        return;
    }

    res.status( 500 ).json( { error: "Internal server error" } );
} );

app.listen( config?.port, '0.0.0.0', () =>
{
    console.log( `Server running on http://localhost:${ config?.port }` );
    if ( !config.favqsApiKey )
    {
        console.warn( "Warning: Missing FAVQS_API_KEY in the .env. Upstream authorized calls will fail." );
    }
} );
