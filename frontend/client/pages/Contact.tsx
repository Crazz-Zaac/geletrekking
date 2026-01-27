import { Layout } from "@/components/Layout";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <Layout>
      <section className="bg-gradient-to-r from-brand-dark to-brand-navy text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-gray-200">
            Have questions? We'd love to hear from you. Get in touch with our team.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info */}
          {[
            {
              icon: <Phone className="w-8 h-8" />,
              title: "Phone",
              content: "+1 (555) 123-4567",
            },
            {
              icon: <Mail className="w-8 h-8" />,
              title: "Email",
              content: "info@trekways.com",
            },
            {
              icon: <MapPin className="w-8 h-8" />,
              title: "Address",
              content: "123 Adventure Street, Mountain City, CO 80000",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg p-8 shadow-lg text-center border-t-4 border-brand-accent"
            >
              <div className="flex justify-center text-brand-accent mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">
                {item.title}
              </h3>
              <p className="text-gray-700">{item.content}</p>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-6">
              Get in Touch
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-accent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-accent transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-dark mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your inquiry..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand-accent transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-brand-accent hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* FAQ or Additional Info */}
          <div>
            <h2 className="text-3xl font-bold text-brand-dark mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: "How do I book a trek?",
                  a: "Simply explore our destinations, choose your preferred trek, and contact us. We'll guide you through the booking process.",
                },
                {
                  q: "What is the cancellation policy?",
                  a: "We offer flexible cancellation options up to 30 days before your trek departure.",
                },
                {
                  q: "Do you provide travel insurance?",
                  a: "We recommend travel insurance. Check our contact page for recommended providers.",
                },
                {
                  q: "What is included in the trek price?",
                  a: "Each trek includes accommodation, meals, guides, and porter support. Flights are not included.",
                },
              ].map((faq, idx) => (
                <div key={idx} className="border-l-4 border-brand-accent pl-4">
                  <h3 className="font-bold text-brand-dark mb-2">{faq.q}</h3>
                  <p className="text-gray-700">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
