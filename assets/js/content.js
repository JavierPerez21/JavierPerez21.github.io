/**
 * Every piece of copy on the site lives here.
 * Edit this file to update the website; the scenes read from it.
 */

export const profile = {
  name: 'Javier Perez Tobia',
  role: 'Applied AI & ML engineer',
  location: 'Madrid, Spain',
  timezone: 'Europe/Madrid',
  email: 'javierpereztobia@gmail.com',
  now: 'Associate, Data Science · QuantumBlack, AI by McKinsey',
  updated: '2026-11',
  links: [
    { id: 'email', label: 'Email', href: 'mailto:javierpereztobia@gmail.com' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/javipt21/' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/JavierPerez21' },
    { id: 'x', label: 'X / Twitter', href: 'https://twitter.com/javi_pereztobia' },
  ],
};

/* ------------------------------------------------------------------ */
/* §02 · Monte Carlo life paths                                         */
/* `t` is a decimal year; `z` is how many σ above the ensemble mean the  */
/* realised path sits at that moment (the path is a Brownian bridge     */
/* pinned through these points).                                        */
/* ------------------------------------------------------------------ */

export const NOW = 2026.85;

/* Organisations behind the milestones. `icon` is the small mark on a card,
   `logo` the full logo in its expanded view (official artwork, in
   assets/img/logos/). */
export const orgs = {
  qb: { name: 'QuantumBlack, AI by McKinsey', icon: 'assets/img/logos/qb-mark.png', logo: 'assets/img/logos/qb-wordmark.png', href: 'https://www.mckinsey.com/capabilities/quantumblack/how-we-help-clients' },
  mck: { name: 'McKinsey & Company', icon: 'assets/img/logos/mckinsey.svg', logo: 'assets/img/logos/mckinsey.svg', href: 'https://www.mckinsey.com/' },
  ubc: { name: 'University of British Columbia', icon: 'assets/img/logos/ubc-mark.svg', logo: 'assets/img/logos/ubc.svg', href: 'https://ok.ubc.ca/' },
};

/* Each milestone is a card under the plot; `detail` is what it shows when
   clicked open: a summary, bullet points, an optional image and links. */
