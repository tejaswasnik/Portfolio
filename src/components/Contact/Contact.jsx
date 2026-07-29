import { useState } from "react";
import { Icon } from "@iconify/react";
import "./Contact.scss";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.message) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/.netlify/functions/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        alert("Message sent successfully!");

        setForm({
          name: "",
          email: "",
          message: "",
        });
      } else {
        alert(data.message || "Failed to send message.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact">
      <div className="contact__heading">
        <Icon
          icon="ic:round-message"
          width={29}
          height={29}
          color="white"
        />
        <h2 className="contact__title">Contact Me</h2>
      </div>

      <p className="contact__subtitle">
        Looking forward to hearing from you.
      </p>

      <div className="contact__card">
        <h3 className="contact__card-title">Get In Touch.</h3>

        <p className="contact__card-subtitle">
          Fill out the form below and I'll get back to you as soon as possible.
        </p>

        <form
          className="contact__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="contact__field">
            <label htmlFor="contact-name" className="contact__label">
              Name :
            </label>

            <input
              id="contact-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="contact__input"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="contact-email" className="contact__label">
              Email :
            </label>

            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="contact__input"
              placeholder="your@email.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="contact__field">
            <label htmlFor="contact-message" className="contact__label">
              Message :
            </label>

            <textarea
              id="contact-message"
              name="message"
              value={form.message}
              onChange={handleChange}
              className="contact__textarea"
              placeholder="Your message..."
              rows={8}
              required
            />
          </div>

          <div className="contact__submit-row">
            <button
              type="submit"
              className="contact__submit"
              disabled={loading}
            >
              <Icon icon="line-md:telegram" width={24} height={24} />

              <span>
                {loading ? "SENDING..." : "SEND MESSAGE"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;