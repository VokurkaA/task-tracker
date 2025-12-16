"use client";

import * as React from "react";
import {
    Button,
    FieldError,
    Form,
    Input,
    Label,
    ListBox,
    ListBoxItem,
    ListBoxItemIndicator,
    Modal,
    ModalBody,
    ModalCloseTrigger,
    ModalContainer,
    ModalDialog,
    ModalFooter,
    ModalHeader,
    ModalHeading,
    Select,
    SelectIndicator,
    SelectPopover,
    SelectTrigger,
    SelectValue,
    Spinner,
    TextField,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Priority} from "../types";
import {useCreateTask} from "../hooks/useTasks";

export default function NewTaskModal() {
    const {mutate, isPending, error} = useCreateTask();

    const onSubmit = (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget)) as {
            title: string; description?: string; priority?: Priority;
        };

        mutate({
            title: data.title, priority: data.priority,
        }, {
            onSuccess: () => close(),
        });
    };

    return (<Modal>
        <Button className="" variant="secondary">
            <Icon icon="gravity-ui:plus"/>
            New task
        </Button>

        <ModalContainer>
            <ModalDialog>
                {({close}) => (<>
                    <ModalCloseTrigger/>

                    <ModalHeader>
                        <ModalHeading>Create a new task</ModalHeading>
                    </ModalHeader>

                    <Form onSubmit={(e) => onSubmit(e, close)}>
                        <ModalBody className="min-w-lg space-y-6">
                            <TextField isRequired>
                                <Label>Title</Label>
                                <Input
                                    name="title"
                                    placeholder="eg. Homework - biology"
                                />
                                <FieldError/>
                            </TextField>

                            <TextField>
                                <Label>Description</Label>
                                <Input name="description"/>
                                <FieldError/>
                            </TextField>

                            <Select name="priority" placeholder="Select priority">
                                <Label>Priority</Label>
                                <SelectTrigger>
                                    <SelectValue/>
                                    <SelectIndicator/>
                                </SelectTrigger>

                                <SelectPopover>
                                    <ListBox>
                                        {Object.values(Priority).map((p) => (<ListBoxItem key={p} id={p} textValue={p}>
                                            {p}
                                            <ListBoxItemIndicator/>
                                        </ListBoxItem>))}
                                    </ListBox>
                                </SelectPopover>
                            </Select>

                            {error && (<p className="text-danger text-sm">
                                Failed to create task
                            </p>)}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                type="submit"
                                variant="primary"
                                isPending={isPending}
                                isDisabled={isPending}
                            >
                                {({isPending}) => (<>
                                    {isPending && (<Spinner
                                        color="current"
                                        size="sm"
                                        className="mr-2"
                                    />)}
                                    Create
                                </>)}
                            </Button>
                        </ModalFooter>
                    </Form>
                </>)}
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}
