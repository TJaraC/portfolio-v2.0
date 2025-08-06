import { useState, useEffect } from 'react';

const images = [
  '/images/general/hands.png',
  '/images/general/stars.webp',
  '/images/general/warholl.webp'
];

export const useImageRotation = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImage, setCurrentImage] = useState(images[0]);

  useEffect(() => {
    // Obtener el índice guardado en localStorage o usar 0 como default
    const savedIndex = localStorage.getItem('designerImageIndex');
    let nextIndex = 0;
    
    if (savedIndex !== null) {
      // Incrementar el índice para la siguiente imagen
      nextIndex = (parseInt(savedIndex) + 1) % images.length;
    }
    
    // Guardar el nuevo índice
    localStorage.setItem('designerImageIndex', nextIndex.toString());
    
    // Actualizar el estado
    setCurrentImageIndex(nextIndex);
    setCurrentImage(images[nextIndex]);
  }, []); // Solo ejecutar una vez al montar el componente

  return {
    currentImage,
    currentImageIndex,
    totalImages: images.length
  };
};