export const milestones = [
  {
    t: 2016.3, z: 0.35, when: '2016', title: 'First prize, Spring Mathematics Competition', where: 'La Rioja, Spain', note: 'XVIII edition. The earliest data point.',
    detail: {
      summary: 'First prize in the XVIII Spring Mathematics Competition of La Rioja (Concurso de Primavera), organised by Aprima, the region’s association of mathematics teachers.',
      points: ['A problem-solving competition for secondary-school students across La Rioja.', 'The first sign that the path would bend towards mathematics.'],
    },
  },
  {
    t: 2018.2, z: 0.55, when: '2018', title: 'Bronze medal, Spanish Physics Olympiad', where: 'Local phase · Universidad de La Rioja',
    detail: {
      summary: 'Bronze medal in the local phase of the Spanish Physics Olympiad, held at the Universidad de La Rioja, in my last year of secondary school.',
      points: ['A few months later I left Spain to study physics and mathematics in Canada.'],
    },
  },
  {
    t: 2018.7, z: 0.95, when: 'Sep 2018', org: 'ubc', title: 'B.Sc. Physics & Mathematics begins', where: 'University of British Columbia · Kelowna, Canada', note: 'International Major Entrance Scholarship · Outstanding International Student.',
    detail: {
      summary: 'Moved from Spain to Kelowna, British Columbia, to start a combined B.Sc. in Physics and Mathematics at UBC’s Okanagan campus.',
      points: [
        'International Major Entrance Award and Outstanding International Student Award (2018).',
        'International Student Faculty Award (2019, 2020) and Deputy Vice-Chancellor Award for International Students (2019, 2020, 2022).',
        'Co-founded UBC’s Student Independent Research Club.',
      ],
    },
  },
  {
    t: 2019.05, z: 1.1, when: '2018 – 19', title: 'Won CAN-SBX', where: 'Canadian Stratospheric Balloon Experiment', note: 'Co-led the team that designed a stratospheric particle-flux experiment, later flown on Canadian Space Agency campaigns.',
    detail: {
      summary: 'In my first year at UBC I co-led AC2O, the undergraduate team that won the 2018 Canadian Stratospheric Balloon Experiment (CAN-SBX) design challenge.',
      points: [
        'We designed and built an experiment to measure particle flux in the stratosphere.',
        'It flew on the Canadian Space Agency’s 2019 Stratos balloon campaign.',
      ],
      image: 'assets/img/work/balloon.webp',
      links: [
        { label: 'Project', href: 'https://ac2oubco.wixsite.com/ac2o' },
        { label: 'Video', href: 'https://www.youtube.com/watch?v=mPEmIPTtRMk' },
      ],
    },
  },
  {
    t: 2019.45, z: 1.05, when: 'Jun 2019', title: 'Crop classification for the UN World Food Programme', where: 'Omdena', note: 'Managed the data-labelling team locating rice and wheat fields in Nepal from satellite imagery.',
    detail: {
      summary: 'Data-labelling team manager (Jun – Aug 2019) on Omdena’s crop-classification challenge with the UN World Food Programme: locating rice and wheat fields in Nepal during the growing season, from satellite imagery and deep learning.',
      points: [
        'Organised the labelling team and its tasks, and coordinated our work with the modelling teams.',
        'Built the data-labelling pipeline that enabled 89% crop-identification accuracy.',
        'The learnings became an article: 7 steps to build a quality satellite-imagery dataset for agriculture.',
      ],
      image: 'assets/img/work/satellite.webp',
      links: [
        { label: 'Project', href: 'https://omdena.com/projects/cropclassification/' },
        { label: 'Article', href: 'https://omdena.com/blog/satellite-imagery-dataset/' },
      ],
    },
  },
  {
    t: 2020.7, z: 0.85, when: 'Sep 2020', org: 'ubc', title: 'Teaching Assistant, Calculus I', where: 'UBC · MATH 116',
    detail: {
      summary: 'Teaching Assistant for MATH 116, Calculus I for Management and Economics, from September 2020 to April 2021.',
      points: ['Ran the tutorial sections.', 'Helped students with their questions and went back over material that had not landed in lectures.'],
    },
  },
  {
    t: 2021.35, z: 1.05, when: 'May 2021', org: 'ubc', title: 'Machine Learning Researcher', where: 'UBC · DAIS & IDSL labs', note: 'Adversarial robustness, adaptive control, biomolecular ML.',
    detail: {
      summary: 'Machine Learning Researcher (May 2021 – Apr 2022) in UBC’s IDSL and DAIS labs, working with Dr Apurva Narayan.',
      points: [
        'Robust deep learning: a new defence against adversarial attacks that clearly outperformed earlier ones against AutoAttack (AGS).',
        'Deep-learning system identification for linear systems, and a new method for adaptive model predictive control.',
        'Aptamer–compound affinity prediction and ML-directed aptamer search.',
        'cCGen: a conditional classifier-generator for imbalanced classification.',
      ],
      image: 'assets/img/work/mpc.webp',
    },
  },
  {
    t: 2021.8, z: 1.2, when: 'Oct 2021', title: 'First paper, at IEEE SMC 2021', where: 'Is Timing Critical to Trace Reconstruction?',
    detail: {
      summary: '“Is Timing Critical to Trace Reconstruction?”, with Apurva Narayan, at the 2021 IEEE International Conference on Systems, Man, and Cybernetics.',
      points: ['Time-series research on reconstructing event traces, and on how much their timing information matters.'],
      links: [{ label: 'Paper', href: 'https://ieeexplore.ieee.org/abstract/document/9658712' }],
    },
  },
  {
    t: 2022.15, z: 1.35, when: 'Feb 2022', title: 'QHack 2022: #29 out of 800+', where: 'Quantum computing hackathon', note: 'All 25 coding challenges solved, with Qiskit and PennyLane.',
    detail: {
      summary: 'Led team QSolutions at QHack 2022. We solved all 25 of 25 coding challenges and ranked #29 of 800+ teams worldwide.',
      points: [
        'Quantum algorithms, quantum machine learning and quantum chemistry, built with Qiskit and PennyLane.',
        'Also an IBM Certified Associate Developer in Quantum Computation using Qiskit.',
      ],
      image: 'assets/img/work/qhack2022.webp',
      links: [
        { label: 'Solutions', href: 'https://github.com/JavierPerez21/QHack2022' },
        { label: 'Certificate', href: 'assets/docs/qhack-2022-certificate.pdf' },
      ],
    },
  },
  {
    t: 2022.33, z: 1.4, when: 'Apr 2022', title: 'AGS published at IDA 2022', where: 'Attribution Guided Sharpening', note: 'State-of-the-art defence against AutoAttack.',
    detail: {
      summary: '“AGS: Attribution Guided Sharpening as a Defense Against Adversarial Attacks”, with Phillip Braun and Apurva Narayan, in Advances in Intelligent Data Analysis XX (IDA 2022, Springer).',
      points: [
        'A defence for computer-vision classifiers, guided by attribution (explainability) maps.',
        'State-of-the-art results against AutoAttack on benchmark datasets, well ahead of earlier defences.',
      ],
      image: 'assets/img/work/adversarial.webp',
      links: [{ label: 'Paper', href: 'https://link.springer.com/chapter/10.1007/978-3-031-01333-1_18' }],
    },
  },
  {
    t: 2022.45, z: 1.42, when: 'Jun 2022', org: 'mck', title: 'Data Science Intern at McKinsey', where: 'McKinsey & Company · Madrid',
    detail: {
      summary: 'Data Science Intern at McKinsey & Company in Madrid (Jun – Jul 2022): my first contact with industry.',
      points: [
        'Optimisation models for futures pricing and asset allocation.',
        'Productionised the models and migrated them to the cloud.',
      ],
    },
  },
  {
    t: 2023.4, z: 1.5, when: '2023', org: 'ubc', title: 'Graduated with a 96.2% average', where: 'UBC · Graduating Student Award', note: 'Aptamer-search paper published in ACS Synthetic Biology.',
    detail: {
      summary: 'Graduated from UBC with a B.Sc. in Physics and Mathematics and a 96.2% cumulative average.',
      points: [
        'Graduating Student Award in Physics & Mathematics.',
        '“Machine Learning Directed Aptamer Search from Conserved Primary Sequence and Secondary Structure”, in ACS Synthetic Biology (2023). The predicted sequences were validated experimentally.',
        '“Improving imbalanced dataset classification using Conditional Classifier-Generator (cCGen)”, at IEEE SMC 2022.',
      ],
      image: 'assets/img/work/aptamerprotein.webp',
      links: [{ label: 'Aptamer preprint', href: 'https://chemrxiv.org/engage/chemrxiv/article-details/630a2dafd858fb0f695e65f2' }],
    },
  },
  {
    t: 2023.7, z: 1.55, when: 'Sep 2023', org: 'qb', title: 'Data Scientist at QuantumBlack', where: 'QuantumBlack, AI by McKinsey · Madrid',
    detail: {
      summary: 'Joined QuantumBlack, AI by McKinsey, in Madrid as a Data Scientist, starting in energy.',
      points: [
        'AI-native energy trading for a major Spanish utility: ML forecasting and Gurobi-based multi-asset optimisation feeding the desk’s daily decisions.',
        'A digital twin of a refinery for a Spanish energy player, with real-time ML models predicting crude properties and optimisation built into operations.',
      ],
    },
  },
  {
    t: 2024.85, z: 1.62, when: 'Nov 2024', org: 'qb', title: 'Senior Data Scientist at QuantumBlack', where: 'QuantumBlack, AI by McKinsey', note: 'Energy trading, refining, retail banking.',
    detail: {
      summary: 'Promoted to Senior Data Scientist, owning end-to-end AI workstreams from proof of concept to deployment.',
      points: [
        'ML-driven deposit pricing for a leading German retail bank: price-sensitivity and portfolio-allocation models, with measurable P&L impact in under four weeks.',
        'Wave-based deployment, then expansion to the full portfolio under management.',
        'Capability building across client software-development teams.',
      ],
    },
  },
  {
    t: 2025.85, z: 1.72, when: 'Nov 2025', org: 'qb', title: 'Associate, Data Science at QuantumBlack', where: 'QuantumBlack, AI by McKinsey', note: 'Leading data-science teams of 5+ across energy, banking and telecom.',
    detail: {
      summary: 'Associate, Data Science: leading data-science teams of 5+ across energy, banking and telecom.',
      points: [
        'Customer-value optimisation for major Latin American and Iberian telcos: ML targeting and a company-wide optimisation “brain” for segmentation, targeting and campaigns.',
        'LLM-based solutions for call-transcription analytics and knowledge retrieval, and a redesign of the data-lake architecture.',
      ],
    },
  },
  {
    t: NOW, z: 1.78, when: 'now', org: 'qb', title: 'You are here', where: 'Madrid · QuantumBlack, AI by McKinsey', note: 'Everything to the right is still being sampled: scroll on.',
    detail: {
      summary: 'Based in Madrid, building AI that survives contact with the real world: optimisation, ML and LLM systems in production.',
      points: ['Everything to the right of this line is still being sampled. Scroll on to see some of the futures.'],
      links: [{ label: 'Get in touch', href: '#next' }],
    },
  },
];

