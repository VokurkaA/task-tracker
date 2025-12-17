import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import {ThemeProvider} from 'next-themes'
import {AuthProvider} from "./context/AuthProvider.tsx";
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {Toaster} from "sonner";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(<StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Toaster position="top-center"/>
                <App/>
            </AuthProvider>
        </QueryClientProvider>
    </ThemeProvider>
</StrictMode>)
