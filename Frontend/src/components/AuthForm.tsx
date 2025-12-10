import { useState } from 'react';
import { Card, CardBody, Input, Button, Tab, Tabs } from "@heroui/react";
import { api } from '../api/client';

interface AuthFormProps {
  onLoginSuccess: (token: string, userId: string) => void;
}

export const AuthForm = ({ onLoginSuccess }: AuthFormProps) => {
  const [selected, setSelected] = useState<string | number>("login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (selected === 'signup') {
        await api.post('/auth/signup', { email, password, username });
        setSelected('login'); // Switch to login after signup
        alert("Account created! Please log in.");
      } else {
        const { data } = await api.post('/auth/login', { email, password });
        onLoginSuccess(data.token, data.user.id);
      }
    } catch {
      alert("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full h-screen items-center justify-center bg-gray-50">
      <Card className="max-w-full w-[340px] h-[400px]">
        <CardBody className="overflow-hidden">
          <Tabs
            fullWidth
            size="md"
            aria-label="Tabs form"
            selectedKey={selected}
            onSelectionChange={setSelected}
          >
            <Tab key="login" title="Login">
              <form className="flex flex-col gap-4 h-[300px]">
                <Input label="Email" placeholder="Enter your email" type="email" value={email} onValueChange={setEmail} />
                <Input label="Password" placeholder="Enter your password" type="password" value={password} onValueChange={setPassword} />
                <div className="flex gap-2 justify-end">
                  <Button fullWidth color="primary" isLoading={loading} onPress={handleAuth}>
                    Login
                  </Button>
                </div>
              </form>
            </Tab>
            <Tab key="signup" title="Sign up">
              <form className="flex flex-col gap-4 h-[300px]">
                <Input label="Username" placeholder="Choose a username" value={username} onValueChange={setUsername} />
                <Input label="Email" placeholder="Enter your email" type="email" value={email} onValueChange={setEmail} />
                <Input label="Password" placeholder="Create a password" type="password" value={password} onValueChange={setPassword} />
                <div className="flex gap-2 justify-end">
                  <Button fullWidth color="primary" isLoading={loading} onPress={handleAuth}>
                    Sign up
                  </Button>
                </div>
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};