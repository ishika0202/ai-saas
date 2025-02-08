import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

const instructionMessage: ChatCompletionMessageParam = {
    role: "system",
    content: "You are a helpful AI assistant specialized in generating code. - If the user asks for a code-related question, provide a markdown-formatted code snippet. - If the user asks a general question, respond with a clear and concise text answer."
};

export async function POST(req: Request) {
    try {
        const authData = await auth();
        const userId = authData?.userId;
        console.log("Auth Data:", authData); 

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return new NextResponse("OpenAI API key not configured", { status: 500 });
        }

        const body = await req.json();

        console.log("Received body:", body);

        const { messages } = body;

        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        // Call OpenAI API to generate a response
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [instructionMessage, ...messages] as ChatCompletionMessageParam[],
        });

        // Return the response from OpenAI
        return NextResponse.json(response);
    } catch (error) {
        // Log error for debugging
        console.error("[CONVERSATION_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
