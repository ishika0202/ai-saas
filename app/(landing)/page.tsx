import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
    return (
        <div>
            <div>
                <Link href="/sign-in">
                    <Button >
                        <span>Login</span>
                    </Button>
                </Link>

                <Link href="/sign-up">
                    <Button>
                        <span>Register</span>
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
