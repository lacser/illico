"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Styles from "./register.module.css";
import IconsProvider from "../components/iconsProvider";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let profilePictureUrl = "";

      if (profilePicture) {
        // Convert the file to base64 string
        const reader = new FileReader();
        profilePictureUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(profilePicture);
        });
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          invitationCode,
          profilePicture: profilePictureUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Registration successful
      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
    }
  };

  return (
    <div className={Styles.registerContainer}>
      <div className={Styles.registerFormContainer}>
        <div className={Styles.leftColumn}>
          <div className={Styles.registerHeader}>
            <h1 className={Styles.registerTitle}>illico</h1>
            <h2 className={Styles.registerSubtitle}>
              Get your question answered instantaneously. Create your account to
              get started.
            </h2>
          </div>
        </div>

        <div className={Styles.divider} />

        <div className={Styles.rightColumn}>
          {error && <div className={Styles.errorMessage}>{error}</div>}
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
              <label htmlFor="invitationCode" className={Styles.formLabel}>
                Invitation Code
              </label>
              <input
                id="invitationCode"
                name="invitationCode"
                type="text"
                required
                className={Styles.formInput}
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
              />
            </div>
            <div className={Styles.formGroup}>
              <label
                htmlFor="profilePicture"
                className={Styles.inlineFormLabel}
              >
                Profile Picture (optional)
              </label>

              <label
                htmlFor="profilePicture"
                className={Styles.profileImageUploadButton}
              >
                Upload Image
                <IconsProvider iconSize="24px" fill={0} grade={0} weight={400} color="#5f6368">
                  upload
                </IconsProvider>
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
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
