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
    TextField,
} from "@heroui/react";
import {type SetStateAction, useState} from "react";
import {useAuth} from "../hooks/useAuth.ts";
import {Icon} from "@iconify/react";

export default function SignUp({setActiveScreen}: {
    setActiveScreen: (activeScreen: SetStateAction<"SignIn" | "SignUp">) => void;
}) {
    const {signup} = useAuth();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const validatePassword = (val: string) => {
        if (val.length < 6) return "Min 6 chars";
        if (!/[A-Z]/.test(val)) return "Needs uppercase";
        if (!/[0-9]/.test(val)) return "Needs number";
        return null;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setApiError(null);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        const newErrors: Record<string, string> = {};

        if (!String(data.username).trim()) {
            newErrors.username = "Username is required";
        }

        if (!String(data.email).trim()) {
            newErrors.email = "Email is required";
        }

        const password = String(data.password);
        if (!password) {
            newErrors.password = "Password is required";
        } else {
            const passIssue = validatePassword(password);
            if (passIssue) newErrors.password = passIssue;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsLoading(true);

        try {
            await signup({
                username: String(data.username), email: String(data.email), password: String(data.password)
            });
        } catch (err: any) {
            setApiError(err?.response?.data?.error || "Sign up failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (<div className="h-svh w-full flex items-center justify-center bg-default-50 p-4">
        <Card className="w-full max-w-md shadow-xl p-6">
            <CardHeader className="text-center pb-2">
                <div
                    className="mx-auto bg-success/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-success">
                    <Icon icon="gravity-ui:person-plus" className="text-2xl"/>
                </div>
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <Description>Join us to start tracking your tasks</Description>
            </CardHeader>
            {/* 4. Pass the errors object to the Form component */}
            <Form
                validationBehavior="native"
                onSubmit={onSubmit}
                validationErrors={errors}
            >
                <CardContent className="space-y-4">
                    {/* Only show the Alert for generic API errors */}
                    {apiError && (<Alert status="danger">
                        <Icon icon="gravity-ui:circle-exclamation-fill" className="text-danger"/>
                        <span className="ml-2 text-sm font-medium">{apiError}</span>
                    </Alert>)}

                    <TextField isRequired name="username">
                        <Label>Username</Label>
                        <InputGroup>
                            <InputGroup.Prefix><Icon icon="gravity-ui:person"/></InputGroup.Prefix>
                            <InputGroup.Input placeholder="johndoe"/>
                        </InputGroup>
                        {/* This will now automatically render "Username is required" when set in state */}
                        <FieldError/>
                    </TextField>

                    <TextField isRequired name="email" type="email">
                        <Label>Email</Label>
                        <InputGroup>
                            <InputGroup.Prefix><Icon icon="gravity-ui:envelope"/></InputGroup.Prefix>
                            <InputGroup.Input placeholder="john@example.com"/>
                        </InputGroup>
                        <FieldError/>
                    </TextField>

                    <TextField isRequired name="password" type="password" validate={validatePassword}>
                        <Label>Password</Label>
                        <InputGroup>
                            <InputGroup.Prefix><Icon icon="gravity-ui:lock"/></InputGroup.Prefix>
                            <InputGroup.Input placeholder="Create a strong password"/>
                        </InputGroup>
                        <Description className="text-xs">
                            Must contain 1 uppercase, 1 number, and 6+ characters.
                        </Description>
                        <FieldError/>
                    </TextField>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-2">
                    <Button type="submit" variant="primary" className="w-full" isPending={isLoading}>
                        Get Started
                    </Button>

                    <div className="flex items-center gap-2 w-full">
                        <Separator className="flex-1"/>
                        <span className="text-xs text-default-400">OR</span>
                        <Separator className="flex-1"/>
                    </div>

                    <div className="text-center text-sm text-default-500">
                        Already have an account?{" "}
                        <Link onPress={() => setActiveScreen("SignIn")}
                              className="cursor-pointer font-semibold text-primary">
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Form>
        </Card>
    </div>);
}