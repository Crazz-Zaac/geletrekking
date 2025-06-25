import { FormEvent } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}
