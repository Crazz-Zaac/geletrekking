import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';

export default function SuperadminContactUs() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="contactus">
        <h1>Contact Us</h1>
        <p>Thank you for contacting us!</p>

        <form style={{ display: "flex", flexDirection: "column" }}>
          <label>Name:</label>
          <input type="text" name="name" required />

          <label>Email:</label>
          <input type="email" name="email" required />

          <label>Message:</label>
          <textarea name="message" required />

          <button
            type="submit"

          >
            Submit
          </button>
        </form>

        <style jsx>{`
          .contactus {
            text-align: center;
            padding: 2rem;
          }

          input[type="email"],
          input[type="text"],
          textarea {
            border: 1px solid black;
            margin-left: 500px;
            margin-bottom: 10px;
            width: 300px;
            height:40px;
          }

          button[type="submit"] {
            border: 1px solid black;
            margin-left: 500px;
            width: 300px;
            background-color:red;
            height:40px;
          }
        `}</style>
      </div>
    </>
  );
}
