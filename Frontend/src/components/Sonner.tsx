import {Toaster as Sonner} from "sonner";
import {useTheme} from "next-themes";
import {Icon} from "@iconify/react";
import * as React from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({...props}: ToasterProps) {
    const {theme} = useTheme();

    return (<Sonner
            theme={theme as "light" | "dark" | "system"}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast: "group toast group-[.toaster]:bg-content1 group-[.toaster]:text-foreground group-[.toaster]:border-default-200 group-[.toaster]:shadow-lg font-sans",
                    description: "group-[.toast]:text-default-500",
                    actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground font-medium",
                    cancelButton: "group-[.toast]:bg-default-100 group-[.toast]:text-default-500",
                },
            }}
            icons={{
                success: <Icon icon="gravity-ui:circle-check-fill" className="text-success text-xl"/>,
                info: <Icon icon="gravity-ui:circle-info-fill" className="text-primary text-xl"/>,
                warning: <Icon icon="gravity-ui:circle-exclamation-fill" className="text-warning text-xl"/>,
                error: <Icon icon="gravity-ui:circle-xmark-fill" className="text-danger text-xl"/>,
                loading: <Icon icon="gravity-ui:arrows-rotate-right"
                               className="animate-spin text-default-500 text-xl"/>,
            }}
            {...props}
        />);
}