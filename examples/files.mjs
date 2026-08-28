import { ApickClient } from 'apick-api';

const client = new ApickClient(process.env.APICK_API_KEY);

const ocr = await client.ocr('./receipt.jpg');
console.log(ocr.data.result.full_text);

const pdf = await client.htmlToPdf('<h1>APICK report</h1>', { pagination: true });
await pdf.save('./report.pdf');
