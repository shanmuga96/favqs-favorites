import { describe, it, expect, beforeEach } from "vitest";
import { FavoritesRepository } from "./favoritesRepository";

describe( 'FavoritesRepository Tests', () =>
{
    let repository: FavoritesRepository;

    beforeEach( () =>
    {
        repository = new FavoritesRepository();
    } );

    it( 'should save a new favorite quote and return the record with createdAt timestamp', () =>
    {
        const quote = {
            id: 1,
            body: 'A room without books is like a body without a soul.',
            author: "anonymous"
        };

        const saved = repository.save( quote );
        expect( saved.id ).toBe( 1 );
        expect( saved.body ).toBe( 'A room without books is like a body without a soul.' );
        expect( saved.author ).toBe( 'anonymous' );
        expect( saved.createdAt ).toBeDefined();
        expect( new Date( saved.createdAt ).getTime() ).not.toBeNaN();
    } );

    it( 'should prevent duplicate records and update quote details when saving the same ID', () =>
    {
        repository.save( {
            id: 42,
            body: 'Original quote',
            author: 'Author A',
        } );

        const updated = repository.save( {
            id: 42,
            body: 'Updated quote text',
            author: 'Author A',
        } );

        const allFavorites = repository.findAll();

        expect( allFavorites ).toHaveLength( 1 );
        expect( updated.body ).toBe( 'Updated quote text' );
        expect( allFavorites[ 0 ].body ).toBe( 'Updated quote text' );
    } );

    it( 'should return all favorites ordered with newest first', () =>
    {
        repository.save( { id: 10, body: 'First quote', author: 'Author 1' } );
        repository.save( { id: 20, body: 'Second quote', author: 'Author 2' } );
        repository.save( { id: 30, body: 'Third quote', author: 'Author 3' } );

        const all = repository.findAll();

        expect( all ).toHaveLength( 3 );
        expect( all[ 0 ].id ).toBe( 30 );
        expect( all[ 1 ].id ).toBe( 20 );
        expect( all[ 2 ].id ).toBe( 10 );
    } );

    it( 'should accurately check if a quote exists using has()', () =>
    {
        repository.save( { id: 100, body: "You can't connect the dots looking forward; you can only connect them looking backward", author: 'Steve Jobs' } );

        expect( repository.has( 100 ) ).toBe( true );
        expect( repository.has( 101 ) ).toBe( false );
    } );

    it( 'should delete an existing favorite and return true', () =>
    {
        repository.save( { id: 101, body: 'Life is 10% what happens to you and 90% how you react to it.', author: 'Charles R. Swindoll' } );
        repository.save( { id: 102, body: 'One must work and dare if one really wants to live.', author: 'Vincent Van Gogh' } );

        const deleteResult = repository.delete( 101 );
        expect( deleteResult ).toBe( true );
        expect( repository.has( 101 ) ).toBe( false );
        expect( repository.findAll() ).toHaveLength( 1 );
    } );

    it( 'should return false when trying to delete a non-existent favorite', () =>
    {
        const deleteResult = repository.delete( 200 );
        expect( deleteResult ).toBe( false );
    } );
} );