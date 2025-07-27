import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { name, email, message } = form;

    if (!name || !email || !message) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // Here you can call your backend API
      console.log('Form Submitted:', form);
      setSuccess('Message sent successfully!');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <>
     <Navbar />
    <div className="contact-container">
      <div className="form-box">
        <h1>Contact Us</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={form.name}
            onChange={handleChange}
            className="input"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email *"
            value={form.email}
            onChange={handleChange}
            className="input"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Your Phone (optional)"
            value={form.phone}
            onChange={handleChange}
            className="input"
          />

          <textarea
            name="message"
            placeholder="Your Message *"
            value={form.message}
            onChange={handleChange}
            className="textarea"
          />

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <button type="submit" className="button">
            Send Message
          </button>
        </form>
      </div>

      <style jsx>{`
        .contact-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 3rem 1rem;
          background: linear-gradient(135deg, #f3f4f6, #ffffff);
          min-height: 100vh;
        }

        .form-box {
          background: #fff;
          padding: 2rem;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.05);
        }

        h1 {
          text-align: center;
          margin-bottom: 2rem;
          color: #333;
        }

        .input,
        .textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1rem;
          transition: border 0.2s;
        }

        .input:focus,
        .textarea:focus {
          border-color: #0070f3;
          outline: none;
        }

        .textarea {
          height: 150px;
          resize: vertical;
        }

        .button {
          background-color: #0070f3;
          color: #fff;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
          width: 100%;
        }

        .button:hover {
          background-color: #005ac1;
        }

        .error {
          color: #e00;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .success {
          color: #0070f3;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .form-box {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .form-box {
            padding: 1rem;
          }

          h1 {
            font-size: 1.5rem;
          }

          .input,
          .textarea {
            font-size: 0.95rem;
          }

          .button {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
    </>
  );
}
