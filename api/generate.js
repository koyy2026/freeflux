import OpenAI from "openai";

const ALLOWED_MODELS = new Set([
    "flux.1-schnell", "flux.1-dev", "flux.1-krea-dev",
    "flux.1.1-pro", "flux.1-kontext-pro"
]);

// 新增：允許的圖像尺寸清單，用於安全驗證
const ALLOWED_SIZES = new Set([
    "1024x1024",
    "1792x1024",
    "1024x1792"
]);

export default async function handler(request) {
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // 從請求中獲取 size 參數
        const { apiKey, baseUrl, model, prompt, size } = await request.json();

        // 驗證必要參數
        if (!apiKey || !model || !prompt || !size) {
            return new Response(JSON.stringify({ error: 'apiKey, model, prompt, and size are required' }), { status: 400 });
        }
        if (!ALLOWED_MODELS.has(model)) {
            return new Response(JSON.stringify({ error: 'Invalid model specified' }), { status: 400 });
        }
        // 新增：驗證 size 參數
        if (!ALLOWED_SIZES.has(size)) {
            return new Response(JSON.stringify({ error: 'Invalid size specified' }), { status: 400 });
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: baseUrl,
        });

        // 在呼叫 API 時傳入 size 參數
        const response = await openai.images.generate({
            model: model,
            prompt: prompt,
            size: size, // 使用動態傳入的尺寸
            n: 1,
        });

        const imageUrl = response.data[0].url;

        return new Response(JSON.stringify({ imageUrl: imageUrl }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        // ... (錯誤處理)
    }
}
