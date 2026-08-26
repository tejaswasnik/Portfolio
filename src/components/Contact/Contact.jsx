import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";
import "./Contact.scss";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardRef = useRef(null);
  const submitBtnRef = useRef(null);

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
        // Success animation — button pulse
        if (submitBtnRef.current) {
          gsap.fromTo(
            submitBtnRef.current,
            { scale: 1 },
            {
              scale: 1.1,
              duration: 0.2,
              yoyo: true,
              repeat: 3,
              ease: "power2.inOut",
              onComplete: () => {
                gsap.to(submitBtnRef.current, {
                  scale: 1,
                  duration: 0.3,
                });
              },
            }
          );
        }

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

  // Scroll-triggered entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading slide in
      if (headingRef.current) {
        gsap.from(headingRef.current, {
          x: -60,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Subtitle
      if (subtitleRef.current) {
        gsap.from(subtitleRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.5,
          delay: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      }

      // Card slide up
      if (cardRef.current) {
        gsap.from(cardRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        });
      }

      // Form fields cascade
      const fields = sectionRef.current?.querySelectorAll(".contact__field");
      if (fields && fields.length) {
        gsap.from(fields, {
          x: -30,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        });
      }

      // Submit button entrance
      if (submitBtnRef.current) {
        gsap.from(submitBtnRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: submitBtnRef.current,
            start: "top 95%",
            toggleActions: "play none none none",
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Magnetic button effect
  useEffect(() => {
    const btn = submitBtnRef.current;
    if (!btn) return;

    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const onMove = (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.25,
        y: y * 0.25,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section className="contact" ref={sectionRef}>
      <div className="contact__heading" ref={headingRef}>
        <Icon
          icon="ic:round-message"
          width={29}
          height={29}
          color="white"
        />
        <h2 className="contact__title">Contact Me</h2>
      </div>

      <p className="contact__subtitle" ref={subtitleRef}>
        Looking forward to hearing from you.
      </p>

      <div className="contact__card" ref={cardRef}>
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
              ref={submitBtnRef}
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