/* ------------------------------------------------------------------ */
/* §03 · Inside the model                                               */
/* Each layer is a plane of neurons; named neurons open a detail panel. */
/* Item `tags` refer to token ids in the embedding layer.               */
/* ------------------------------------------------------------------ */

export const skillGroups = {
  ml: {
    label: 'ML & research',
    text: 'Python, PyTorch, JAX, Qiskit, scikit-learn, NumPy and pandas, with hands-on research in deep learning, computer vision, time series, generative modelling, adversarial robustness and biomolecular ML.',
  },
  genai: {
    label: 'Generative AI & LLM systems',
    text: 'Agentic co-development and harnessing, RAG, agentic workflows, embeddings and vector retrieval, tool and function calling, LLM evaluation, and production integration of LLM-enabled applications.',
  },
  opt: {
    label: 'Optimisation & control',
    text: 'Gurobi, MATLAB and C++, with industry deployments of stochastic and multi-asset optimisation, portfolio optimisation, adaptive model predictive control, digital twins and mathematical modelling.',
  },
  eng: {
    label: 'Engineering & production',
    text: 'SQL, Linux, Git, AWS and Azure. MLOps, model serving and productionisation, data pipelines and data-lake architecture, real-time ML systems and enterprise AI platform design.',
  },
};

