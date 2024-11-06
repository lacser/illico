'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Login successful
      router.push('/chat');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <div className={Styles.loginContainer}>
      <div className={Styles.loginBox}>
        <div>
          <h1 className={Styles.title}>illico</h1>
          <h2 className={Styles.subtitle}>Sign in to your account</h2>
        </div>
        <form className={Styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={Styles.errorMessage}>
              {error}
            </div>
          )}
          <div className={Styles.inputGroup}>
            <div>
              <label htmlFor="email" className={Styles.label}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={Styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className={Styles.inputGroup}>
            <div>
              <label htmlFor="password" className={Styles.label}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={Styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className={Styles.submitButton}
            >
              Sign in
            </button>
          </div>
        </form>
        <div className={Styles.registerLink}>
          <Link href="/register">
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}
