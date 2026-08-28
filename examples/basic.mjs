import { ApickClient } from 'apick-api';

const client = new ApickClient(process.env.APICK_API_KEY);

const business = await client.businessDetails('439-87-00761');
console.log(business.data);
console.log(business.meta);

const parcel = await client.trackParcelAuto('123456789012');
console.log(parcel.data);
