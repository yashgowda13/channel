import { createHmac } from 'crypto';

class Crypto {
	static sash(password) {
		if (!process.env.SALT_HASH_SECRET)
			throw new Error('Unable to Access HASH SECRET');
		return createHmac('sha512', process.env.SALT_HASH_SECRET)
			.update(password)
			.digest('hex');
	}
}

export default Crypto;
