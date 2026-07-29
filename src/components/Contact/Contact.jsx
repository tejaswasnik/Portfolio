import { Icon } from "@iconify/react";
import "./Contact.scss";

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic goes here
  };

  return (
    <section className="contact">
      <div className="contact__heading">
        <Icon icon="ic:round-message" width={29} height={29} color="white" />
        <h2 className="contact__title">Contact Me</h2>
      </div>
      <p className="contact__subtitle">Looking forward to hearing from you.</p>

      <div className="contact__card">
        <h3 className="contact__card-title">Get In Touch.</h3>
        <p className="contact__card-subtitle">
          Fill out the form below and I&apos;ll get back to you as soon as possible
        </p>

        <form className="contact__form" onSubmit={handleSubmit} noValidate>
          <div className="contact__field">
            <label htmlFor="contact-name" className="contact__label">
              Name :
            </label>
            <input
              id="contact-name"
              type="text"
              className="contact__input"
              placeholder="Your name"
              autoComplete="name"
            />
          </div>

          <div className="contact__field">
            <label htmlFor="contact-email" className="contact__label">
              Email :
            </label>
            <input
              id="contact-email"
              type="email"
              className="contact__input"
              placeholder="your@email.com"
              autoComplete="email"
            />
          </div>

          <div className="contact__field">
            <label htmlFor="contact-message" className="contact__label">
              Message :
            </label>
            <textarea
              id="contact-message"
              className="contact__textarea"
              placeholder="Your message..."
              rows={8}
            />
          </div>

          <div className="contact__submit-row">
            <button type="submit" className="contact__submit">
              <Icon icon="line-md:telegram" width={24} height={24} />
              <span>SEND MESSAGE</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
