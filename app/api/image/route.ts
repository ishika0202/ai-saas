

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {


    console.log(process.env.OPENAI_API_KEY)
    try {
        const body = await req.json();
        console.log(body);
        const userId = await auth();
        const {prompt, amount, resolution = "512x512"} = body;

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return new NextResponse("OpenAI API key not configured", { status: 500 });
        }


        console.log("Received body:", body);

        if (!prompt) {
            console.log("NO PROMPT");
            return new NextResponse("Prompt are required", { status: 400 });
        }
        if (!amount) {
            console.log("NO AMOUNT");
            return new NextResponse("amount are required", { status: 400 });
        }
        if (!resolution) {
            console.log("NO RESOLUTION");
            return new NextResponse("resolution are required", { status: 400 });
        }


        const response = await openai.images.generate({
            prompt,
            n: parseInt(amount,10),
            size: resolution,
        });
        const imageUrls = response.data.map((img) => img.url);

        return NextResponse.json(response.data)
    } 
    catch (error) {

        console.error("[IMAGE_ERROR]", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
