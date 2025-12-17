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
    InputGroup,
    Label,
    ListBox,
    ListBoxItem,
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
    TextArea,
    TextField
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Priority} from "../types";
import {useCreateTask} from "../hooks/useTasks";

export default function NewTaskModal() {
    const {mutate, isPending, error} = useCreateTask();
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const addSubtask = () => {
        if (!subtaskInput.trim()) return;
        setSubtasks([...subtasks, subtaskInput.trim()]);
        setSubtaskInput("");
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
                setIsOpen(false);
            },
        });
    };

    return (<Modal isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button variant="secondary" onPress={() => setIsOpen(true)}>
            <Icon icon="gravity-ui:plus"/>
            New task
        </Button>

        <ModalContainer>
            <ModalDialog>
                <ModalCloseTrigger/>
                <ModalHeader>
                    <ModalHeading>Create a new task</ModalHeading>
                    <Description>Fill in the details to organize your work.</Description>
                </ModalHeader>

                <Form onSubmit={onSubmit}>
                    <ModalBody className="space-y-4">
                        <TextField isRequired>
                            <Label>Title</Label>
                            <Input name="title" placeholder="e.g. Update Documentation"/>
                            <FieldError/>
                        </TextField>

                        <div className="grid grid-cols-2 gap-4">
                            <TextField>
                                <Label>Category</Label>
                                <Input name="category" placeholder="e.g. Work"/>
                            </TextField>

                            <Select name="priority" defaultSelectedKey={Priority.MEDIUM}>
                                <Label>Priority</Label>
                                <SelectTrigger>
                                    <SelectValue/>
                                    <SelectIndicator/>
                                </SelectTrigger>
                                <SelectPopover>
                                    <ListBox>
                                        {Object.values(Priority).map((p) => (<ListBoxItem key={p} id={p} textValue={p}>
                                            <div className="flex items-center gap-2">
                                                <Icon icon="gravity-ui:circle-fill"
                                                      className={p === Priority.CRITICAL ? "text-danger" : p === Priority.HIGH ? "text-warning" : p === Priority.MEDIUM ? "text-primary" : "text-success"}/>
                                                <span className="capitalize">{p}</span>
                                            </div>
                                        </ListBoxItem>))}
                                    </ListBox>
                                </SelectPopover>
                            </Select>
                        </div>

                        <TextField>
                            <Label>Description</Label>
                            <TextArea name="description" placeholder="Add extra details..."/>
                        </TextField>

                        <div className="space-y-2">
                            <div className="flex flex-row items-center gap-2">
                                <Label>Subtasks</Label>
                                <InputGroup className="flex flex-1 justify-between">
                                    <Input
                                        className="flex-1"
                                        value={subtaskInput}
                                        onChange={(e) => setSubtaskInput(e.target.value)}
                                        placeholder="Add a step..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                    />
                                    <Button variant="secondary" onPress={addSubtask}>
                                        <Icon icon="gravity-ui:plus"/>
                                    </Button>
                                </InputGroup>
                            </div>
                            {subtasks.length > 0 && (<ListBox aria-label="Subtasks"
                                                              className="border rounded-md p-2 max-h-40 overflow-y-auto bg-default-50">
                                {subtasks.map((st, i) => (<ListBoxItem key={i} textValue={st}>
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-sm">{i + 1}. {st}</span>
                                        <CloseButton onPress={() => removeSubtask(i)}/>
                                    </div>
                                </ListBoxItem>))}
                            </ListBox>)}
                        </div>

                        {error && <Description className="text-danger">Failed to create task. Please try
                            again.</Description>}
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="ghost" onPress={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="primary" isPending={isPending} isDisabled={isPending}>
                            Create Task
                        </Button>
                    </ModalFooter>
                </Form>
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}