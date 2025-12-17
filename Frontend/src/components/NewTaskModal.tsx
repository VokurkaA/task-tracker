import {
    Button,
    CloseButton,
    FieldError,
    Form,
    Input,
    InputGroup,
    Label,
    ListBox,
    ListBoxItem,
    Modal,
    Select,
    TextArea,
    TextField
} from "@heroui/react";
import React, {useState} from "react";
import {Icon} from "@iconify/react";
import {Priority} from "../types";
import {useCreateTask} from "../hooks/useTasks";
import {toast} from "sonner";

export default function NewTaskModal() {
    const {mutate, isPending} = useCreateTask();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);

    // Subtask State
    const [subtasks, setSubtasks] = useState<string[]>([]);
    const [subtaskInput, setSubtaskInput] = useState("");

    // Validation
    const getTitleError = (value: string) => {
        if (!value.trim()) return "Title is required";
        return null;
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("");
        setPriority(Priority.MEDIUM);
        setSubtasks([]);
        setSubtaskInput("");
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) resetForm();
    };

    const addSubtask = () => {
        if (!subtaskInput.trim()) return;
        setSubtasks([...subtasks, subtaskInput.trim()]);
        setSubtaskInput("");
    };

    const removeSubtask = (index: number) => {
        setSubtasks(subtasks.filter((_, i) => i !== index));
    };

    // Make event optional so it can be called by Button onPress
    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }

        const titleError = getTitleError(title);
        if (titleError) {
            toast.error(titleError);
            return;
        }

        mutate({
            title, description, category: category || "General", priority, subtasks
        }, {
            onSuccess: () => {
                toast.success("Task created successfully");
                setIsOpen(false);
            }, onError: () => {
                toast.error("Failed to create task");
            }
        });
    };

    return (<Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Button variant="secondary" onPress={() => setIsOpen(true)}>
                <Icon icon="gravity-ui:plus"/>
                New task
            </Button>

            <Modal.Container>
                <Modal.Dialog>
                    <Modal.CloseTrigger/>
                    <Modal.Header>
                        <Modal.Heading>Create a new task</Modal.Heading>
                        <p className="text-sm text-default-500">Fill in the details to organize your work.</p>
                    </Modal.Header>

                    <Modal.Body>
                        <Form className="space-y-4" onSubmit={handleSubmit} validationBehavior="aria">
                            {/* Title Field */}
                            <TextField
                                isRequired
                                name="title"
                                value={title}
                                onChange={setTitle}
                                validate={(val) => val ? getTitleError(val) : null}
                            >
                                <Label>Title</Label>
                                <Input placeholder="e.g. Update Documentation"/>
                                <FieldError/>
                            </TextField>

                            <div className="grid grid-cols-2 gap-4">
                                <TextField
                                    name="category"
                                    value={category}
                                    onChange={setCategory}
                                >
                                    <Label>Category</Label>
                                    <Input placeholder="e.g. Work"/>
                                </TextField>

                                {/* Priority Select */}
                                <Select
                                    name="priority"
                                    selectedKey={priority}
                                    onSelectionChange={(key) => setPriority(key as Priority)}
                                >
                                    <Label>Priority</Label>
                                    <Select.Trigger>
                                        <Select.Value/>
                                        <Select.Indicator/>
                                    </Select.Trigger>
                                    <Select.Popover>
                                        <ListBox>
                                            {Object.values(Priority).map((p) => (
                                                <ListBoxItem key={p} id={p} textValue={p}>
                                                    <div className="flex items-center gap-2">
                                                        <Icon
                                                            icon="gravity-ui:circle-fill"
                                                            className={p === Priority.CRITICAL ? "text-danger" : p === Priority.HIGH ? "text-warning" : p === Priority.MEDIUM ? "text-primary" : "text-success"}
                                                        />
                                                        <span className="capitalize">{p}</span>
                                                    </div>
                                                </ListBoxItem>))}
                                        </ListBox>
                                    </Select.Popover>
                                </Select>
                            </div>

                            {/* Description Field */}
                            <TextField
                                name="description"
                                value={description}
                                onChange={setDescription}
                            >
                                <Label>Description</Label>
                                <TextArea placeholder="Add extra details..."/>
                            </TextField>

                            {/* Subtasks Section */}
                            <div className="space-y-2">
                                <TextField name="subtasks-input">
                                    <Label>Subtasks</Label>
                                    <InputGroup>
                                        <InputGroup.Input
                                            placeholder="Add a step..."
                                            value={subtaskInput}
                                            onChange={(e) => setSubtaskInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                        />
                                        <InputGroup.Suffix>
                                            <Button variant="secondary" onPress={addSubtask} isIconOnly size="sm">
                                                <Icon icon="gravity-ui:plus"/>
                                            </Button>
                                        </InputGroup.Suffix>
                                    </InputGroup>
                                </TextField>

                                {subtasks.length > 0 && (<div className="flex flex-col gap-1 mt-2">
                                        {subtasks.map((st, i) => (<div key={i}
                                                                       className="flex items-center justify-between p-2 text-sm border rounded-md bg-default-50 border-default-200">
                                                <span>{i + 1}. {st}</span>
                                                <CloseButton onPress={() => removeSubtask(i)}/>
                                            </div>))}
                                    </div>)}
                            </div>
                        </Form>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="ghost" onPress={() => handleOpenChange(false)}>Cancel</Button>
                        <Button
                            onPress={() => handleSubmit()}
                            variant="primary"
                            isPending={isPending}
                            isDisabled={isPending}
                        >
                            Create Task
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal>);
}