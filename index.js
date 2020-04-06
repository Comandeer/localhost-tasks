function recursivePromise( arrayOfPromises ) {
	return processPromises( [ ...arrayOfPromises ] );
}

/**
 * @param {Array<Promise>} promises Array of promises
 * @param {Array<any>} results Array of results
 * @return {Promise<any[]>} Promise that resolves to results.
 * @throw { { error: Error, results: Array<any> }}
 */
function processPromises( promises, results = [] ) {
	const currentPromise = promises.shift();

	if ( !currentPromise ) {
		return Promise.resolve( results );
	}

	return currentPromise.then( ( result ) => {
		results.push( result );

		return processPromises( [ ...promises ], [ ...results ] );
	} ).catch( ( error ) => {
		const wrappedError = wrapError( error, results );

		return Promise.reject( wrappedError );
	} );
}

function wrapError( error, results ) {
	if ( error.error && Array.isArray( error.results ) ) {
		return error;
	}

	return { error, results };
}

module.exports = recursivePromise;
