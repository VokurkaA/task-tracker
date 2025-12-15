import {useTasks} from "../hooks/useTasks.ts";
import {
    Alert,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Checkbox,
    CheckboxContent,
    CheckboxControl,
    CheckboxGroup,
    CheckboxIndicator,
    Label
} from "@heroui/react";
import NewTaskModal from "./NewTaskModal.tsx";

export default function Dashboard() {
    // const {user} = useAuth();
    const tasks = useTasks()
    console.log(tasks.data)
    return (<div className="relative flex items-center justify-center w-svw h-svh select-none">
        <Card className="min-w-lg">
            <CardHeader className='flex flex-row justify-between'>
                <CardTitle>Tasks</CardTitle>
                <NewTaskModal/>
            </CardHeader>
            <CardContent>
                <CheckboxGroup name="takss">
                    {/*<Label>Tasks</Label>*/}
                    {(tasks.data && tasks.data.length > 0) ? tasks.data.map((t) => (<Checkbox>
                        <CheckboxControl>
                            <CheckboxIndicator/>
                        </CheckboxControl>
                        <CheckboxContent>
                            <Label>{t.title}</Label>
                        </CheckboxContent>
                    </Checkbox>)) : (<Alert status="accent">
                        <Alert.Indicator/>
                        <Alert.Content>
                            <Alert.Title>No tasks</Alert.Title>
                            <Alert.Description>
                                No tasks available. Create new, or share with others.
                            </Alert.Description>
                        </Alert.Content>
                    </Alert>)}
                </CheckboxGroup>
            </CardContent>
        </Card>
    </div>)
}