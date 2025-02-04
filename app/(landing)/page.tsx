import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
    return (
        <div>
            <div>
                <Link href="/sign-in">
                    <Button >
                        <a>Login</a>
                    </Button>
                </Link>

                <Link href="/sign-up">
                    <Button>
                        <a>Register</a>
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default LandingPage;
