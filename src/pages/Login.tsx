import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardTitle, Input, Label, Button } from '../components/common';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LoginWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 1.5rem;
  box-sizing: border-box;
`;

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
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });
        if (error) throw error;
        alert('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginWrapper>
      <Card as="form" onSubmit={handleAuth}>
        {/* mosa logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="56" height="56" aria-label="mosa logo">
            <rect width="32" height="32" fill="#000"/>
            {/* Row 1 */}
            <rect x="2"  y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="8"  y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="14" y="2"  width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="20" y="2"  width="5" height="5" rx="1" fill="#39d353"/>
            <rect x="26" y="2"  width="4" height="5" rx="1" fill="#39d353"/>
            {/* Row 2 */}
            <rect x="2"  y="8"  width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="8"  y="8"  width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="14" y="8"  width="5" height="5" rx="1" fill="#26a641"/>
            <rect x="20" y="8"  width="5" height="5" rx="1" fill="#26a641"/>
            <rect x="26" y="8"  width="4" height="5" rx="1" fill="#39d353"/>
            {/* Row 3 */}
            <rect x="2"  y="14" width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="8"  y="14" width="5" height="5" rx="1" fill="#006d32"/>
            <rect x="14" y="14" width="5" height="5" rx="1" fill="#26a641"/>
            <rect x="20" y="14" width="5" height="5" rx="1" fill="#26a641"/>
            <rect x="26" y="14" width="4" height="5" rx="1" fill="#26a641"/>
            {/* Row 4 */}
            <rect x="2"  y="20" width="5" height="5" rx="1" fill="#1a1a1a"/>
            <rect x="8"  y="20" width="5" height="5" rx="1" fill="#006d32"/>
            <rect x="14" y="20" width="5" height="5" rx="1" fill="#006d32"/>
            <rect x="20" y="20" width="5" height="5" rx="1" fill="#006d32"/>
            <rect x="26" y="20" width="4" height="5" rx="1" fill="#1a1a1a"/>
            {/* Row 5 */}
            <rect x="2"  y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="8"  y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="14" y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="20" y="26" width="5" height="4" rx="1" fill="#1a1a1a"/>
            <rect x="26" y="26" width="4" height="4" rx="1" fill="#1a1a1a"/>
          </svg>
          <span style={{ fontSize: '1.5rem', letterSpacing: '0.2em', fontWeight: 700, color: '#fff' }}>mosa</span>
        </div>
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
    </LoginWrapper>
  );
}
