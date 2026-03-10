import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, shortDescription, fullDescription } = body;

        // Ensure at least one field has content to enhance
        if (!title && !shortDescription && !fullDescription) {
            return NextResponse.json({ error: 'Please enter at least one text field to enhance.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured in environment variables.' }, { status: 500 });
        }

        const systemInstruction = `You are an expert copywriter and travel editor for a high-end travel experience platform. 
The user is providing you with draft drafts for a travel experience listing (potentially in broken english).
Your job is to rewrite these fields to be professional, engaging, and in excellent standard English. 
Maintain the original meaning, but make it sound far more appealing for a luxury/modern travel platform.

You MUST return a pure JSON object in the exact format matching the input fields provided. Do not include markdown \`\`\`json wrappers in the output.`;

        const prompt = `Please rewrite the following fields professionally:\n\nTitle: ${title || '(Empty)'}\n\nShort Description: ${shortDescription || '(Empty)'}\n\nFull Description: ${fullDescription || '(Empty)'}\n\nRespond with a JSON object containing keys: "title", "shortDescription", and "fullDescription".`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemInstruction }]
                },
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to communicate with Gemini AI.');
        }

        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!responseText) {
            throw new Error('No valid response received from Gemini.');
        }

        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseText.trim());
        } catch (e) {
            console.error("Failed to parse AI JSON response:", responseText);
            throw new Error('AI returned an invalid format. Please try again.');
        }

        return NextResponse.json({
            title: parsedResponse.title || title,
            shortDescription: parsedResponse.shortDescription || shortDescription,
            fullDescription: parsedResponse.fullDescription || fullDescription
        });

    } catch (error: any) {
        console.error('AI Enhance API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
