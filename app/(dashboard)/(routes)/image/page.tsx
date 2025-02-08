"use client";

import * as z from "zod";
import { Heading } from "@/components/heading";
import { Bot, Download, MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { amountOptions, formSchema, resolutionOptions } from "./constants";
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
import { ImageIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardFooter ,Card} from "@/components/ui/card";
import Image from "next/image";


type ChatMessage = OpenAI.ChatCompletionMessageParam;
type ChatCompletionContentPartText = OpenAI.ChatCompletionContentPartText;
type ChatCompletionContentPartRefusal = OpenAI.ChatCompletionContentPartRefusal;

const ImagePage = () => {
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            prompt: "",
            amount: "1",
            resolution: "512x512"
        },
    });

    const isLoading = form.formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setImages([])
            const response = await axios.post("/api/image", values);
            const urls = response.data.map((image: { url: string }) => image.url);

            console.log('Response from API:', response.data);
            setImages(urls);

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
                title="Image Generation"
                description="Turn your prompt into an image"
                icon={ImageIcon}
                iconColor="text-pink-700"
                bgColor="bg-pink-700/10"
            />
            <div className="px-4 lg:px-8">
                <div>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)} 
                            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-4"
                        >
                            <FormField
                                name="prompt"
                                render={({ field }) => (
                                    <FormItem className="col-span-12">
                                        <FormControl className="m-0 p-0">
                                            <Input
                                                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                                                disabled={isLoading}
                                                placeholder="A picture of a horse in Swiss alps"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                name="amount"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem className="col-span-6 lg:col-span-6">
                                            <Select
                                                disabled={isLoading}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue defaultValue={field.value} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {amountOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    );
                                }}
                            />

                            <FormField
                                name="resolution"
                                control={form.control}
                                render={({ field }) => {
                                    return (
                                        <FormItem className="col-span-6 lg:col-span-6">
                                            <Select
                                                disabled={isLoading}
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue defaultValue={field.value} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {resolutionOptions.map((option) => (
                                                        <SelectItem
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.value}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    );
                                }}
                            />

                            <Button
                                type="submit"
                                className="col-span-12 lg:col-span-2 w-full cursor-pointer"
                                disabled={isLoading}
                            >
                                Generate
                            </Button>
                        </form>
                    </Form>
                </div>
                <div className="space-y-4 mt-4">
                    {isLoading && (
                        <div className="p-20">
                            <Loader />
                        </div>
                    )}
                    {images.length === 0 && !isLoading && (<Empty label="No images generated." />)}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mat-8">                    
                        {images.map((src) => (
                            <Card
                                key={src}
                                className="rounded-lg overflow-hidden"
                            >
                                <div className="relative aspect-square">
                                    <Image
                                        alt="Image"
                                        fill
                                        src={src}
                                    />
                                </div>
                                <CardFooter className="p-2">
                                    <Button onClick={()=>window.open(src)} variant="secondary" className="w-full">
                                        <Download className="h-4 w-4 mr-2"/>
                                        Download
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImagePage;
