"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { Bot, Code } from "lucide-react";
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
import ReactMarkDown from "react-markdown"

// Define the types to handle
type ChatMessage = OpenAI.ChatCompletionMessageParam;
type ChatCompletionContentPartText = OpenAI.ChatCompletionContentPartText;
type ChatCompletionContentPartRefusal = OpenAI.ChatCompletionContentPartRefusal;

const CodePage = () => {
    const router = useRouter();
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const userMessage: ChatMessage = {
                role: "user",
                content: values.prompt,
            };

            const newMessages = [...messages, userMessage];

            const response = await axios.post("/api/code", {
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
                title="Code Generation"
                description="Generate code using descriptive text"
                icon={Code}
                iconColor="text-green-700"
                bgColor="bg-green-700/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
                        >
                            <FormField
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12 lg:col-span-10">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="Simple toggle button using react hooks."
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
                            <Loader />
                        </div>
                    )}
                    {messages.length === 0 && !isLoading && (<Empty label="No conversation started" />)}
                    <div className="flex flex-col-reverse gap-y-4">
                        {messages.map((message, index) => (
                            <div key={index} className={cn("p-8 w-full flex items-start gap-x-8 rounded-lg",
                                message.role === "user" ? "bg-white border border-black/10" : "bg-muted"
                            )}>
                                <strong>{message.role === "user" ? <UserAvatar /> : <BotAvatar />}</strong>
                                <ReactMarkDown
                                    components={{
                                        pre: ({ node, ...props }) => (
                                            <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                                                <pre {...props} />
                                            </div>
                                        ),
                                        code: ({ node, ...props }) => (
                                            <code
                                                {...props}
                                                className="rounded-lg p-1"
                                            />
                                        ),
                                    }}
                                    className="text-sm overflow-hidden leading-7"
                                >
                                    {Array.isArray(message.content)
                                        ? message.content
                                            .map((part) => {
                                                if (typeof part === "string") return part;
                                                if ("text" in part) return part.text;
                                                return "";
                                            })
                                            .join("")
                                        : message.content || ""}
                                </ReactMarkDown>


                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CodePage;
