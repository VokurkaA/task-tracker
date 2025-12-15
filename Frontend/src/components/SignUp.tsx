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
    LinkIcon,
    TextField,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import * as React from "react";
import {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth";

export default function SignUp({
                                   setActiveScreen,
                               }: {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
}) {
    const {signup} = useAuth();
    const [error, setError] = useState<string | null>(null);

    const validateUsername = (val: string) => val.trim() ? null : "Username is required";

    const validateEmail = (val: string) => {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val)) {
            return "Enter a valid email address";
        }
        return null;
    };

    const validatePassword = (val: string) => {
        if (val.length < 6) return "Password must be at least 6 characters";
        if (!/[A-Z]/.test(val)) return "Must contain one uppercase letter";
        if (!/[0-9]/.test(val)) return "Must contain one number";
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const username = String(formData.get("username") || "");
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        try {
            await signup({username, email, password});
        } catch (err: any) {
            setError(err?.response?.data?.error || "Sign up failed");
        }
    };

    return (<div className="relative p-4 h-svh flex items-center justify-center">
        <Form validationBehavior="native" onSubmit={onSubmit}>
            <Card className="p-8 min-w-md">
                <CardHeader className="flex flex-col gap-3">
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign Up
                    </CardTitle>

                    {error && (<Alert status="danger">
                        <Alert.Indicator/>
                        <Alert.Content>
                            <Alert.Title>Sign up error</Alert.Title>
                            <Alert.Description>{error}</Alert.Description>
                        </Alert.Content>
                    </Alert>)}
                </CardHeader>

                <CardContent className="space-y-6">
                    <TextField
                        isRequired
                        name="username"
                        type="text"
                        validate={validateUsername}
                    >
                        <Label>Username</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:person" className="text-default-500"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="username"
                                autoComplete="username"
                                placeholder="Enter your username"
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField
                        isRequired
                        name="email"
                        type="email"
                        validate={validateEmail}
                    >
                        <Label>Email</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:envelope" className="text-default-500"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="email"
                                autoComplete="email"
                                placeholder="john@example.com"
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField
                        isRequired
                        minLength={6}
                        validate={validatePassword}
                    >
                        <Label>Password</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:lock" className="text-default-500"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Create a password"
                            />
                        </InputGroup>
                        <Description>
                            At least 6 characters, 1 uppercase letter, 1 number
                        </Description>
                        <FieldError/>
                    </TextField>
                </CardContent>

                <CardFooter className="flex flex-col mt-4 gap-2">
                    <Button type="submit" variant="primary" className="w-full">
                        <Icon icon="gravity-ui:check"/>
                        Sign Up
                    </Button>

                    <Link onClick={() => setActiveScreen("SignIn")}>
                        Already have an account? Sign in
                        <LinkIcon/>
                    </Link>
                </CardFooter>
            </Card>
        </Form>
    </div>);
}
