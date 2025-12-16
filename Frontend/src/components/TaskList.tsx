import {Alert, Checkbox, CheckboxContent, CheckboxControl, CheckboxIndicator, Label, Surface,} from "@heroui/react";
import {useTasks} from "../hooks/useTasks.ts";
import NewTaskModal from "./NewTaskModal.tsx";

export default function TaskList() {
    const {data, isError} = useTasks();

    return (<Surface className="mt-24 min-w-lg p-8 rounded-t-lg">
        <NewTaskModal/>
        {isError && (<Alert status="danger">
            <Alert.Indicator/>
            <Alert.Content>
                <Alert.Title>Error</Alert.Title>
                <Alert.Description>
                    Failed to load tasks.
                </Alert.Description>
            </Alert.Content>
        </Alert>)}

        {data && data.length === 0 && (<Alert status="accent">
            <Alert.Indicator/>
            <Alert.Content>
                <Alert.Title>No tasks</Alert.Title>
                <Alert.Description>
                    No tasks available. Create new, or share with others.
                </Alert.Description>
            </Alert.Content>
        </Alert>)}

        {data && data.length > 0 && (<div className="space-y-2 mt-6">
            {data.map((t) => (<Checkbox key={t.id}>
                <CheckboxControl>
                    <CheckboxIndicator/>
                </CheckboxControl>
                <CheckboxContent>
                    <Label>{t.title}</Label>
                </CheckboxContent>
            </Checkbox>))}
        </div>)}
    </Surface>);
}
