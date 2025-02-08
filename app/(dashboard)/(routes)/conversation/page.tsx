"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { Bot, MessageSquare } from "lucide-react";
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
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { BotAvatar } from "@/components/bot-avatar";

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

            console.log('Response from API:', response.data);  // Log response

            const assistantMessage: ChatMessage = {
                role: "assistant",
                content: response.data.choices[0].message.content,  // Adjust to extract the content from the response
            };

            setMessages((current) => [
                ...current,
                userMessage,
                assistantMessage,
            ]);
            form.reset();
        } catch (error: any) {
            console.log(error);
        } finally {
            router.refresh();
        }
    };


    const renderMessageContent = (
        content: string | OpenAI.ChatCompletionContentPart[] | ChatCompletionContentPartText[] | (ChatCompletionContentPartText | ChatCompletionContentPartRefusal)[] | null | undefined
    ) => {
        if (!content) return null;

        if (typeof content === "string") {
            return content;  
        }

        return content.map((part, index) => {
            if ("text" in part) {
                return <span key={index}>{part.text}</span>;
            }

            if ("refusal" in part) {
                return <span key={index}>[Refusal message]</span>;
            }

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
                    {isLoading && (
                        <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
                            <Loader/>
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (<Empty label="No conversation started"/>)}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user"? "bg-white border border-black/10" : "bg-muted"
                            )}>
                                <strong>{message.role === "user" ? <UserAvatar/> : <BotAvatar/> }</strong>
                                <div className="text-sm">{renderMessageContent(message.content)}</div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConversationPage;
