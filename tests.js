const recursivePromise = require( './index' );
const { expect, use: chaiUse } = require( 'chai' );
const { spy } = require( 'sinon' );
const chaiAsPromised = require( 'chai-as-promised' );
const sinonChai = require( 'sinon-chai' );

chaiUse( chaiAsPromised );
chaiUse( sinonChai );

describe( 'recursivePromise()', () => {
	it( 'is a function', () => {
		expect( recursivePromise ).to.be.a( 'function' );
	} );

	it( 'returns results from all promises in correct order', async () => {
		const promises = createPromises();
		const results = await recursivePromise( promises );

		expect( results ).to.deep.equal( createSequence( promises.length ) );
	} );

	it( 'calls #then()s in correct order', async () => {
		const promises = createPromises();

		await recursivePromise( promises );

		promises.forEach( ( promise, i ) => {
			if ( i === promises.length - 1 ) {
				return;
			}

			expect( promise.then, `#${ i } then` ).to.be.calledImmediatelyBefore( promises[ i + 1 ].then );
		} );
	} );

	it( 'returns the first catched error with all previously resolved results', async () => {
		const rejectAt = getRandomNumberFromRange( 1, 6 );
		const promises = createPromises( {
			rejectAt
		} );

		try {
			await recursivePromise( promises );
		} catch ( { error, results } ) {
			expect( error ).to.be.an.instanceOf( Error );
			expect( error.message ).to.equal( 'Promise error' );
			expect( results ).to.deep.equal( createSequence( rejectAt ) );

			return;
		}

		expect.fail( 'Exception should be raised' );

	} );
} );

/**
 * Creates promises for the tests
 * @param {Object} [options] Optional options
 * @param {Number} [options.min=7] The minimal amount of promises.
 * @param {Number} [options.max=14] The maximal amount of promises.
 * @param {Number/null} [options.rejectAt] Index of the promise in the returned array
 * that should reject.
 * @return {Array<Promise>} Array of promises
 */
function createPromises( {
	min = 7,
	max = 14,
	rejectAt = null
} = {} ) {
	const amount = getRandomNumberFromRange( min, max );
	const spiedPromises = Array( amount ).fill( 0 ).map( ( _, i ) => {
		const promise = new Promise( ( resolve, reject ) => {
			if ( rejectAt === i ) {
				reject( new Error( 'Promise error' ) );
			}

			resolve( i );
		} );

		spy( promise, 'then' );

		return promise;
	} );

	return spiedPromises;
}

/**
 * Gets random number from the range.
 *
 * @param {Number} min The minimal value of the random number
 * @param {Number} max The maximal value of the random number.
 * @return {Number} Random number.
 */
function getRandomNumberFromRange( min = 0, max = 1 ) {
	return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

/**
 * Generates sequence from 0 to length - 1.
 *
 * @param {Number} length The length of the sequence
 * @return {Array} The sequence.
 */
function createSequence( length ) {
	return Array( length ).fill( 0 ).map( ( _, i ) => {
		return i;
	} );
}
