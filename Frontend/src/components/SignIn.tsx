import {
    Alert,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Description,
    FieldError,
    Form,
    InputGroup,
    Label,
    Link,
    Separator,
    TextField
} from "@heroui/react";
import {Icon} from "@iconify/react";
import * as React from "react";
import {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth";

export default function SignIn({setActiveScreen}: {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
}) {
    const {login} = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        try {
            await login({
                email: String(formData.get("email")), password: String(formData.get("password"))
            });
        } catch (err: any) {
            setError(err?.response?.data?.error || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    return (<div className="h-svh w-full flex items-center justify-center bg-default-50 p-4">
        <Card className="w-full max-w-md shadow-xl p-6">
            <CardHeader className="text-center pb-2">
                <div
                    className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Icon icon="gravity-ui:lock" className="text-2xl"/>
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <Description>Sign in to your account to continue</Description>
            </CardHeader>

            <Form validationBehavior="native" onSubmit={onSubmit}>
                <CardContent className="space-y-4">
                    {error && (<Alert status="danger">
                        <Icon icon="gravity-ui:circle-exclamation-fill" className="text-danger"/>
                        <span className="ml-2 text-sm font-medium">{error}</span>
                    </Alert>)}

                    <TextField isRequired name="email" type="email">
                        <Label>Email</Label>
                        <InputGroup>
                            <InputGroup.Prefix><Icon icon="gravity-ui:envelope"/></InputGroup.Prefix>
                            <InputGroup.Input placeholder="you@example.com"/>
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField isRequired name="password" type="password">
                        <div className="flex justify-between">
                            <Label>Password</Label>
                            <Link href="#" className="text-xs text-default-500">Forgot password?</Link>
                        </div>
                        <InputGroup>
                            <InputGroup.Prefix><Icon icon="gravity-ui:key"/></InputGroup.Prefix>
                            <InputGroup.Input placeholder="••••••••"/>
                        </InputGroup>
                        <FieldError/>
                    </TextField>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 mt-4">
                    <Button type="submit" variant="primary" className="w-full" isPending={isLoading}>
                        Sign In
                    </Button>

                    <div className="flex items-center gap-2 w-full">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-default-400">OR</span>
                        <Separator className="flex-1"/>
                    </div>

                    <div className="text-center text-sm text-default-500">
                        Don't have an account?{" "}
                        <Link onPress={() => setActiveScreen("SignUp")}
                              className="cursor-pointer font-semibold text-primary">
                            Sign up
                        </Link>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    </div>);
}