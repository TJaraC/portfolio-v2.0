import React, { CSSProperties, ReactNode } from 'react';
import Divider from './Divider';
import ColorPalette from './ColorPalette';
import FontDisplay from './FontDisplay';
import ParallaxSection from './ParallaxSection';
import AnimatedElement from './AnimatedElement';
import NextProjectButton from './NextProjectButton';
import ImageWithCurtain from './ImageWithCurtain';
import { ProjectData } from '../../hooks/useProjectData';

interface ProjectCaseProps {
  data: ProjectData;
}

interface CaseChapterProps {
  number: string;
  title: string;
  children: ReactNode;
  className?: string;
}

type ProjectTheme = CSSProperties & {
  '--project-accent': string;
  '--project-accent-strong': string;
};

const CaseChapter: React.FC<CaseChapterProps> = ({ number, title, children, className = '' }) => {
  const headingId = `chapter-${number}`;

  return (
    <>
      <Divider animation={Number(number) % 2 === 0 ? 'slideRight' : 'slideLeft'} delay={0.1} />
      <AnimatedElement animation="slideUp" threshold={0.08}>
        <section className={`case-chapter ${className}`} aria-labelledby={headingId}>
          <header className="case-chapter-header">
            <span className="case-chapter-number" aria-hidden="true">
              {number}
            </span>
            <h2 id={headingId} className="case-chapter-title">
              {title}
            </h2>
          </header>
          <div className="case-chapter-content">{children}</div>
        </section>
      </AnimatedElement>
    </>
  );
};

