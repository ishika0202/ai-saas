"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { formSchema } from "./constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import OpenAI from "openai";

// Define the types to handle
type ChatMessage = OpenAI.ChatCompletionMessageParam;
type ChatCompletionContentPartText = OpenAI.ChatCompletionContentPartText;
type ChatCompletionContentPartRefusal = OpenAI.ChatCompletionContentPartRefusal;

const ConversationPage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            promt: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const userMessage: ChatMessage = {
                role: "user",
                content: values.promt,
            };

            const newMessages = [...messages, userMessage];

            const response = await axios.post("/api/conversation", {
                messages: newMessages,
            });

            setMessages((current) => [...current, userMessage, response.data]);
            form.reset();
            // TODO: Open Pro Modal (if needed)
        } catch (error: any) {
            console.log(error);
        } finally {
            router.refresh();
        }
    };

    // Adjust the content renderer to handle different types
    const renderMessageContent = (
        content: string | OpenAI.ChatCompletionContentPart[] | ChatCompletionContentPartText[] | (ChatCompletionContentPartText | ChatCompletionContentPartRefusal)[] | null | undefined
    ) => {
        if (!content) return null;

        if (typeof content === "string") {
            return content;  // Simple string message
        }

        // Handle array of ChatCompletionContentParts (including Text and Refusal)
        return content.map((part, index) => {
            if ("text" in part) {
                // Handle Text content
                return <span key={index}>{part.text}</span>;
            }

            // If it's a refusal, return a fallback message
            if ("refusal" in part) {
                return <span key={index}>[Refusal message]</span>;
            }

            // If the content is unknown, render fallback
            return <span key={index}>[Unknown content]</span>;
        });
    };

    return (
        <div>
            <Heading
                title="Conversation"
                description="Our most advanced Conversation model"
                icon={MessageSquare}
                iconColor="text-violet-500"
                bgColor="bg-violet-500/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}  // Form submission using react-hook-form
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                        >
                            <FormField
                                name="promt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="How do I calculate the radius of a circle?"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"  // Ensure it's a submit button
                                className="col-span-12 lg:col-span-2 w-full cursor-pointer"
                                disabled={isLoading}  // Disable while loading
                            >
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    <div className="flex flex-col-reverse gap-y-4">
                    {messages.map((message: ChatMessage, index: number) => (
                            <div key={index}>
                                {renderMessageContent(message.content)}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConversationPage;
