import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registrar plugins de GSAP
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Exportar GSAP y plugins para uso en toda la aplicación
export { gsap, ScrollTrigger, useGSAP };

// Configuración global de GSAP
gsap.config({
  force3D: true,
  nullTargetWarn: false,
});

// Configuración por defecto de ScrollTrigger
ScrollTrigger.config({
  ignoreMobileResize: true,
});