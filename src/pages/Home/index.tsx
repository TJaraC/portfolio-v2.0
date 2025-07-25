import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Contact from '../../components/common/Contact';
import Button from '../../components/ui/Button';
import AnimatedElement from '../../components/ui/AnimatedElement';
import ParallaxSection from '../../components/ui/ParallaxSection';
import GSAPCarousel from '../../components/ui/GSAPCarousel';
import Switch from '../../components/ui/Switch';
import { useLenisScroll } from '../../hooks/useLenisScroll';
import '../../styles/home.css';

const Home: React.FC = () => {
  // Initialize Lenis scroll
  useLenisScroll();
  
  // Estado para manejar el switch
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  
  const handleSwitchToggle = (isOn: boolean) => {
    setIsSwitchOn(isOn);
  };

  return (
    <div className="home-container">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <section className="hero-section">
        <AnimatedElement animation="fadeIn" duration={1.2}>
          <h1 className="hero-heading">
            <span className="hero-heading-creative">Creative</span><br />
            <span 
              className="hero-heading-product"
              style={{
                color: isSwitchOn ? 'var(--global-text-1)' : 'var(--global-text-3)'
              }}
            >
              PR
              <Switch className="switch--hero" onToggle={handleSwitchToggle} />
              UCT
            </span><br />
            <span className="hero-heading-designer">
              Des<span className="hero-heading-designer-i">i</span>gner
            </span>
          </h1>
        </AnimatedElement>
        <AnimatedElement animation="slideUp" delay={0.3} duration={1}>
          <div className="hero-bottom">
            <img 
              src="/images/img_img.png" 
              alt="Profile" 
              className="hero-profile-img"
            />
            <p className="hero-description">
              product design is where logic, research and creativity come together. I enjoy creating elegant solutions with dynamic interactions and intuitive designs that not only look good, but also feel smooth and enjoyable to use.
            </p>
          </div>
        </AnimatedElement>
      </section>
      
      {/* Featured Work Section */}
      <ParallaxSection speed={1.5} direction="down" className="featured-section" zIndex={1}>
        <AnimatedElement animation="slideUp" threshold={0.2}>
          <h2 className="featured-heading">
            <span className="featured-heading-gilda">FEATURED </span>
            <span className="featured-heading-geist">WORK</span>
          </h2>
        </AnimatedElement>
      </ParallaxSection>
      
      {/* Portfolio Grid */}
      <section className="portfolio-section" style={{ position: 'relative', zIndex: 5, backgroundColor: 'var(--global-bg-1)' }}>
        <div className="portfolio-grid">
          {/* Card 1 */}
          <AnimatedElement animation="slideUp" delay={0.1} threshold={0.2}>
            <article className="portfolio-card">
              <div className="portfolio-card-number">01</div>
              <div className="portfolio-card-img-wrapper">
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="E-commerce Platform" 
                  className="portfolio-card-img"
                />
              </div>
              <div className="portfolio-card-info">
                <h3 className="portfolio-card-title">E-commerce Platform</h3>
                <div className="portfolio-card-tags">
                  <span className="portfolio-card-tag">RESPONSIVE</span>
                  <span className="portfolio-card-tag">MODERN</span>
                  <span className="portfolio-card-tag">INTUITIVE</span>
                </div>
              </div>
            </article>
          </AnimatedElement>
          {/* Card 2 */}
          <AnimatedElement animation="slideUp" delay={0.2} threshold={0.2}>
            <article className="portfolio-card">
              <div className="portfolio-card-number">02</div>
              <div className="portfolio-card-img-wrapper">
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="Mobile Banking App" 
                  className="portfolio-card-img"
                />
              </div>
              <div className="portfolio-card-info">
                <h3 className="portfolio-card-title">Mobile Banking App</h3>
                <div className="portfolio-card-tags">
                  <span className="portfolio-card-tag">SECURE</span>
                  <span className="portfolio-card-tag">ACCESSIBLE</span>
                  <span className="portfolio-card-tag">SLEEK</span>
                </div>
              </div>
            </article>
          </AnimatedElement>
          {/* Card 3 */}
          <AnimatedElement animation="slideUp" delay={0.3} threshold={0.2}>
            <article className="portfolio-card">
              <div className="portfolio-card-number">03</div>
              <div className="portfolio-card-img-wrapper">
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="Healthcare Dashboard" 
                  className="portfolio-card-img"
                />
              </div>
              <div className="portfolio-card-info">
                <h3 className="portfolio-card-title">Healthcare Dashboard</h3>
                <div className="portfolio-card-tags">
                  <span className="portfolio-card-tag">ANALYTICAL</span>
                  <span className="portfolio-card-tag">CLEAN</span>
                  <span className="portfolio-card-tag">PROFESSIONAL</span>
                </div>
              </div>
            </article>
          </AnimatedElement>
          {/* Card 4 */}
          <AnimatedElement animation="slideUp" delay={0.4} threshold={0.2}>
            <article className="portfolio-card">
              <div className="portfolio-card-number">04</div>
              <div className="portfolio-card-img-wrapper">
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="Social Media Platform" 
                  className="portfolio-card-img"
                />
              </div>
              <div className="portfolio-card-info">
                <h3 className="portfolio-card-title">Social Media Platform</h3>
                <div className="portfolio-card-tags">
                  <span className="portfolio-card-tag">ENGAGING</span>
                  <span className="portfolio-card-tag">VIBRANT</span>
                  <span className="portfolio-card-tag">INTERACTIVE</span>
                </div>
              </div>
            </article>
          </AnimatedElement>
        </div>
      </section>
      
      {/* Philosophy Section */}
      <section className="philosophy-section">
        <div className="philosophy-content">
          <div className="philosophy-titles">
            {/* Primera fila - se mueve hacia la izquierda */}
            <GSAPCarousel direction="left" baseSpeed={35}>
              <span className="philosophy-title-geist">functionality</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin6">& aesthetics</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin10">learn;experiment </span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">functionality</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin6">& aesthetics</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda philosophy-title-margin10">learn;experiment </span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
            </GSAPCarousel>
            {/* Segunda fila - se mueve hacia la derecha */}
            <GSAPCarousel direction="right" baseSpeed={35}>
              <span className="philosophy-title-gilda">experiences</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">technology</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">& creativity</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">experiences</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-gilda">technology</span>
              <img src="/images/logo-white.svg" alt="separator" className="philosophy-separator" />
              <span className="philosophy-title-geist">& creativity</span>
            </GSAPCarousel>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <AnimatedElement animation="slideLeft" threshold={0.2}>
            <div className="about-images">
              <div className="about-images-row">
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="About" 
                  className="about-img"
                />
                <img 
                  src="/images/img_img_750x920.png" 
                  alt="Profile" 
                  className="about-img"
                />
              </div>
            </div>
          </AnimatedElement>
          <AnimatedElement animation="slideRight" delay={0.2} threshold={0.2}>
            <div className="about-who">
              <h3 className="about-who-title">
                <span className="about-who-title-gilda">WHO</span>
                <span className="about-who-title-geist">IS TJC?</span>
              </h3>
              <div className="about-description-wrapper">
                 <p className="about-description">
                   I studied Advertising Graphics at the School of Art in Seville, and later completed a Master's in Web Design and Front-End Development. That's when I started working as a designer in a digital marketing team, where I really got to grow — both in design and as part of a team. It helped me boost my creativity and problem-solving skills. Later on, I took a Master's in UX/UI Web Application Design, and today I am working as a Creative Product Designer.
                 </p>
               </div>
            </div>
          </AnimatedElement>
        </div>
      </section>
      
      {/* Contact Section */}
      <Contact />
    </div>
  );
};

export default Home;