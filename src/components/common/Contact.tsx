import React from 'react';
import AnimatedContactHeading, { CONTACT_EMAIL } from '../ui/AnimatedContactHeading';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import { focusElement, scrollToY } from '../../utils/motion';
// Button.css antes que Contact.css: .footer-btn debe ganar a .button (radio, colores)
import '../../styles/Button.css';
import '../../styles/Contact.css';

const LINKEDIN_URL = 'https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/';
const BEHANCE_URL = 'https://www.behance.net/tjaradesign';

const Contact: React.FC = () => {
  const lenis = useLenisScroll();

  // Scroll al top y devolver el foco al inicio del documento (skip link / primer control)
  const scrollToTop = () => {
    scrollToY(lenis, 0);
    focusElement(document.querySelector<HTMLElement>('main') ?? document.body);
  };

  return (
    // contentinfo landmark: CTA + site footer
    <footer className="contact-section">
      <div className="contact-content">
        <div className="contact-title-wrapper">
          <AnimatedContactHeading className="contact-heading" />
          <div className="contact-subtitle">
            <span className="contact-subtitle-link">let's connect:</span>
            <span className="contact-subtitle-text">Whether you have a question</span>
          </div>
        </div>
        {/* Footer */}
        <div className="footer">
          <div className="footer-left">
            <div className="footer-text-group">
              <span className="footer-design">Design & Developed </span>
              <span className="footer-author">by Patricio Jaramillo Castrillo</span>
            </div>
          </div>
          <div className="footer-links">
            <a
              className="button button--outline button--medium footer-btn"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              LINKEDIN<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              className="button button--outline button--medium footer-btn"
              href={BEHANCE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              BEHANCE<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a
              className="button button--outline button--medium footer-btn"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              EMAIL
            </a>
          </div>
          <div className="footer-right">
            <span className="footer-copyright">© 2026 - All Rights Reserved</span>
            <button type="button" className="footer-backtop" onClick={scrollToTop}>
              <span className="footer-backtop-text">Back to top </span>
              <img src="/images/img_svg.svg" alt="" className="footer-backtop-img" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
