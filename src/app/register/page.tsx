'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Styles from './register.module.css';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let profilePictureUrl = '';

      if (profilePicture) {
        // Convert the file to base64 string
        const reader = new FileReader();
        profilePictureUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(profilePicture);
        });
      }

      console.log('Submitting registration with:', {
        email,
        username,
        hasPassword: !!password,
        hasProfilePicture: !!profilePictureUrl
      });

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          username,
          password,
          profilePicture: profilePictureUrl
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      router.push('/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  return (
    <div className={Styles.registerContainer}>
      <div className={Styles.registerFormContainer}>
        <div className={Styles.leftColumn}>
          <div className={Styles.registerHeader}>
            <h1 className={Styles.registerTitle}>illico</h1>
            <h2 className={Styles.registerSubtitle}>
              Get your question answered instantaneously. Create your account to get started.
            </h2>
          </div>
        </div>

        <div className={Styles.divider} />

        <div className={Styles.rightColumn}>
          {error && (
            <div className={Styles.errorMessage}>
              {error}
            </div>
          )}
          <form className={Styles.registerForm} onSubmit={handleSubmit}>
            <div className={Styles.formGroup}>
              <label htmlFor="email" className={Styles.formLabel}>
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
            <div className={Styles.formGroup}>
              <label htmlFor="username" className={Styles.formLabel}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className={Styles.formInput}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className={Styles.formGroup}>
              <label htmlFor="password" className={Styles.formLabel}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className={Styles.formInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className={Styles.formGroup}>
              <label htmlFor="profilePicture" className={Styles.inlineFormLabel}>
                Profile Picture (optional)
              </label>

              <label htmlFor="profilePicture" className={Styles.profileImageUploadButton}>
                Upload Image
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                  <path d="M440-320v-326L336-542l-56-58 200-200 200 200-56 58-104-104v326h-80ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                </svg>
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
              />
            </div>

            <button type="submit" className={Styles.submitButton}>
              Register
            </button>

            <Link href="/login" className={Styles.loginLink}>
              Already have an account? Sign in
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
