import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
    try {
        // Get authentication data
        const authData = await auth();
        const userId = authData?.userId;
        console.log("Auth Data:", authData); // Debugging line

        // If userId is not present, return Unauthorized
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // If OpenAI API key is missing, return an error
        if (!process.env.OPENAI_API_KEY) {
            return new NextResponse("OpenAI API key not configured", { status: 500 });
        }

        // Parse the request body as JSON
        const body = await req.json();

        // Log the incoming request body for debugging
        console.log("Received body:", body);

        const { messages } = body;

        // Check if the messages array is present
        if (!messages) {
            return new NextResponse("Messages are required", { status: 400 });
        }

        // Call OpenAI API to generate a response
        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages,
        });

        // Return the response from OpenAI
        return NextResponse.json(response);
    } catch (error) {
        // Log error for debugging
        console.error("[CONVERSATION_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
