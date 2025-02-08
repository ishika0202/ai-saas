import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const BotAvatar = () => {
    return (
        <Avatar className="h-9 w-9">
            <AvatarImage className="p-1" src="/logo.png"/>
        </Avatar>
    )
}