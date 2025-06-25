import { FormEvent } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" placeholder="username" required />

      <input type="email" name="email" placeholder="Email" required />

      <input type="text" name="phone_no" placeholder="phonr_no" required />

      <input type="password" name="password" placeholder="Password" required />
      <input type="password" name="confirmpassword" placeholder="confirm password" required />

      <button type="submit">Login</button>
    </form>
  );
}
