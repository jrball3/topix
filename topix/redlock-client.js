const RedisClient = require('./redis-client')
const Redlock = require('redlock')

const redlock = new Redlock(
	// you should have one client for each independent redis node
	// or cluster
	[RedisClient],
	{
		// the expected clock drift; for more details
		// see http://redis.io/topics/distlock
		driftFactor: 0.01, // time in ms

		// the max number of times Redlock will attempt
		// to lock a resource before erroring
		retryCount:  20,

		// the time in ms between attempts
		retryDelay:  250, // time in ms

		// the max time in ms randomly added to retries
		// to improve performance under high contention
		// see https://www.awsarchitectureblog.com/2015/03/backoff.html
		retryJitter:  200 // time in ms
	}
);

module.exports = redlock