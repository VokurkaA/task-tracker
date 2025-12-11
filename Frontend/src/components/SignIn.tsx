import {
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Description,
    FieldError,
    Form,
    Input,
    Label,
    TextField
} from "@heroui/react";
import {Icon} from "@iconify/react";
import * as React from "react";
import {useAuth} from "../hooks/useAuth.ts";

export default function SIgnIn() {
    const {login} = useAuth();
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
    }
    const validateEmail = (val: string) => {
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(val)) {
            return "Please enter a valid email address";
        }
        return null;
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get("email")?.toString() || "";
        const password = formData.get("password")?.toString() || "";
        login({ email, password }).then((result) => {console.log(result);});
    };


    return (<Card>
        <Form className="flex w-96 flex-col gap-4" onSubmit={onSubmit}>
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
                <TextField
                    isRequired
                    name="email"
                    type="email"
                    autoComplete="email"
                    validate={validateEmail}>
                    <Label>Email</Label>
                    <Input placeholder="john@example.com"
                    />
                    <FieldError/>
                </TextField>

                <TextField
                    isRequired
                    minLength={8}
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    validate={validatePassword}>
                    <Label>Password</Label>
                    <Input placeholder="Enter your password"/>
                    <Description>Must be at least 6 characters with 1 uppercase and 1 number</Description>
                    <FieldError/>
                </TextField>

            </CardContent>
            <CardFooter>
                <Button type="submit">
                    <Icon icon="gravity-ui:check"/>
                    Submit
                </Button>
            </CardFooter>
        </Form>
    </Card>);
}