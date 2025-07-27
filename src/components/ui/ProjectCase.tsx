import React from 'react';
import Divider from './Divider';
import ColorPalette from './ColorPalette';
import FontDisplay from './FontDisplay';
import ParallaxSection from './ParallaxSection';
import AnimatedElement from './AnimatedElement';
import NextProjectButton from './NextProjectButton';
import { ProjectData } from '../../hooks/useProjectData';

interface ProjectCaseProps {
  data: ProjectData;
}

const ProjectCase: React.FC<ProjectCaseProps> = ({ data }) => {
  return (
    <main className="project-case">
      {/* Header Section */}
      <section className="project-header">
        <div className="project-header-wrapper">
          <div className="project-header-container">
            <AnimatedElement animation="fadeIn" duration={1.2}>
              <div className="project-title">
                <div className="project-title-row">
                  <div className="project-title-left">
                    <h1 className="project-title-main">{data.project}</h1>
                    <p className="project-date">{data.date}</p>
                  </div>
                  <div className="project-title-right">
                    <h1 className="project-title-sub">{data.name}</h1>
                    <p className="project-description">{data.heroDescription}</p>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      {/* Case Study Section */}
      <section className="project-case-study">
        <div className="project-case-wrapper">
          <div className="project-case-container">
            {/* Project Image */}
            <AnimatedElement animation="slideUp" delay={0.3} threshold={0.2}>
              <div className="project-image">
                <img src={data.heroImage} alt={`${data.project} ${data.name}`} />
              </div>
            </AnimatedElement>

            {/* Divider */}
            <Divider animation="slideLeft" delay={0.1} />

            {/* Overview Section */}
            <AnimatedElement animation="slideUp" threshold={0.2}>
              <div className="project-overview">
                <div className="project-overview-left">
                  <h2 className="project-overview-title">Overview</h2>
                </div>
                <div className="project-overview-right">
                  <div className="project-overview-item">
                    <h3 className="project-overview-subtitle">Description</h3>
                    <p className="project-overview-text">{data.overview.description}</p>
                  </div>
                  <div className="project-overview-item">
                    <h3 className="project-overview-subtitle">Project goal</h3>
                    <p className="project-overview-text">{data.projectGoal.description}</p>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            {/* Divider */}
            <Divider animation="slideRight" delay={0.1} />

            {/* Fonts & Colors Section */}
            <AnimatedElement animation="slideLeft" threshold={0.2}>
              <div className="project-fonts-colors">
                <div className="project-fonts-colors-left">
                  <h2 className="project-fonts-colors-heading">fonts & colours</h2>
                  <p className="project-fonts-colors-description">{data.fontAndColours.description}</p>
                </div>
                <div className="project-fonts-colors-right">
                  <AnimatedElement animation="slideUp" delay={0.2} threshold={0.2}>
                    <ColorPalette colors={data.fontAndColours.colors} />
                  </AnimatedElement>
                  <AnimatedElement animation="slideUp" delay={0.4} threshold={0.2}>
                    <FontDisplay fonts={data.fontAndColours.fonts} />
                  </AnimatedElement>
                </div>
              </div>
            </AnimatedElement>

            {/* Divider */}
            <Divider />

            {/* Design Process Section */}
            <AnimatedElement animation="slideRight" threshold={0.2}>
              <div className="project-design-process">
                <div className="project-design-process-left">
                  <h2 className="project-design-process-heading">Design Process</h2>
                  <p className="project-design-process-description">{data.designProcess.description}</p>
                </div>
                <div className="project-design-process-right">
                  <AnimatedElement animation="slideUp" delay={0.2} threshold={0.2}>
                    <div className="project-design-process-item">
                      <h3 className="project-design-process-subtitle">RESEARCH</h3>
                      <p className="project-design-process-description">
                        {data.designProcess.research.description}
                      </p>
                    </div>
                  </AnimatedElement>
                </div>
              </div>
            </AnimatedElement>

             {/* Divider */}
             <Divider animation="slideLeft" delay={0.1} />

             {/* Gallery Section */}
             <AnimatedElement animation="slideUp" threshold={0.2}>
               <div className="project-gallery">
                 <div className="project-gallery-header">
                   <h2 className="project-gallery-heading">GALLERY</h2>
                   <p className="project-gallery-description">{data.gallery.description}</p>
                 </div>
                 <div className="project-gallery-grid">
                   {data.gallery.images.map((image, index) => (
                     <AnimatedElement key={index} animation="fadeIn" delay={0.1 * (index + 1)} threshold={0.2}>
                       <div className="project-gallery-item">
                         <img src={image} alt={`Gallery image ${index + 1}`} />
                       </div>
                     </AnimatedElement>
                   ))}
                 </div>
               </div>
             </AnimatedElement>
           </div>
         </div>
       </section>

       {/* Parallax Section */}
       <ParallaxSection speed={0.5} direction="down" className="project-featured-section" zIndex={1}>
         <AnimatedElement animation="slideUp" threshold={0.2}>
           <NextProjectButton currentProjectId={data.id} />
         </AnimatedElement>
       </ParallaxSection>
     </main>
   );
};

export default ProjectCase;