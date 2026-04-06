import { GoogleGenerativeAI } from '@google/generative-ai';

const PROMPT =
  'สิ่งของที่มองเห็นในรูปภาพนี้คืออะไรบ้าง? โปรดระบุเป็นชื่อสิ่งของสั้นๆ เท่านั้น แยกแต่ละรายการด้วยเครื่องหมายคอมม่า (,) เช่น เสื้อกันหนาว, กุญแจรถ, หนังสือ';

export async function geminiListItemsFromImage(
  imageBuffer: ArrayBuffer,
  mimeType: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error('ไม่ได้ตั้งค่า GEMINI_API_KEY');
  }
  const cleanMime = (mimeType || 'image/jpeg').split(';')[0].trim();
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent([
    PROMPT,
    {
      inlineData: {
        data: Buffer.from(imageBuffer).toString('base64'),
        mimeType: cleanMime,
      },
    },
  ]);
  return result.response.text();
}
