import React from 'react';
import { Profile as ProfileJsx } from './Profile.jsx';
import { User } from '../types';

export interface ProfilePageProps {
  onNavigate?: (path: string) => void;
  user?: User | { name: string; email: string; phone?: string; address?: string; role?: string } | null;
  onLogout?: () => void;
  onOpenAuth?: () => void;
}

export const Profile: React.FC<ProfilePageProps> = (props) => {
  return <ProfileJsx {...props} />;
};

export default Profile;
