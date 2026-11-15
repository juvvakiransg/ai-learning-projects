export interface CareerRole { title: string; skills: string[]; summary: string; }
export const ROLES: CareerRole[] = [
  { title: 'Solution Architect', skills: ['system design','cloud computing','architecture','api design','security','communication'], summary: 'Designs scalable solutions and aligns technology with business requirements.' },
  { title: 'Mobile Architect', skills: ['swift','ios','architecture','system design','ci/cd','kotlin multiplatform'], summary: 'Leads mobile architecture and cross-platform technical strategy.' },
  { title: 'Cloud Engineer', skills: ['cloud computing','aws','azure','docker','kubernetes','ci/cd'], summary: 'Builds and operates reliable cloud infrastructure.' },
  { title: 'AI Engineer', skills: ['python','machine learning','prompt engineering','llm','api design','responsible ai'], summary: 'Builds and evaluates AI-enabled applications.' },
  { title: 'DevOps Engineer', skills: ['ci/cd','docker','kubernetes','terraform','monitoring','cloud computing'], summary: 'Automates delivery, deployment and infrastructure operations.' },
  { title: 'Frontend Engineer', skills: ['javascript','typescript','react','html','css','testing'], summary: 'Builds accessible and interactive web applications.' }
];
