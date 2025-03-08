import { useState } from 'react';
import { User } from '../interfaces/user';
import { createUser } from '../api/userApi';

export const UserForm = () => {
  const [formData, setFormData] = useState<Omit<User, 'userId'>>({
    username: '',
    solanaWalletAddress: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    age: 0,
    birthdate: '',
    country: '',
    mobileNumber: '',
    twitterHandle: '',
    discordId: '',
    telegramId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newUser = await createUser(formData);
      console.log('User created:', newUser);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
        placeholder="Username"
      />
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      {/* Add other fields */}
      <button type="submit">Create User</button>
    </form>
  );
};