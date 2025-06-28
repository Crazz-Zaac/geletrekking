import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';

export default function SuperadminContactUs() {
  const router = useRouter();

  return (
    <>
      <Navbar />
       <div style={{ padding: "2rem" }}>
      <h1>Contact Us</h1>
      
        <p>Thank you for contacting us!</p>
      
        <form style={{ display: "flex", flexDirection: "column", maxWidth: "400px" }}>
          <label>Name:</label>
          <input type="text" name="name" style={{border:" 1px solid black"}}  required />

          <label>Email:</label>
          <input type="email" name="email" style={{border:" 1px solid black"}} required />

          <label>Message:</label>
          <textarea name="message" style={{border:" 1px solid black"}}  required />

          <button type="submit" style={{backgroundColor:"Blue",border:" 1px solid black", marginTop: "1rem" }}>Submit</button>
        </form>
    
    </div>
    </>
  );
}
