import {Avatar, Button, Card, FieldError, Form, InputGroup, Label, Link, TextField,} from "@heroui/react";
import React, {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth";
import {toast} from "sonner";
import {Icon} from "@iconify/react";

type SignUpProps = {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
};

export default function SignUp({setActiveScreen}: SignUpProps) {
    const {signup} = useAuth();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isVisible, setIsVisible] = useState(false);
    const [isConfirmVisible, setIsConfirmVisible] = useState(false);

    const getUsernameError = (value: string) => {
        if (!value) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        return null;
    };

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

    const getConfirmPasswordError = (value: string) => {
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const usernameError = getUsernameError(username);
        const emailError = getEmailError(email);
        const passwordError = getPasswordError(password);
        const confirmPasswordError = getConfirmPasswordError(confirmPassword);

        if (usernameError || emailError || passwordError || confirmPasswordError) {
            toast.error(usernameError || emailError || passwordError || confirmPasswordError);
            return;
        }

        try {
            await signup({username, email, password});
            toast.success("Account created successfully!");
            setActiveScreen("SignIn");
        } catch (err: any) {
            toast.error(err?.response?.data?.error || "Registration failed. Please try again.");
        }
    };

    return (<div className="h-svh flex items-center justify-center">
        <Card className="w-md p-8 my-4 overflow-y-auto max-h-[90vh]">
            <Card.Header className="flex items-center">
                <Avatar className="mb-4 size-16">
                    <Avatar.Fallback>
                        <Icon className="size-6" icon="gravity-ui:person-plus"/>
                    </Avatar.Fallback>
                </Avatar>
                <Card.Title className="text-2xl">Create Account</Card.Title>
                <Card.Description>Sign up to get started</Card.Description>
            </Card.Header>
            <Card.Content>
                <Form
                    className="space-y-4"
                    validationBehavior="aria"
                    onSubmit={onSubmit}
                >
                    <TextField
                        isRequired
                        name="username"
                        value={username}
                        onChange={setUsername}
                        validate={(val) => {
                            if (!val) return null;
                            return getUsernameError(val);
                        }}
                    >
                        <Label>Username</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon className="text-muted size-4" icon="gravity-ui:person"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="username"
                                type="text"
                                autoComplete="username"
                                placeholder="johndoe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </InputGroup>
                        <FieldError/>
                    </TextField>

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
                                autoComplete="new-password"
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

                    <TextField
                        isRequired
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        validate={(val) => {
                            if (!val) return null;
                            return getConfirmPasswordError(val);
                        }}
                    >
                        <Label>Confirm Password</Label>
                        <InputGroup>
                            <InputGroup.Prefix>
                                <Icon icon="gravity-ui:lock"/>
                            </InputGroup.Prefix>
                            <InputGroup.Input
                                name="confirmPassword"
                                type={isConfirmVisible ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <InputGroup.Suffix>
                                <Button
                                    isIconOnly
                                    aria-label={isConfirmVisible ? "Hide password" : "Show password"}
                                    size="sm"
                                    variant="ghost"
                                    onPress={() => setIsConfirmVisible(!isConfirmVisible)}
                                >
                                    <Icon
                                        className="size-4"
                                        icon={isConfirmVisible ? "gravity-ui:eye" : "gravity-ui:eye-slash"}
                                    />
                                </Button>
                            </InputGroup.Suffix>
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <Button className="flex-1 w-full" type="submit" variant="primary">
                        Create Account
                    </Button>
                </Form>
            </Card.Content>
            <Card.Footer className="flex items-center justify-center">
                <Link onPress={() => setActiveScreen("SignIn")}>
                    Already have an account? Log in
                    <Link.Icon/>
                </Link>
            </Card.Footer>
        </Card>
    </div>);
}