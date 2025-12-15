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
    TextField
} from "@heroui/react";
import {Icon} from "@iconify/react";
import * as React from "react";
import {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth.ts";

export default function SignUp({setActiveScreen}: {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void
}) {
    const {signup} = useAuth();
    const [error, setError] = useState<string | null>(null);

    const validatePassword = (val: string) => {
        if (val.length < 6) {
            return "Password must be at least 6 characters";
        }
        if (!/[A-Z]/.test(val)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[0-9]/.test(val)) {
            return "Password must contain at least one number";
        }
        return null;
    };

    const validateEmail = (val: string) => {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val)) {
            return "Please enter a valid email address";
        }
        return null;
    };

    const validateUsername = (val: string) => {
        if (!val.trim()) {
            return "Username is required";
        }
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        const username = formData.get("username")?.toString() || "";
        const email = formData.get("email")?.toString() || "";
        const password = formData.get("password")?.toString() || "";
        try {
            await signup({email, password, username});
        } catch (err: any) {
            setError(err?.response?.data?.error || "Sign up failed");
        }
    };

    return (<div className='relative p-4 h-svh flex items-center justify-center'>
        <Form validationBehavior="native" onSubmit={onSubmit}>
            <Card className="p-8">
                <CardHeader className="flex flex-col gap-3">
                    <CardTitle>Sign Up</CardTitle>
                    {error && (<Alert status="danger">
                        <Alert.Indicator/>
                        <Alert.Content>
                            <Alert.Title>Login Error</Alert.Title>
                            <Alert.Description>
                                {error}
                            </Alert.Description>
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
                                type="text"
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
                                type="email"
                                autoComplete="email"
                                placeholder="john@example.com"
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField
                        isRequired
                        minLength={6}
                        name="password"
                        type="password"
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
                        <Description>Must be at least 6 characters with 1 uppercase and 1 number</Description>
                        <FieldError/>
                    </TextField>
                </CardContent>
                <CardFooter className="flex flex-col mt-4 gap-2">
                    <Button type="submit" variant="primary" className="w-full">
                        <Icon icon="gravity-ui:check"/>
                        Sign Up
                    </Button>
                    <Link className='text-right' onClick={() => {
                        setActiveScreen('SignUp')
                    }}>
                        Already have an account? Sign In
                        <LinkIcon/>
                    </Link>
                </CardFooter>
            </Card>
        </Form>
    </div>);
}