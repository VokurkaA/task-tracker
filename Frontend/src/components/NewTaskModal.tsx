"use client";

import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContainer,
    AlertDialogDialog,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogHeading,
    AlertDialogIcon,
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
    TextField
} from "@heroui/react";
import {Icon} from "@iconify/react";
import {Priority} from "../types.ts";

export default function NewTaskModal() {
    return (<Modal>
        <Button variant="secondary">
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
                    <ModalBody className='min-w-lg'>
                        <Form className='space-y-6'>
                            <TextField isRequired>
                                <Label>Title</Label>
                                <Input placeholder="eg. Homework - biology"/>
                                <FieldError/>
                            </TextField>
                            <TextField>
                                <Label>Description</Label>
                                <Input placeholder=""/>
                                <FieldError/>
                            </TextField>
                            <Select placeholder="Select priority">
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
                        </Form>
                    </ModalBody>
                    <ModalFooter>
                        <AlertDialog>
                            <Button variant="danger">Discard</Button>
                            <AlertDialogContainer>
                                <AlertDialogDialog>
                                    {({close}) => (<>
                                        <AlertDialogHeader>
                                            <AlertDialogIcon status="danger"/>
                                            <AlertDialogHeading>Discard this task?</AlertDialogHeading>
                                        </AlertDialogHeader>
                                        <AlertDialogBody>
                                            <p>Are you sure you want to discard this task?</p>
                                            <p>This action cannot be undone.</p>
                                        </AlertDialogBody>
                                        <AlertDialogFooter>
                                            <Button variant="tertiary" onPress={close}>
                                                Cancel
                                            </Button>
                                            <Button variant="danger" onPress={close}>
                                                Discard task
                                            </Button>
                                        </AlertDialogFooter>
                                    </>)}
                                </AlertDialogDialog>
                            </AlertDialogContainer>
                        </AlertDialog>
                        <Button variant="primary" onPress={close}>Create</Button>
                    </ModalFooter>
                </>)}
            </ModalDialog>
        </ModalContainer>
    </Modal>);
}
