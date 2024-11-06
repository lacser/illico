'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Styles from './LoginStatus.module.css';

interface User {
  email: string;
  username: string;
  profilePicture: string;
}

export default function LoginStatus() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.status === 401) {
          setUser(null);
          router.push('/login');
        } else if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, [router]);

  return (
    <div className={Styles.loginStatus}>
      <div className={Styles.loginStatusContainer}>
        <div className={Styles.userInfo}>
          {user ? (
            <>
              <div className={Styles.avatarContainer}>
                {user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username}
                    fill
                    className={Styles.avatarImage}
                  />
                ) : (
                  <div className={Styles.avatarFallback}>
                    <span className={Styles.avatarFallbackText}>
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className={Styles.userDetails}>
                <span className={Styles.username}>{user.username}</span>
                <span className={Styles.email}>{user.email}</span>
              </div>
            </>
          ) : (
            <div className={Styles.notLoggedIn}>
              <span className={Styles.notLoggedText}>Not logged in</span>
            </div>
          )}
        </div>
        {user ? (
          <div className={`${Styles.statusIndicator} ${Styles.statusOnline}`}></div>
        ) : (
          <div className={`${Styles.statusIndicator} ${Styles.statusOffline}`}></div>
        )}
      </div>
    </div>
  );
}
