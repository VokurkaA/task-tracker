import {
    Alert,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
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

export default function SignIn({
                                   setActiveScreen,
                               }: {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
}) {
    const {login} = useAuth();
    const [error, setError] = useState<string | null>(null);

    const validateEmail = (val: string) => {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val)) {
            return "Enter a valid email address";
        }
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = String(formData.get("email") || "");
        const password = String(formData.get("password") || "");

        try {
            await login({email, password});
        } catch (err: any) {
            setError(err?.response?.data?.error || "Login failed");
        }
    };

    return (<div className="relative p-4 h-svh flex items-center justify-center">
        <Form validationBehavior="native" onSubmit={onSubmit}>
            <Card className="p-8 min-w-md">
                <CardHeader className="flex flex-col gap-3">
                    <CardTitle className="text-2xl font-bold text-center">
                        Sign In
                    </CardTitle>

                    {error && (<Alert status="danger">
                        <Alert.Indicator/>
                        <Alert.Content>
                            <Alert.Title>Login error</Alert.Title>
                            <Alert.Description>{error}</Alert.Description>
                        </Alert.Content>
                    </Alert>)}
                </CardHeader>

                <CardContent className="space-y-6">
                    <TextField
                        isRequired
                        name="email"
                        type="email"
                        autoComplete="email"
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
                        name="password"
                        type="password"
                        autoComplete="current-password"
                    >
                        <Label>Password</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:lock" className="text-default-500"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your password"
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>
                </CardContent>

                <CardFooter className="flex flex-col mt-4 gap-2">
                    <Button type="submit" variant="primary" className="w-full">
                        <Icon icon="gravity-ui:check"/>
                        Sign In
                    </Button>

                    <Link onClick={() => setActiveScreen("SignUp")}>
                        Don’t have an account? Create one
                        <LinkIcon/>
                    </Link>
                </CardFooter>
            </Card>
        </Form>
    </div>);
}