const ProjectCase: React.FC<ProjectCaseProps> = ({ data }) => {
  const caseStudy = data.caseStudy;
  const theme = {
    '--project-accent': data.fontAndColours.colors[0],
    '--project-accent-strong': data.fontAndColours.colors[1] ?? data.fontAndColours.colors[0],
  } as ProjectTheme;

  return (
    <main className="project-case" style={theme} data-project={data.id}>
      <section className="project-header" aria-labelledby="project-title">
        <div className="project-header-wrapper">
          <div className="project-header-container">
            <AnimatedElement animation="fadeIn" duration={1.2}>
              <div className="project-title">
                <div className="project-title-row">
                  <div className="project-title-left">
                    <h1 id="project-title" className="project-title-main">
                      {data.project}
                    </h1>
                    <p className="project-date">{data.date}</p>
                  </div>
                  <div className="project-title-right">
                    <p className="project-title-sub" aria-hidden={!data.name}>
                      {data.name}
                    </p>
                    <p className="project-description">{data.heroDescription}</p>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          </div>
        </div>
      </section>

      <section className="project-case-study" aria-label={`${data.cardTitle} case study`}>
        <div className="project-case-wrapper">
          <div className="project-case-container">
            <div className={`project-hero-media ${data.heroInsetImage ? 'has-inset' : ''}`}>
              <div className="project-hero-main">
                <ImageWithCurtain
                  src={data.heroImage}
                  alt={`${data.cardTitle} hero shown in its primary device context`}
                  delay={0.3}
                  duration={1.2}
                  threshold={0.1}
                  loading="eager"
                />
              </div>
              {data.heroInsetImage ? (
                <div className="project-hero-inset">
                  <ImageWithCurtain
                    src={data.heroInsetImage}
                    alt={`${data.cardTitle} responsive interface detail`}
                    delay={0.55}
                    duration={1}
                    threshold={0.1}
                  />
                </div>
              ) : null}
              <div className="project-hero-index" aria-hidden="true">
                <span>01</span>
                <span>Introduction</span>
              </div>
            </div>

            <CaseChapter number="02" title="Overview">
              <p className="case-lead">{data.overview.description}</p>
              {caseStudy?.meta?.length ? (
                <dl className="case-meta-grid">
                  {caseStudy.meta.map((item, index) => (
                    <div className="case-meta-item" key={`${item.label}-${index}`}>
                      <dt>{item.label}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              <div className="case-goal-card">
                <span className="case-kicker">Project goal</span>
                <p>{data.projectGoal.description}</p>
              </div>
            </CaseChapter>

            {caseStudy ? (
              <>
                <CaseChapter number="03" title="The challenge" className="case-challenge">
                  <p className="case-lead">{caseStudy.challenge.description}</p>
                  <blockquote className="case-question">
                    <span>Design question</span>
                    <p>{caseStudy.challenge.question}</p>
                  </blockquote>
                  <div className="case-priority-grid">
                    {caseStudy.challenge.priorities.map((priority, index) => (
                      <article className="case-priority-card" key={`${priority.title}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{priority.title}</h3>
                        <p>{priority.description}</p>
                      </article>
                    ))}
                  </div>
                </CaseChapter>

                <CaseChapter number="04" title="Research & insights" className="case-research">
                  <p className="case-lead">{caseStudy.research.description}</p>
                  <div className="case-insight-grid">
                    {caseStudy.research.insights.map((insight, index) => (
                      <article className="case-insight-card" key={`${insight.label}-${index}`}>
                        <span>{insight.label}</span>
                        <h3>{insight.title}</h3>
                        <p>{insight.description}</p>
                      </article>
                    ))}
                  </div>
                  <div className="case-benchmark-block">
                    <div className="case-block-heading">
                      <span className="case-kicker">Competitive scan</span>
                      <p>{caseStudy.research.benchmark.note}</p>
                    </div>
                    <div
                      className="case-table-scroll"
                      tabIndex={0}
                      aria-label="Scrollable competitive benchmark"
                    >
                      <table className="case-benchmark-table">
                        <thead>
                          <tr>
                            <th scope="col">Product</th>
                            {caseStudy.research.benchmark.criteria.map((criterion, index) => (
                              <th scope="col" key={`${criterion}-${index}`}>
                                {criterion}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {caseStudy.research.benchmark.rows.map((row, rowIndex) => (
                            <tr
                              className={row.featured ? 'is-featured' : ''}
                              key={`${row.name}-${rowIndex}`}
                            >
                              <th scope="row">{row.name}</th>
                              {row.values.map((value, index) => (
                                <td
                                  key={`${row.name}-${rowIndex}-${caseStudy.research.benchmark.criteria[index]}-${index}`}
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <article className="case-persona-card">
                    <div className="case-persona-intro">
                      <div className="case-persona-monogram" aria-hidden="true">
                        {caseStudy.research.persona.name
                          .split(' ')
                          .map((part) => part[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                      <div>
                        <span className="case-kicker">Primary persona</span>
                        <h3>{caseStudy.research.persona.name}</h3>
                        <p>{caseStudy.research.persona.archetype}</p>
                      </div>
                    </div>
                    <p className="case-persona-context">{caseStudy.research.persona.context}</p>
                    <blockquote>{caseStudy.research.persona.quote}</blockquote>
                    <div className="case-persona-lists">
                      <div>
                        <h4>Goals</h4>
                        <ul>
                          {caseStudy.research.persona.goals.map((goal, index) => (
                            <li key={`${goal}-${index}`}>{goal}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4>Frictions</h4>
                        <ul>
                          {caseStudy.research.persona.frustrations.map((frustration, index) => (
                            <li key={`${frustration}-${index}`}>{frustration}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </CaseChapter>

                <CaseChapter number="05" title="Ideation" className="case-ideation">
                  <p className="case-lead">{caseStudy.ideation.description}</p>
                  <ol className="case-flow" aria-label="Core user flow">
                    {caseStudy.ideation.flow.map((step, index) => (
                      <li key={`${step.title}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="case-decision-grid">
                    {caseStudy.ideation.decisions.map((decision, index) => (
                      <article className="case-decision-card" key={`${decision.label}-${index}`}>
                        <span>{decision.label}</span>
                        <h3>{decision.title}</h3>
                        <p>{decision.description}</p>
                      </article>
                    ))}
                  </div>
                </CaseChapter>

                <CaseChapter number="06" title="Design & iterations" className="case-design">
                  <p className="case-lead">{caseStudy.design.description}</p>
                  <div className="case-design-system">
                    <div className="case-design-system-copy">
                      <span className="case-kicker">Visual system</span>
                      <p>{data.fontAndColours.description}</p>
                    </div>
                    <div className="case-design-system-ui">
                      <ColorPalette colors={data.fontAndColours.colors} />
                      <FontDisplay fonts={data.fontAndColours.fonts} />
                    </div>
                  </div>
                  <div className="case-decision-grid">
                    {caseStudy.design.decisions.map((decision, index) => (
                      <article className="case-decision-card" key={`${decision.label}-${index}`}>
                        <span>{decision.label}</span>
                        <h3>{decision.title}</h3>
                        <p>{decision.description}</p>
                      </article>
                    ))}
                  </div>
                  <div className="case-iterations" aria-label="Design iteration decisions">
                    {caseStudy.design.iterations.map((iteration, index) => (
                      <article
                        className="case-iteration-row"
                        key={`${iteration.component}-${index}`}
                      >
                        <div className="case-iteration-heading">
                          <span className="case-kicker">{iteration.component}</span>
                          <strong>{iteration.outcome}</strong>
                        </div>
                        <div className="case-iteration-state is-before">
                          <span>Before</span>
                          <p>{iteration.before}</p>
                        </div>
                        <div className="case-iteration-state is-after">
                          <span>After</span>
                          <p>{iteration.after}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </CaseChapter>

                <CaseChapter number="07" title="User testing" className="case-testing">
                  <p className="case-lead">{caseStudy.testing.description}</p>
                  <div className="case-method-note">
                    <span className="case-kicker">Validation approach</span>
                    <p>{caseStudy.testing.method}</p>
                  </div>
                  <div className="case-findings">
                    {caseStudy.testing.findings.map((finding, index) => (
                      <article className="case-finding-row" key={`${finding.task}-${index}`}>
                        <span className="case-finding-index">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <span>Task</span>
                          <h3>{finding.task}</h3>
                        </div>
                        <div>
                          <span>Observed</span>
                          <p>{finding.observation}</p>
                        </div>
                        <div>
                          <span>Design response</span>
                          <p>{finding.decision}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </CaseChapter>

                <CaseChapter number="08" title="Final design" className="case-final">
                  <p className="case-lead">{caseStudy.finalDesign.description}</p>
                  <div className="case-highlight-grid">
                    {caseStudy.finalDesign.highlights.map((highlight, index) => (
                      <article className="case-highlight-card" key={`${highlight.title}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <h3>{highlight.title}</h3>
                        <p>{highlight.description}</p>
                      </article>
                    ))}
                  </div>
                  <div className="project-gallery-grid">
                    {data.gallery.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="project-gallery-item">
                        <ImageWithCurtain
                          src={image}
                          alt={`${data.cardTitle} final design view ${index + 1}`}
                          delay={0.08 * (index + 1)}
                          duration={1}
                          threshold={0.08}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="case-gallery-caption">{data.gallery.description}</p>
                </CaseChapter>

                <CaseChapter number="09" title="Impact" className="case-impact">
                  <p className="case-lead">{caseStudy.impact.description}</p>
                  <div className="case-metric-grid">
                    {caseStudy.impact.metrics.map((metric, index) => (
                      <article className="case-metric-card" key={`${metric.label}-${index}`}>
                        <strong>{metric.value}</strong>
                        <h3>{metric.label}</h3>
                        <p>{metric.description}</p>
                      </article>
                    ))}
                  </div>
                </CaseChapter>

                <CaseChapter number="10" title="Learnings" className="case-learnings">
                  <p className="case-learnings-summary">{caseStudy.learnings.description}</p>
                  <div className="case-learning-list">
                    {caseStudy.learnings.items.map((learning, index) => (
                      <article key={`${learning.title}-${index}`}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <div>
                          <h3>{learning.title}</h3>
                          <p>{learning.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </CaseChapter>
              </>
            ) : (
              <>
                <CaseChapter number="06" title="Design process">
                  <p className="case-lead">{data.designProcess?.description}</p>
                  <div className="case-design-system">
                    <div className="case-design-system-copy">
                      <span className="case-kicker">Visual system</span>
                      <p>{data.fontAndColours.description}</p>
                    </div>
                    <div className="case-design-system-ui">
                      <ColorPalette colors={data.fontAndColours.colors} />
                      <FontDisplay fonts={data.fontAndColours.fonts} />
                    </div>
                  </div>
                </CaseChapter>
                <CaseChapter number="08" title="Gallery">
                  <p className="case-lead">{data.gallery.description}</p>
                  <div className="project-gallery-grid">
                    {data.gallery.images.map((image, index) => (
                      <div key={`${image}-${index}`} className="project-gallery-item">
                        <ImageWithCurtain src={image} alt={`Gallery image ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </CaseChapter>
              </>
            )}
          </div>
        </div>
      </section>

      <ParallaxSection speed={0.5} direction="down" className="project-featured-section" zIndex={1}>
        <AnimatedElement animation="slideUp" threshold={0.2}>
          <NextProjectButton currentProjectId={data.id} />
        </AnimatedElement>
      </ParallaxSection>
    </main>
  );
};

export default ProjectCase;
