import { gsap } from './gsap';
import Lenis from 'lenis';

interface ResponsiveAnimationConfig {
  lenis?: Lenis;
  duration?: number;
  ease?: string;
}

export class ResponsiveAnimationManager {
  private lenis?: Lenis;
  private duration: number;
  private ease: string;
  private currentBreakpoint: string = '';
  private animationTimeline?: gsap.core.Timeline;

  constructor({ lenis, duration = 0.4, ease = 'power2.out' }: ResponsiveAnimationConfig = {}) {
    this.lenis = lenis;
    this.duration = duration;
    this.ease = ease;
  }

  public setLenis(lenis: Lenis) {
    this.lenis = lenis;
  }

  public animateBreakpointTransition(fromBreakpoint: string, toBreakpoint: string) {
    // Pausar Lenis temporalmente para evitar conflictos
    if (this.lenis) {
      this.lenis.stop();
    }

    // Crear timeline para animaciones coordinadas
    this.animationTimeline = gsap.timeline({
      onComplete: () => {
        // Reactivar Lenis después de las animaciones
        if (this.lenis) {
          this.lenis.start();
        }
      }
    });

    // Animaciones específicas según el cambio de breakpoint
    this.addBreakpointSpecificAnimations(fromBreakpoint, toBreakpoint);
    
    // Animaciones generales de transición
    this.addGeneralTransitionAnimations();

    return this.animationTimeline;
  }

  private addBreakpointSpecificAnimations(from: string, to: string) {
    if (!this.animationTimeline) return;

    // Transición de desktop a mobile
    if (from === 'desktop' && to === 'mobile') {
      this.animationTimeline.add(this.createMobileTransition(), 0);
    }
    
    // Transición de mobile a desktop
    else if (from === 'mobile' && to === 'desktop') {
      this.animationTimeline.add(this.createDesktopTransition(), 0);
    }
    
    // Transiciones intermedias (tablet)
    else if (from === 'desktop' && to === 'tablet') {
      this.animationTimeline.add(this.createTabletTransition(), 0);
    }
  }

  private createMobileTransition(): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    // Animación del hero section
    const heroElements = document.querySelectorAll('.hero-heading-creative, .hero-heading-product, .hero-heading-designer');
    if (heroElements.length > 0) {
      tl.fromTo(heroElements, 
        { scale: 1, opacity: 1 },
        { 
          scale: 0.98, 
          opacity: 0.9,
          duration: this.duration / 2,
          ease: this.ease,
          stagger: 0.05
        }
      )
      .to(heroElements, {
        scale: 1,
        opacity: 1,
        duration: this.duration / 2,
        ease: this.ease,
        stagger: 0.05
      });
    }

    // Animación del hero-bottom (cambio de layout)
    const heroBottom = document.querySelector('.hero-bottom');
    if (heroBottom) {
      tl.fromTo(heroBottom,
        { y: 0 },
        {
          y: -5,
          duration: this.duration,
          ease: this.ease,
          yoyo: true,
          repeat: 1
        },
        0
      );
    }

    return tl;
  }

  private createDesktopTransition(): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    // Animación de expansión para desktop
    const mainElements = document.querySelectorAll('.hero-section, .featured-section');
    if (mainElements.length > 0) {
      tl.fromTo(mainElements,
        { scale: 1 },
        {
          scale: 1.01,
          duration: this.duration,
          ease: this.ease,
          yoyo: true,
          repeat: 1,
          stagger: 0.1
        }
      );
    }

    return tl;
  }

  private createTabletTransition(): gsap.core.Timeline {
    const tl = gsap.timeline();
    
    // Animación intermedia para tablet
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    if (portfolioCards.length > 0) {
      tl.fromTo(portfolioCards,
        { rotationY: 0 },
        {
          rotationY: 2,
          duration: this.duration,
          ease: this.ease,
          yoyo: true,
          repeat: 1,
          stagger: 0.03
        }
      );
    }

    return tl;
  }

  private addGeneralTransitionAnimations() {
    if (!this.animationTimeline) return;

    // Efecto de "respiración" en elementos de texto
    const textElements = document.querySelectorAll('.philosophy-title-geist, .philosophy-title-gilda');
    if (textElements.length > 0) {
      this.animationTimeline.fromTo(textElements,
        { opacity: 1 },
        {
          opacity: 0.95,
          duration: this.duration / 3,
          ease: this.ease,
          yoyo: true,
          repeat: 1,
          stagger: 0.02
        },
        0
      );
    }

    // Animación sutil de la imagen de perfil
    const profileImg = document.querySelector('.hero-profile-img');
    if (profileImg) {
      this.animationTimeline.fromTo(profileImg,
        { scale: 1, rotation: 0 },
        {
          scale: 1.02,
          rotation: 0.5,
          duration: this.duration,
          ease: this.ease,
          yoyo: true,
          repeat: 1
        },
        0
      );
    }
  }

  public cleanup() {
    if (this.animationTimeline) {
      this.animationTimeline.kill();
    }
  }

  public destroy() {
    this.cleanup();
    this.lenis = undefined;
    this.animationTimeline = undefined;
  }
}

export default ResponsiveAnimationManager;