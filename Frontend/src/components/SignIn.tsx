import {Avatar, Button, Card, FieldError, Form, InputGroup, Label, Link, TextField,} from "@heroui/react";
import React, {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth";
import {toast} from "sonner";
import {Icon} from "@iconify/react";

type SignInProps = {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
};

export default function SignIn({setActiveScreen}: SignInProps) {
    const {login} = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);

    const getEmailError = (value: string) => {
        if (!value) return "Email is required";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
            return "Please enter a valid email address";
        }
        return null;
    };

    const getPasswordError = (value: string) => {
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const emailError = getEmailError(email);
        const passwordError = getPasswordError(password);

        if (emailError) {
            toast.error(emailError);
            return;
        }

        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        try {
            await login({email, password});
            toast.success("Signed in successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Login failed. Check your credentials.");
        }
    };

    return (<div className="h-svh flex items-center justify-center">
        <Card className="w-md p-8">
            <Card.Header className="flex items-center">
                <Avatar className="mb-4 size-16">
                    <Avatar.Fallback>
                        <Icon className="size-6" icon="gravity-ui:person"/>
                    </Avatar.Fallback>
                </Avatar>
                <Card.Title className="text-2xl">Welcome Back</Card.Title>
                <Card.Description>Sign in to your account to continue</Card.Description>
            </Card.Header>
            <Card.Content>
                <Form
                    className="space-y-4"
                    validationBehavior="aria"
                    onSubmit={onSubmit}
                >
                    <TextField
                        isRequired
                        name="email"
                        value={email}
                        onChange={setEmail}
                        validate={(val) => {
                            if (!val) return null;
                            return getEmailError(val);
                        }}
                    >
                        <Label>Email</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon
                                    className="text-muted size-4"
                                    icon="gravity-ui:envelope"
                                />
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="name@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField
                        isRequired
                        name="password"
                        value={password}
                        onChange={setPassword}
                        validate={(val) => {
                            if (!val) return null;
                            return getPasswordError(val);
                        }}
                    >
                        <Label>Password</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:lock"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="password"
                                type={isVisible ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <InputGroup.Suffix>
                                <Button
                                    isIconOnly
                                    aria-label={isVisible ? "Hide password" : "Show password"}
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => setIsVisible(!isVisible)}
                                >
                                    <Icon
                                        className="size-4"
                                        icon={isVisible ? "gravity-ui:eye" : "gravity-ui:eye-slash"}
                                    />
                                </Button>
                            </InputGroup.Suffix>
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <Button className="flex-1 w-full" type="submit" variant="primary">
                        Log in
                    </Button>
                </Form>
            </Card.Content>
            <Card.Footer className="flex items-center justify-center">
                <Link onPress={() => setActiveScreen("SignUp")}>
                    Don't have an account? Create one
                    <Link.Icon/>
                </Link>
            </Card.Footer>
        </Card>
    </div>);
}