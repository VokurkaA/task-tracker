"use client";

import * as React from "react";
import {useState} from "react";
import {
    Button,
    CloseButton,
    Description,
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
    TextField,
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Priority} from "../types";
import {useCreateTask} from "../hooks/useTasks";

export default function NewTaskModal() {
    const {mutate, isPending, error} = useCreateTask();
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");

    const addSubtask = () => {
        if (!subtaskInput.trim()) return;
        setSubtasks([...subtasks, subtaskInput.trim()]);
        setSubtaskInput("");
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.currentTarget)) as {
            title: string; description?: string; category?: string; priority?: Priority;
        };

        mutate({
            title: data.title,
            description: data.description || "",
            category: data.category || "General",
            priority: data.priority,
            subtasks: subtasks
        }, {
            onSuccess: () => {
                setSubtasks([]);
                close();
            },
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
                        <ModalBody className="w-lg space-y-6">
                            <TextField isRequired>
                                <Label>Title</Label>
                                <Input name="title" placeholder="eg. Homework - biology"/>
                                <FieldError/>
                            </TextField>

                            <TextField>
                                <Label>Category</Label>
                                <Input name="category" placeholder="eg. Personal, Work"/>
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

                            <div className="space-y-2">
                                <Label>Subtasks</Label>
                                <div className="flex gap-2">
                                    <Input
                                        className="flex-1"
                                        value={subtaskInput}
                                        onChange={(e) => setSubtaskInput(e.target.value)}
                                        placeholder="Add a step..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addSubtask();
                                            }
                                        }}
                                    />
                                    <Button type="button" onPress={addSubtask} variant="secondary">Add</Button>
                                </div>
                                <ListBox
                                    aria-label="Subtasks"
                                    className="space-y-1 max-h-40 overflow-y-auto"
                                    selectionMode="none"
                                >
                                    {subtasks.map((st, i) => (<ListBox.Item key={i} id={String(i)} textValue={st}>
                                        <div className="flex justify-between items-center w-full">
                                            <div className="wrap-break-word max-w-11/12 space-x-2">
                                                <Description>{i + 1}.</Description>
                                                <Label className="">{st}</Label>
                                            </div>
                                            <CloseButton aria-label="remove" onClick={() => removeSubtask(i)}/>
                                        </div>
                                    </ListBox.Item>))}
                                </ListBox>
                            </div>

                            {error && <p className="text-danger text-sm">Failed to create task</p>}
                        </ModalBody>

                        <ModalFooter>
                            <Button type="submit" variant="primary" isPending={isPending} isDisabled={isPending}>
                                {isPending ? "Creating..." : "Create"}
                            </Button>
                        </ModalFooter>
                    </Form>
                </>)}
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}