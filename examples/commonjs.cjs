const { ApickClient } = require('apick-api');

async function main() {
	const client = new ApickClient(process.env.APICK_API_KEY);
	const result = await client.whois('apick.app');
	console.log(result.data);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