export const tokens = [
  { id: 'python', label: 'Python', group: 'ml' },
  { id: 'pytorch', label: 'PyTorch', group: 'ml' },
  { id: 'jax', label: 'JAX', group: 'ml' },
  { id: 'qiskit', label: 'Qiskit', group: 'ml' },
  { id: 'rag', label: 'RAG', group: 'genai' },
  { id: 'agents', label: 'Agents', group: 'genai' },
  { id: 'evals', label: 'LLM evals', group: 'genai' },
  { id: 'gurobi', label: 'Gurobi', group: 'opt' },
  { id: 'stochopt', label: 'Stochastic opt.', group: 'opt' },
  { id: 'mpc', label: 'MPC', group: 'opt' },
  { id: 'twins', label: 'Digital twins', group: 'opt' },
  { id: 'cpp', label: 'C++', group: 'opt' },
  { id: 'mlops', label: 'MLOps', group: 'eng' },
  { id: 'cloud', label: 'AWS · Azure', group: 'eng' },
  { id: 'sql', label: 'SQL', group: 'eng' },
];

export const layers = [
  {
    id: 'embed',
    op: 'embedding',
    title: 'The stack',
    span: 'tokens → vectors',
    blurb: 'Every forward pass starts with tokens. These are mine, clustered by where they get used.',
    kind: 'tokens',
  },
  {
    id: 'attn',
    op: 'attention',
    title: 'QuantumBlack, AI by McKinsey',
    span: '2022 · 2023 → now',
    blurb: 'Data Scientist → Senior Data Scientist → Associate. I own end-to-end AI workstreams and lead data-science teams of 5+ across energy, banking and telecom.',
    items: [
      {
        id: 'trading',
        title: 'AI-native energy trading',
        tag: 'energy · trading',
        meta: 'Major Spanish energy utility',
        summary: 'Moved AI into the core of the trading desk’s decisions, not just into a dashboard.',
        points: [
          'ML forecasting and Gurobi-based multi-asset optimisation feeding the daily trading decisions.',
          'End-to-end process orchestration and deployment approach, so the models run every day.',
          'Capability building across the client’s software-development teams.',
        ],
        tags: ['gurobi', 'stochopt', 'python', 'mlops'],
      },
      {
        id: 'refining',
        title: 'Digital twin of a refinery',
        tag: 'energy · operations',
        meta: 'Spanish energy player',
        summary: 'A digital transformation of refining operations.',
        points: [
          'Digital twins of the process, plus real-time ML models predicting crude properties.',
          'Optimisation modules integrated into operational workflows.',
          'A change-management journey to embed the new ways of working.',
        ],
        tags: ['twins', 'python', 'mlops', 'stochopt'],
      },
      {
        id: 'deposits',
        title: 'ML-driven deposit pricing',
        tag: 'banking · pricing',
        meta: 'Leading German retail bank',
        summary: 'Price-sensitivity and portfolio-allocation models for retail deposits.',
        points: [
          'Proofs of concept showed measurable P&L impact in under four weeks.',
          'Wave-based deployment, then expansion to the full portfolio under management.',
        ],
        tags: ['python', 'stochopt', 'sql'],
      },
      {
        id: 'telco',
        title: 'Customer-value optimisation',
        tag: 'telecom · LLMs',
        meta: 'Major Latin American & Iberian telcos',
        summary: 'Rebuilt the analytics behind customer-value management.',
        points: [
          'ML targeting models and a company-wide optimisation “brain” for automated segmentation, targeting and campaign execution.',
          'LLM-based solutions for call-transcription analytics and knowledge retrieval.',
          'Redesign of the data-lake architecture.',
        ],
        tags: ['rag', 'agents', 'evals', 'cloud', 'sql'],
      },
      {
        id: 'intern',
        title: 'Futures pricing & asset allocation',
        tag: 'intern · 2022',
        meta: 'Data Science Intern · McKinsey Madrid',
        summary: 'First contact with industry, in the summer of 2022.',
        points: [
          'Optimisation models for futures pricing and asset allocation.',
          'Productionised the models and migrated them to the cloud.',
        ],
        tags: ['python', 'gurobi', 'cloud'],
      },
    ],
  },
  {
    id: 'mlp',
    op: 'mlp',
    title: 'Research at UBC',
    span: '2021 → 2022',
    blurb: 'Machine Learning Researcher in the DAIS and IDSL labs. Three publications across adversarial robustness, biomolecular ML and time series.',
    items: [
      {
        id: 'ags',
        title: 'AGS: Attribution Guided Sharpening',
        tag: 'robustness · IDA 2022',
        meta: 'Advances in Intelligent Data Analysis XX · Springer',
        summary: 'Architectures and attribution-guided defences that make neural-network classifiers robust against adversarial examples.',
        points: [
          'A new defence for computer-vision classifiers, guided by attribution (explainability) maps.',
          'State-of-the-art results against AutoAttack on benchmark datasets, well ahead of earlier defences.',
        ],
        image: 'assets/img/work/adversarial.webp',
        links: [{ label: 'Paper', href: 'https://link.springer.com/chapter/10.1007/978-3-031-01333-1_18' }],
        tags: ['pytorch', 'python'],
      },
      {
        id: 'aptamer',
        title: 'ML-directed aptamer search',
        tag: 'bio-ML · ACS Synth. Bio. 2023',
        meta: 'ACS Synthetic Biology, 2023',
        summary: 'Machine Learning Directed Aptamer Search from Conserved Primary Sequence and Secondary Structure.',
        points: [
          'Models that score how strongly an aptamer–protein pair binds.',
          'Methods to generate new aptamer sequences for a target protein. The predicted sequences were validated experimentally.',
        ],
        image: 'assets/img/work/aptamerprotein.webp',
        links: [{ label: 'Preprint', href: 'https://chemrxiv.org/engage/chemrxiv/article-details/630a2dafd858fb0f695e65f2' }],
        tags: ['pytorch', 'python'],
      },
      {
        id: 'trace',
        title: 'Is Timing Critical to Trace Reconstruction?',
        tag: 'time series · IEEE SMC 2021',
        meta: 'IEEE Systems, Man & Cybernetics, 2021',
        summary: 'Time-series research on event-trace reconstruction.',
        links: [{ label: 'Paper', href: 'https://ieeexplore.ieee.org/abstract/document/9658712' }],
        tags: ['python', 'pytorch'],
      },
      {
        id: 'mpc',
        title: 'Adaptive model predictive control',
        tag: 'control · DAIS lab',
        meta: 'Deep-learning system identification',
        summary: 'Controllers that keep working after the world changes underneath them.',
        points: [
          'Deep-learning system identification for linear systems.',
          'A new adaptive MPC method that handles unmodelled or changing parameters without retraining after deployment.',
        ],
        image: 'assets/img/work/mpc.webp',
        tags: ['mpc', 'pytorch', 'python'],
      },
      {
        id: 'ccgen',
        title: 'cCGen: Conditional Classifier-Generator',
        tag: 'imbalanced learning',
        meta: 'Data generation for imbalanced classification',
        summary: 'Data-generation methods for imbalanced classification: a conditional generator trained together with the classifier it serves.',
        image: 'assets/img/work/ccgen.webp',
        tags: ['pytorch', 'python'],
      },
    ],
  },
  {
    id: 'resid',
    op: 'residual',
    title: 'Builds & side quests',
    span: '2018 → 2022',
    blurb: 'The things that kept flowing through the residual stream: hackathons, a stratospheric balloon, satellites and some quantum computing.',
    items: [
      {
        id: 'qhack',
        title: 'QHack 2022',
        tag: '#29 / 800+',
        meta: 'Quantum computing hackathon · team lead',
        summary: 'Led team QSolutions. We finished all 25 of 25 coding challenges and ranked #29 globally.',
        points: ['Quantum algorithms, quantum machine learning and quantum chemistry, built with Qiskit and PennyLane.'],
        image: 'assets/img/work/qhack2022.webp',
        links: [
          { label: 'Solutions', href: 'https://github.com/JavierPerez21/QHack2022' },
          { label: 'Certificate', href: 'assets/docs/qhack-2022-certificate.pdf' },
        ],
        tags: ['qiskit', 'python'],
      },
      {
        id: 'cansbx',
        title: 'CAN-SBX: AC2O',
        tag: 'winner · space',
        meta: 'Canadian Stratospheric Balloon Experiment',
        summary: 'In my first year at UBC I co-led the undergraduate team that won CAN-SBX 2018.',
        points: ['We designed a stratospheric particle-flux experiment. It flew on the Canadian Space Agency’s 2019 Stratos campaign.'],
        image: 'assets/img/work/balloon.webp',
        links: [
          { label: 'Project', href: 'https://ac2oubco.wixsite.com/ac2o' },
          { label: 'Video', href: 'https://www.youtube.com/watch?v=mPEmIPTtRMk' },
        ],
        tags: ['cpp', 'python'],
      },
      {
        id: 'omdena',
        title: 'Crop classification for the UN WFP',
        tag: 'satellites · Omdena',
        meta: 'Data-labelling team manager · 2019',
        summary: 'Deep learning on satellite imagery to locate rice and wheat in Nepal during the growing season, in support of the World Food Programme’s fight against hunger.',
        points: [
          'Organised the labelling team and coordinated with the modelling teams.',
          'Built the data-labelling pipeline that enabled 89% crop-identification accuracy.',
        ],
        image: 'assets/img/work/satellite.webp',
        links: [
          { label: 'Project', href: 'https://omdena.com/projects/cropclassification/' },
          { label: 'Article', href: 'https://omdena.com/blog/satellite-imagery-dataset/' },
        ],
        tags: ['python', 'pytorch'],
      },
      {
        id: 'quantum',
        title: 'Quantum computing, in practice',
        tag: 'IBM certified · Qiskit',
        meta: 'IBM Certified Associate Developer, Quantum Computation using Qiskit',
        summary: 'Notebooks and solutions from quantum-computing competitions, plus study material for the Qiskit developer exam.',
        image: 'assets/img/work/qccircuit.webp',
        links: [
          { label: 'Challenges', href: 'https://github.com/JavierPerez21/QuantumComputingChallenges' },
          { label: 'Qiskit practice', href: 'https://github.com/JavierPerez21/QiskitPractice' },
          { label: 'Badge', href: 'https://www.credly.com/badges/2ffc6f20-d1fc-4ce0-ab66-ddfc0ada28f4' },
        ],
        tags: ['qiskit', 'python'],
      },
      {
        id: 'lorentz',
        title: 'Lorentz symmetry breaking in SUSY QED',
        tag: 'theoretical physics',
        meta: 'World Scientific · 2020',
        summary: 'Helped write and correct a paper on Lorentz-symmetry breaking in supersymmetric quantum electrodynamics.',
        links: [{ label: 'Paper', href: 'https://www.worldscientific.com/doi/abs/10.1142/S0219887820500383' }],
        tags: [],
      },
      {
        id: 'club',
        title: 'Student Independent Research Club',
        tag: 'co-founder · UBC',
        meta: 'Academic leadership',
        summary: 'Co-founded UBC’s Student Independent Research Club. I was also a teaching assistant for undergraduate mathematics (MATH 116, Calculus I).',
        tags: [],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* §04 · Model card                                                     */
/* ------------------------------------------------------------------ */

export const modelCard = {
  id: 'javier-perez-tobia',
  version: 'v2026.11',
  badges: ['applied-ai', 'machine-learning', 'optimisation', 'physics', 'mathematics', 'es · en · fr'],
  rows: [
    { k: 'Model type', v: 'Applied AI / ML engineer and researcher, from research to production deployment.' },
    { k: 'Base model', v: 'B.Sc. Physics & Mathematics, University of British Columbia (2018 – 2023). 96.2% cumulative average.' },
    { k: 'Fine-tuning', v: 'ML research at UBC’s DAIS & IDSL labs (2021 – 22), then QuantumBlack, AI by McKinsey (2023 → now) across energy, banking and telecom.' },
    { k: 'Intended use', v: 'Hard technical problems where you need to understand what is happening underneath the data, and a model that survives contact with the real system around it.' },
    { k: 'Languages', v: 'Spanish (native) · English (C2, bilingual) · French (B2).' },
    { k: 'Known limitations', v: 'Will try to frame your problem as a stochastic optimisation. Occasionally goes ski touring instead of converging.', link: { label: 'evidence →', href: 'explore/' } },
  ],
  evals: [
    { bench: 'UBC cumulative average', score: '96.2%', note: 'B.Sc. Physics & Mathematics' },
    { bench: 'QHack 2022 global rank', score: '#29', note: 'of 800+ · 25/25 challenges' },
    { bench: 'Peer-reviewed publications', score: '3', note: 'IDA · ACS Synth. Bio. · IEEE SMC' },
    { bench: 'Deposit-pricing PoC: time to P&L impact', score: '< 4 wk', note: 'retail banking' },
  ],
  honors: [
    'Graduating Student Award in Physics & Mathematics, UBC',
    'International Student Faculty Award, UBC',
    'Deputy Vice-Chancellor Award for International Students, UBC',
    'International Major Entrance Scholarship, UBC',
    'Outstanding International Student Award, UBC',
    'CAN-SBX 2018 winner, Canadian Space Agency',
    'Bronze medal, Spanish Physics Olympiad (local phase)',
    'First prize, XVIII Spring Mathematics Competition of La Rioja',
  ],
  certs: [
    { label: 'IBM Certified Associate Developer: Quantum Computation using Qiskit', href: 'https://www.credly.com/badges/2ffc6f20-d1fc-4ce0-ab66-ddfc0ada28f4' },
    { label: 'QHack 2022 Coding Challenges: completion certificate', href: 'assets/docs/qhack-2022-certificate.pdf' },
    { label: 'Deep Learning A-Z: Hands-On Artificial Neural Networks', href: 'https://www.udemy.com/certificate/UC-815f5a91-385f-4fa7-85c4-5b3367fbfca1/' },
    { label: 'Machine Learning A-Z: Hands-On Python & R in Data Science', href: 'https://www.udemy.com/certificate/UC-XFO8LZNT/' },
  ],
};

/* ------------------------------------------------------------------ */
/* §05 · Next-token sampler (contact)                                   */
/* ------------------------------------------------------------------ */

export const nextTokens = [
  { token: ' email', logit: 2.4, href: 'mailto:javierpereztobia@gmail.com', hint: 'javierpereztobia@gmail.com' },
  { token: ' linkedin', logit: 1.9, href: 'https://www.linkedin.com/in/javipt21/', hint: 'in/javipt21' },
  { token: ' github', logit: 1.1, href: 'https://github.com/JavierPerez21', hint: 'JavierPerez21' },
  { token: ' explore', logit: 0.6, href: 'explore/', hint: 'photos from the mountains' },
  { token: ' x', logit: 0.2, href: 'https://twitter.com/javi_pereztobia', hint: '@javi_pereztobia' },
];

/* ------------------------------------------------------------------ */
/* /explore · photographs                                               */
/* Files live in assets/img/explore/<id>-sm.webp and <id>-lg.webp,      */
/* generated by scripts/optimize_images.py. `ar` = width / height.      */
/* ------------------------------------------------------------------ */

export const photos = [
  { id: 'p1653', ar: 0.75, alt: 'Skier on a cornice above a sea of clouds' },
  { id: 'p0353', ar: 0.75, alt: 'Sun rising behind a jagged summit' },
  { id: 'p0567', ar: 0.75, alt: 'Scrambling up the last limestone ridge' },
  { id: 'p2247', ar: 0.75, alt: 'Snow ghosts and a skin track' },
  { id: 'p0413', ar: 1.333, alt: 'Alpenglow over a mountain range' },
  { id: 'p3155', ar: 0.562, alt: 'Skier dropping off a snow-covered boulder' },
  { id: 'p0702', ar: 0.75, alt: 'Trail above a turquoise lake' },
  { id: 'p2420', ar: 0.75, alt: 'Rime-encrusted trees under a blue sky' },
  { id: 'p3674', ar: 0.75, alt: 'Standing on a rock pillar between cliffs' },
  { id: 'p1771', ar: 0.75, alt: 'Snow-loaded firs in flat light' },
  { id: 'p0346', ar: 0.75, alt: 'Headlamp silhouette on a dark ridge' },
  { id: 'p2987', ar: 0.75, alt: 'Sun breaking over a cloud inversion' },
  { id: 'p0565', ar: 0.75, alt: 'Rocky ridge above deep valleys' },
  { id: 'p2127', ar: 0.75, alt: 'Backlit firs in deep powder' },
  { id: 'p3708', ar: 0.75, alt: 'Meltwater lake reflecting clouds' },
  { id: 'p0603', ar: 0.75, alt: 'Resting on a ledge above the valley' },
  { id: 'p2398', ar: 0.75, alt: 'Skinning into the white' },
  { id: 'p0861', ar: 0.75, alt: 'Forest trail with a wooden fence' },
  { id: 'p3705', ar: 3.117, alt: 'Panorama of an alpine lake still half frozen' },
  { id: 'p2099', ar: 0.75, alt: 'Last light on a forested ridge' },
  { id: 'p3610', ar: 0.75, alt: 'Skiers descending a steep chute in fog' },
  { id: 'p0181', ar: 0.75, alt: 'Creek bed of stones under pines' },
  { id: 'p3761', ar: 0.564, alt: 'Skier on a misty slope' },
  { id: 'p1379', ar: 0.75, alt: 'Cypress trees on a sunny hillside' },
];
