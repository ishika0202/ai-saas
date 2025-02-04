import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
    try {
        const authData = await auth();
        const userId = authData?.userId;

        const body = await req.json();
        const { messages } = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return new NextResponse("OpenAI API key not configured", { status: 500 });
        }
        if(!messages){
            return new NextResponse("Messages are required", {status: 400});
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        });

        return NextResponse.json(response);
    } catch (error) {
        console.error("[CONVERSATION_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export default openai;
