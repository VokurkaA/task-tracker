import {Skeleton} from "@heroui/react";

export default function Loading() {
    return (<div className="relative flex justify-center w-svw h-svh bg-default-50 overflow-hidden">
        <div
            className="fixed top-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-md border-b border-default-100 px-8 flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-lg"/>
                <Skeleton className="w-32 h-6 rounded-lg"/>
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-7 rounded-full"/>
                <Skeleton className="w-10 h-10 rounded-full"/>
            </div>
        </div>

        <div className="pt-24 pb-10 px-4 w-full max-w-4xl h-full">
            <div className="min-w-full p-6 md:p-8 rounded-2xl border border-default-100 bg-background space-y-8">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-2">
                        <Skeleton className="w-40 h-8 rounded-lg"/>
                        <Skeleton className="w-32 h-4 rounded-lg"/>
                    </div>
                    <Skeleton className="w-32 h-10 rounded-lg"/>
                </div>

                <Skeleton className="w-64 h-9 rounded-lg"/>

                <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (<Skeleton key={i} className="w-full h-16 rounded-xl"/>))}
                </div>
            </div>
        </div>
    </div>)
}