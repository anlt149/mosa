import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Container, Card, CardTitle, Input, Label, Button } from '../components/common';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const ErrorText = styled.p`
  color: #ff4444;
  font-size: 0.875rem;
  margin: 0;
  margin-top: -0.5rem;
`;

const HelperText = styled.p`
  color: #aaa;
  font-size: 0.875rem;
  margin: 0;
  text-align: center;
`;

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card as="form" onSubmit={handleAuth}>
        <CardTitle>{isSignUp ? 'Create Account' : 'Login'}</CardTitle>
        
        {error && <ErrorText>{error}</ErrorText>}

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
          />
        </FormGroup>

        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>

        <HelperText>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span 
            style={{ color: '#fff', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </HelperText>
      </Card>
    </Container>
  );
}
