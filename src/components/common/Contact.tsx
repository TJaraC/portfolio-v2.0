import React from 'react';
import Button from '../ui/Button';
import '../../styles/Contact.css';

const Contact: React.FC = () => {
  return (
    <section className="contact-section">
      <div className="contact-content">
        <div className="contact-title-wrapper">
          <h2 className="contact-heading">
            <span className="contact-heading-gilda">GET IN</span>
            <span className="contact-heading-geist">TOUCH</span>
          </h2>
          <div className="contact-subtitle">
            <span className="contact-subtitle-link">let's connect:</span>
            <span className="contact-subtitle-text">Whether you have a question</span>
          </div>
        </div>
        {/* Footer */}
        <footer className="footer">
          <div className="footer-left">
            <span className="footer-design">Design & Developed </span>
            <span className="footer-author">by Patricio Jaramillo Castrillo</span>
            <span className="footer-copyright">© 2025 - All Rights Reserved</span>
          </div>
          <div className="footer-links">
            <Button 
              variant="outline" 
              className="footer-btn"
              onClick={() => window.open('https://www.linkedin.com/in/patricio-jaramillo-castrillo-557427200/', '_blank')}
            >
              LINKEDIN
            </Button>
            <Button 
              variant="outline" 
              className="footer-btn"
              onClick={() => window.open('https://www.behance.net/tjaradesign', '_blank')}
            >
              BEHANCE
            </Button>
            <Button 
              variant="outline" 
              className="footer-btn"
              onClick={() => window.open('mailto:triciojarac@gmail.com', '_self')}
            >
              EMAIL
            </Button>
          </div>
          <div className="footer-right">
            <div className="footer-backtop">
              <span className="footer-backtop-text">Back to top </span>
              <img 
                src="/images/img_svg.svg" 
                alt="Arrow up" 
                className="footer-backtop-img"
              />
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
};

export default Contact;