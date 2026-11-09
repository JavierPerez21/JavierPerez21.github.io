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
  now: 'Senior Data Scientist I · QuantumBlack, AI by McKinsey',
  updated: '2026-11',
  links: [
    { id: 'email', label: 'Email', href: 'mailto:javierpereztobia@gmail.com' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/javipt21/' },
    { id: 'github', label: 'GitHub', href: 'https://github.com/JavierPerez21' },
    { id: 'x', label: 'X / Twitter', href: 'https://twitter.com/viperjaerez' },
  ],
  /* The floating "Explore" menu, bottom right. Listed top to bottom; the last
     entry sits right above the button. */
  dock: [
    { id: 'resume', label: 'Download résumé', hint: 'PDF', href: 'assets/docs/javier-perez-tobia-resume.pdf', download: 'Javier-Perez-Tobia-Resume.pdf' },
    { id: 'linkedin', label: 'LinkedIn', hint: '↗', href: 'https://www.linkedin.com/in/javipt21/', external: true },
    { id: 'scholar', label: 'Google Scholar', hint: '↗', href: 'https://scholar.google.com/citations?user=ZM0NiG8AAAAJ&hl=en', external: true },
    { id: 'github', label: 'GitHub', hint: '↗', href: 'https://github.com/JavierPerez21', external: true },
    { id: 'email', label: 'Email', hint: '@', href: 'mailto:javierpereztobia@gmail.com' },
    { id: 'x', label: 'X', hint: '↗', href: 'https://twitter.com/viperjaerez', external: true },
    { id: 'images', label: 'Beyond professional life', hint: '→', href: 'explore/' },
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
    t: 2016.3, z: 0.35, when: '2016', title: 'First prize, Spanish Mathematics Olympiad', where: 'Local phase · La Rioja', note: 'The earliest data point.',
    detail: {
      summary: 'Won first prize in the local phase of the Spanish Mathematics Olympiad, in La Rioja.',
      points: ['A problem-solving competition for secondary-school students across La Rioja.', 'The first sign that the path would bend towards mathematics.'],
    },
  },
  {
    t: 2018.2, z: 0.55, when: '2018', title: 'Bronze medal, Spanish Physics Olympiad', where: 'Local phase · Universidad de La Rioja',
    detail: {
      summary: 'Won a bronze medal in the local phase of the Spanish Physics Olympiad, held at the Universidad de La Rioja, in my last year of secondary school.',
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
      summary: 'Co-led AC2O, the undergraduate team that won the 2018 Canadian Stratospheric Balloon Experiment (CAN-SBX) design challenge, in my first year at UBC.',
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
      summary: 'Managed the data-labelling team (Jun – Aug 2019) on Omdena’s crop-classification challenge with the UN World Food Programme, locating rice and wheat fields in Nepal from satellite imagery and deep learning.',
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
      summary: 'Taught the tutorials of MATH 116, Calculus I for Management and Economics, as a Teaching Assistant from September 2020 to April 2021.',
      points: [
        'Helped students with their questions and went back over material that had not landed in lectures.',
      ],
    },
  },
  {
    t: 2021.35, z: 1.05, when: 'May 2021', org: 'ubc', title: 'Machine Learning Researcher', where: 'UBC · DAIS & IDSL labs', note: 'Adversarial robustness, adaptive control, biomolecular ML.',
    detail: {
      summary: 'Researched robust and applied deep learning (May 2021 – Apr 2022) in UBC’s IDSL and DAIS labs, working with Dr Apurva Narayan.',
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
      summary: 'Published “Is Timing Critical to Trace Reconstruction?”, with Apurva Narayan, at the 2021 IEEE International Conference on Systems, Man, and Cybernetics.',
      points: ['Time-series research on reconstructing event traces, and on how much their timing information matters.'],
      links: [{ label: 'Paper', href: 'https://ieeexplore.ieee.org/abstract/document/9658712' }],
    },
  },
  {
    t: 2022.15, z: 1.35, when: 'Feb 2022', title: 'QHack 2022: #29 out of 800+', where: 'Quantum computing hackathon', note: 'All 25 coding challenges solved, with Qiskit and PennyLane.',
    detail: {
      summary: 'Led team QSolutions at QHack 2022, solving all 25 of 25 coding challenges and ranking #29 of 800+ teams worldwide.',
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
      summary: 'Published “AGS: Attribution Guided Sharpening as a Defense Against Adversarial Attacks”, with Phillip Braun and Apurva Narayan, in Advances in Intelligent Data Analysis XX (IDA 2022, Springer).',
      points: [
        'A defence for computer-vision classifiers, guided by attribution (explainability) maps.',
        'State-of-the-art results against AutoAttack on benchmark datasets, well ahead of earlier defences.',
      ],
      image: 'assets/img/work/adversarial.webp',
      links: [{ label: 'Paper', href: 'https://link.springer.com/chapter/10.1007/978-3-031-01333-1_18' }],
    },
  },
  {
    t: 2022.45, z: 1.42, when: 'Jun 2022', org: 'mck', title: 'Data Science Intern at McKinsey', where: 'McKinsey & Company · Europe',
    detail: {
      summary: 'Joined McKinsey & Company in Europe as a Data Science Intern (Jun – Jul 2022): my first contact with industry.',
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
    t: 2023.7, z: 1.55, when: 'Sep 2023', org: 'qb', title: 'Data Scientist I at QuantumBlack', where: 'QuantumBlack, AI by McKinsey · Europe',
    detail: {
      summary: 'Joined QuantumBlack, AI by McKinsey, in Europe as a Data Scientist I, starting in energy.',
      points: [
        'AI-native energy trading for a major European utility: ML forecasting and Gurobi-based multi-asset optimisation feeding the desk’s daily decisions.',
        'A digital twin of a refinery for a European energy player, with real-time ML models predicting crude properties and optimisation built into operations.',
      ],
    },
  },
  {
    t: 2024.85, z: 1.62, when: 'Nov 2024', org: 'qb', title: 'Data Scientist II at QuantumBlack', where: 'QuantumBlack, AI by McKinsey', note: 'Energy trading, refining, retail banking.',
    detail: {
      summary: 'Took ownership of end-to-end AI workstreams, from proof of concept to deployment, on promotion to Data Scientist II.',
      points: [
        'ML-driven deposit pricing for a leading European retail bank: price-sensitivity and portfolio-allocation models, with measurable P&L impact in under four weeks.',
        'Wave-based deployment, then expansion to the full portfolio under management.',
        'Capability building across client software-development teams.',
      ],
    },
  },
  {
    t: 2025.85, z: 1.72, when: 'Nov 2025', org: 'qb', title: 'Senior Data Scientist I at QuantumBlack', where: 'QuantumBlack, AI by McKinsey', note: 'Leading data-science teams of 5+ across power & gas trading, banking and telecom.',
    detail: {
      summary: 'Lead teams of 5+ data scientists across power and gas trading, banking and telecom as Senior Data Scientist I, while staying hands-on in the models and the code.',
      points: [
        'Power and gas trading and energy management for a European utility: optimisation, stochastic modelling and valuation tools used every day by its trading and operations teams.',
        'Oversaw an LLM call-auditing system with humans in the loop for a major telecom operator’s contact centre.',
        'Designed and taught a course on coding with AI agents for a trading desk’s analysts.',
        'Customer-value optimisation for major telcos across Latin America and Europe: ML targeting and a company-wide optimisation “brain” for segmentation, targeting and campaigns.',
      ],
    },
  },
  {
    t: NOW, z: 1.78, when: 'now', org: 'qb', title: 'You are here', where: 'QuantumBlack, AI by McKinsey', note: 'Everything to the right is still being sampled: scroll on.',
    detail: {
      summary: 'Building AI that survives contact with the real world: optimisation, ML and LLM systems in production.',
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
    label: 'Optimisation & energy markets',
    text: 'Gurobi, MILP and stochastic programming, Least-Squares Monte Carlo and Monte Carlo price simulation, MATLAB and C++. Deployed in power and gas trading: hydro scheduling and bidding into day-ahead, intraday and aFRR/mFRR reserve markets, gas storage valuation (rolling intrinsic, LSMC) and delta hedging, gas logistics balancing and multi-asset trading optimisation; plus adaptive MPC and digital twins.',
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
  { id: 'power', label: 'Power & gas', group: 'opt' },
  { id: 'gurobi', label: 'Gurobi', group: 'opt' },
  { id: 'milp', label: 'MILP', group: 'opt' },
  { id: 'lsmc', label: 'LSMC', group: 'opt' },
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
    kicker: 'Skills',
    title: 'The stack',
    span: 'tokens → vectors',
    blurb: 'Every forward pass starts with tokens. These are mine, clustered by where they get used.',
    kind: 'tokens',
  },
  {
    id: 'energy',
    op: 'attention',
    kicker: 'Energy trading & management',
    title: 'Power & gas · QuantumBlack',
    span: '2023 → now',
    blurb: 'Power and gas trading and energy management for a European utility: hydro scheduling and market bidding, gas storage valuation and hedging, gas logistics. Hands-on in the models and the code, while leading the junior data scientists around them.',
    items: [
      {
        id: 'hydro',
        title: 'Hydro cascade optimisation & market bidding',
        tag: 'power · hydro',
        meta: 'European utility · lead developer',
        summary: 'Built the daily optimiser that schedules a multi-reservoir hydro cascade and turns the plan into bids for the European power markets.',
        points: [
          'Long-term stochastic MILP to the end of the hydrological year over dry, medium and wet inflow scenarios: cascade mass balance, head-dependent production, turbine limits, ecological flows, spillage rules and end-of-horizon reservoir targets.',
          'Hourly water-value curves feed a 24-hour short-term MILP that builds day-ahead and intraday bids, aFRR (secondary) and mFRR (tertiary) reserve offers, and a unit-by-unit breakdown of cleared programmes.',
          'Inflow, capture-price and reserve-price forecasts, with backtesting and regret analysis against actual operations.',
          'In production every day on the market calendar: Flask API and Streamlit UI on Kubernetes, with Docker, ArgoCD, Azure Data Factory and Databricks.',
          'Lead developer: wrote most of the code base while leading the team around it.',
        ],
        tags: ['power', 'milp', 'stochopt', 'gurobi', 'mlops', 'cloud'],
      },
      {
        id: 'storage',
        title: 'Gas storage valuation: rolling intrinsic & LSMC',
        tag: 'gas · storage',
        meta: 'European utility · gas trading desk',
        summary: 'Built the valuation and weekly trade recommendations for a portfolio of gas storages across European hubs, from the forward curve to the deals to do.',
        points: [
          'Rolling-intrinsic MILP over tradeable forward products: fill-dependent injection and withdrawal curves, ratchets, regulatory filling milestones, lot sizes, liquidity, bid–ask and fees, and the financing and margining cost of the position.',
          'Least-Squares Monte Carlo (Longstaff–Schwartz) on correlated multi-factor forward-curve simulations for the extrinsic value; intrinsic/extrinsic split and a Shapley allocation of value across capacity lots.',
          'Hub economics across TTF, THE, PEG and NBP (winter–summer spreads, index transfers) and multi-year backtests that fed steering-committee decisions.',
          'Hands-on in the LSMC and Monte Carlo engine, the valuation module, the storage-rules registry and the backtests, while coaching the junior data scientists on the team.',
          'Backed by a reference library I keep of the underlying literature: Longstaff–Schwartz American options, rolling intrinsic, and spot and forward price models (Boogert–de Jong, mean reversion with jumps, GARCH, Gabillon) with calibration, deltas and model-risk quantification.',
        ],
        tags: ['power', 'lsmc', 'milp', 'gurobi', 'python'],
      },
      {
        id: 'hedging',
        title: 'Gas storage delta hedging',
        tag: 'gas · risk',
        meta: 'European utility · shadow trading',
        summary: 'Shaped a daily, liquidity-aware hedging programme that turns gas storage flexibility into trades for the desk.',
        points: [
          'Monte Carlo prices matched to the forward curve, LSMC backward induction for the storage value, and finite-difference deltas per delivery month.',
          'Hedge gaps mapped to tradeable products with a multi-product coverage MILP: integer lots, visible market depth, delta-neutrality thresholds and transaction costs.',
          'Physical allocation of the resulting obligations across storages.',
          'Guided the team that built it, from the methodology to the launch for shadow trading.',
        ],
        tags: ['power', 'lsmc', 'milp', 'gurobi'],
      },
      {
        id: 'logistics',
        title: 'Gas logistics balancing',
        tag: 'gas · logistics',
        meta: 'European utility',
        summary: 'Led the team behind a daily optimiser that balances a gas portfolio across three national systems at the lowest network and trading cost.',
        points: [
          'MILP minimising regulated network-access tariffs and trading costs: LNG regasification and tank levels, underground storage, cross-border flows at the interconnection points, and buy/sell decisions per traded product.',
          'Daily country balances, monthly injection, withdrawal and stock targets with pacing penalties, imbalance slack and infeasibility diagnostics.',
          'Tariff automation and capacity profiling, served through a REST API and a Streamlit app; built the API layer myself.',
        ],
        tags: ['power', 'milp', 'gurobi', 'cloud'],
      },
      {
        id: 'trading',
        title: 'AI-native energy trading',
        tag: 'power · trading',
        meta: 'Major European energy utility',
        summary: 'Moved AI into the core of the trading desk’s decisions, not just into a dashboard.',
        points: [
          'ML forecasting and Gurobi-based multi-asset optimisation feeding the daily trading decisions.',
          'End-to-end process orchestration and deployment approach, so the models run every day.',
          'Capability building across the client’s software-development teams.',
        ],
        tags: ['power', 'gurobi', 'stochopt', 'mlops'],
      },
      {
        id: 'refining',
        title: 'Digital twin of a refinery',
        tag: 'energy · operations',
        meta: 'European energy player',
        summary: 'Transformed refining operations with digital twins, real-time ML and optimisation built into the daily workflows.',
        points: [
          'Digital twins of the process, plus real-time ML models predicting crude properties.',
          'Optimisation modules integrated into operational workflows.',
          'A change-management journey to embed the new ways of working.',
        ],
        tags: ['twins', 'python', 'mlops', 'stochopt'],
      },
      {
        id: 'training',
        title: 'Coding with AI agents, for traders',
        tag: 'training · GenAI',
        meta: 'Trading-analytics team · course design',
        summary: 'Designed and taught a hands-on course on AI-assisted software engineering for a power and gas trading desk’s analysts.',
        points: [
          'Exercises on the desk’s own problems: hourly price analysis (DST and time zones), mark-to-market P&L of a power and gas forward book, and a live price dashboard.',
          'Spec-driven development and agent orchestration with GitHub Copilot, from inline suggestions to agent mode.',
          'Hidden graders on the business rules, and debriefs on trust and explainability, to teach people to verify what the AI writes.',
        ],
        tags: ['agents', 'evals', 'power', 'python'],
      },
    ],
  },
  {
    id: 'industry',
    op: 'cross-attention',
    kicker: 'Other industry experience',
    title: 'Banking, telecom & LLMs',
    span: '2022 · 2024 → now',
    blurb: 'Pricing for retail banking, customer value and LLM systems for telecom, and where it started: a summer at McKinsey.',
    items: [
      {
        id: 'calls',
        title: 'LLM call auditing',
        tag: 'telecom · LLMs',
        meta: 'Major telecom operator · led the delivery',
        summary: 'Oversaw the build of an AI auditor for contact-centre quality, with humans in the loop.',
        points: [
          'Calls are transcribed and scored by LLMs against the audit rubric, every answer with a justification and evidence from the transcript.',
          'A review app where dozens of auditors confirm or correct the AI every day; versioned corrections and accuracy dashboards measure agreement per question and feed back into the auditor.',
          'On Azure: FastAPI services, Cosmos DB, Blob Storage, Entra ID role-based access, Container Apps, and CI/CD with coverage gates.',
          'Set the direction, reviewed the design and steered the team that built it.',
        ],
        tags: ['evals', 'agents', 'cloud'],
      },
      {
        id: 'telco',
        title: 'Customer-value optimisation',
        tag: 'telecom · ML',
        meta: 'Major telcos · Latin America & Europe',
        summary: 'Rebuilt the analytics behind customer-value management.',
        points: [
          'ML targeting models and a company-wide optimisation “brain” for automated segmentation, targeting and campaign execution.',
          'LLM-based knowledge retrieval.',
          'Redesign of the data-lake architecture.',
        ],
        tags: ['rag', 'cloud', 'sql'],
      },
      {
        id: 'deposits',
        title: 'ML-driven deposit pricing',
        tag: 'banking · pricing',
        meta: 'Leading European retail bank',
        summary: 'Built price-sensitivity and portfolio-allocation models for the retail deposits of a leading European bank.',
        points: [
          'Proofs of concept showed measurable P&L impact in under four weeks.',
          'Wave-based deployment, then expansion to the full portfolio under management.',
        ],
        tags: ['python', 'stochopt', 'sql'],
      },
      {
        id: 'intern',
        title: 'Futures pricing & asset allocation',
        tag: 'intern · 2022',
        meta: 'Data Science Intern · McKinsey Europe',
        summary: 'Built optimisation models for futures pricing and asset allocation, in my first contact with industry in the summer of 2022.',
        points: [
          'Productionised the models and migrated them to the cloud.',
        ],
        tags: ['python', 'gurobi', 'cloud'],
      },
    ],
  },
  {
    id: 'mlp',
    op: 'mlp',
    kicker: 'Academia',
    title: 'Research at UBC',
    span: '2021 → 2022',
    blurb: 'Machine Learning Researcher in the DAIS and IDSL labs. Four publications across adversarial robustness, biomolecular ML, time series and imbalanced learning.',
    items: [
      {
        id: 'ags',
        title: 'AGS: Attribution Guided Sharpening',
        tag: 'robustness · IDA 2022',
        meta: 'Advances in Intelligent Data Analysis XX · Springer',
        summary: 'Designed architectures and attribution-guided defences that make neural-network classifiers robust against adversarial examples.',
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
        summary: 'Developed machine-learning methods to search for aptamers from their conserved primary sequence and secondary structure.',
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
        summary: 'Studied how much timing information matters when reconstructing event traces from time series.',
        points: [
          'Published at IEEE Systems, Man & Cybernetics 2021, with Apurva Narayan.',
        ],
        links: [{ label: 'Paper', href: 'https://ieeexplore.ieee.org/abstract/document/9658712' }],
        tags: ['python', 'pytorch'],
      },
      {
        id: 'mpc',
        title: 'Adaptive model predictive control',
        tag: 'control · DAIS lab',
        meta: 'Deep-learning system identification',
        summary: 'Developed controllers that keep working after the world changes underneath them.',
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
        summary: 'Developed cCGen, a conditional generator trained together with the classifier it serves, for imbalanced classification.',
        points: [
          'Generates data for the under-represented classes where the classifier needs it.',
          'Published as “Improving imbalanced dataset classification using Conditional Classifier-Generator (cCGen)” at IEEE SMC 2022.',
        ],
        image: 'assets/img/work/ccgen.webp',
        tags: ['pytorch', 'python'],
      },
    ],
  },
  {
    id: 'builds',
    op: 'residual',
    kicker: 'Personal projects',
    title: 'Builds',
    span: '2023 → now',
    blurb: 'Software I build for myself, outside client work: a trading platform, quant research, health data, offline speech and CAD automation.',
    items: [
      {
        id: 'betastonks',
        title: 'BetaStonks: algorithmic trading platform',
        tag: 'trading · since 2023',
        meta: 'Personal build · Python',
        summary: 'Built a modular algorithmic trading platform from scratch, from strategy rules to live orders.',
        points: [
          'Rule-based trading systems (moving-average crossovers, Turtle breakouts with pyramiding) kept apart from execution and state: an orchestrator, a broker and a market interface.',
          'Day-by-day and vectorised backtests, parameter search with hash-based deduplication, and consistency checks across simulation modes.',
          'Simulated, emulated and live execution through the Interactive Brokers TWS API, with stop-losses, commissions, telemetry and daily email reports.',
          'Over 400 commits since 2023.',
        ],
        tags: ['python'],
      },
      {
        id: 'alphanumerai',
        title: 'AlphaNumerAI: Numerai research',
        tag: 'quant ML · Numerai',
        meta: 'Personal build · Python',
        summary: 'Built a reproducible research foundation for the Numerai stock-market tournament, from raw data to dry-run submissions.',
        points: [
          'Range reads of only the needed columns and dates of the v6 Parquet data, under a memory budget, with dataset hashes and key validation.',
          'LightGBM baselines scored per era with Numerai’s correlation and benchmark-contribution metrics, dependence-aware summaries, and an append-only experiment ledger behind a self-contained research dashboard.',
          'A guarded live path: model-promotion records, schema checks and dry-run submissions, with staking switched off.',
        ],
        tags: ['python', 'mlops'],
      },
      {
        id: 'pulseboard',
        title: 'Pulseboard: Oura Ring dashboard',
        tag: 'health data · web app',
        meta: 'Personal build · Next.js & TypeScript',
        summary: 'Built a private, local-first dashboard to import and understand my own Oura Ring data.',
        points: [
          'A daily overview of readiness, sleep, activity, HRV and heart rate, with long-term trends, moving averages and exploratory correlations.',
          'Behaviour check-ins and baseline-versus-intervention experiments, with explicit insufficient-data states.',
          'Oura API v2 with OAuth2 and PKCE, AES-256-GCM encrypted tokens, paginated backfill and incremental sync into SQLite through Prisma; tested with Vitest and Playwright.',
        ],
        tags: ['sql'],
      },
      {
        id: 'transcriber',
        title: 'Offline meeting transcriber',
        tag: 'speech · local LLMs',
        meta: 'Personal tool · Python',
        summary: 'Built a fully offline, CPU-only pipeline that transcribes and summarises multilingual meetings.',
        points: [
          'faster-whisper (large-v3-turbo, int8) with stereo capture that separates my microphone from the call audio, for two-speaker diarisation without any ML; optional pyannote diarisation on top.',
          'Glossary-biased decoding and language locks for jargon-heavy, code-switched Spanish, Portuguese and English.',
          'Domain-aware correction of ASR errors and structured summaries with local LLMs through Ollama.',
        ],
        tags: ['agents', 'python'],
      },
      {
        id: 'cadwork',
        title: 'Python automation for Cadwork',
        tag: 'CAD · automation',
        meta: 'Research handbook · timber design',
        summary: 'Wrote a research-backed handbook for automating a timber-design and production workflow in Cadwork 3D with Python.',
        points: [
          'Maps the Cadwork Python API and its 2026 toolchain: Python 3.14 plugins and the move to Qt6.',
          'A staged roadmap: read-only model audits, attributes, lists and exports first; then drawings, BIM and batch processing; parametric geometry, joints and CNC last.',
          'Safeguards built in from the start: logging, dry runs, regression tests and human approval for engineering and fabrication decisions.',
        ],
        tags: ['python'],
      },
    ],
  },
  {
    id: 'quests',
    op: 'unembedding',
    kicker: 'Extracurricular',
    title: 'Side quests',
    span: '2018 → 2022',
    blurb: 'Hackathons, a stratospheric balloon, satellites, some quantum computing and a little theoretical physics.',
    items: [
      {
        id: 'qhack',
        title: 'QHack 2022',
        tag: '#29 / 800+',
        meta: 'Quantum computing hackathon · team lead',
        summary: 'Led team QSolutions to all 25 of 25 coding challenges and #29 out of 800+ teams worldwide.',
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
        summary: 'Co-led the undergraduate team that won CAN-SBX 2018, in my first year at UBC.',
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
        summary: 'Applied deep learning to satellite imagery to locate rice and wheat in Nepal during the growing season, for the UN World Food Programme.',
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
        summary: 'Solved quantum-computing competition challenges and prepared for the Qiskit developer exam, all in open notebooks.',
        points: [
          'Earned the IBM Certified Associate Developer certification in Quantum Computation using Qiskit.',
        ],
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
        points: [
          'Published in the International Journal of Geometric Methods in Modern Physics (World Scientific, 2020).',
        ],
        links: [{ label: 'Paper', href: 'https://www.worldscientific.com/doi/abs/10.1142/S0219887820500383' }],
        tags: [],
      },
      {
        id: 'club',
        title: 'Student Independent Research Club',
        tag: 'co-founder · UBC',
        meta: 'Academic leadership',
        summary: 'Co-founded UBC’s Student Independent Research Club.',
        points: [
          'Also a teaching assistant for undergraduate mathematics (MATH 116, Calculus I).',
        ],
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
  badges: ['Applied AI', 'Machine learning', 'Optimisation', 'Power & gas', 'Physics', 'Mathematics', 'ES · EN · FR'],
  rows: [
    { k: 'Profile', v: 'Applied AI / ML engineer and researcher, from research to production deployment.' },
    { k: 'Education', v: 'B.Sc. Physics & Mathematics, University of British Columbia (2018 – 2023). 96.2% cumulative average.' },
    { k: 'Experience', v: 'ML research at UBC’s DAIS & IDSL labs (2021 – 22), then QuantumBlack, AI by McKinsey (2023 → now) across power and gas trading, banking and telecom, now leading teams of 5+ data scientists.' },
    { k: 'Domain expertise', v: 'Power and gas trading and energy management: hydro scheduling and bidding into day-ahead, intraday and balancing markets; gas storage valuation (rolling intrinsic, LSMC) and delta hedging; gas logistics, network tariffs and cross-border capacity; forward curves and Monte Carlo price models.' },
    { k: 'Best at', v: 'Hard technical problems where you need to understand what is happening underneath the data, and a model that survives contact with the real system around it.' },
    { k: 'Languages', v: 'Spanish (native) · English (C2, bilingual) · French (B2).' },
    { k: 'Outside work', v: 'Off the clock I love building things, and I follow technology closely: AI above all, the startup world, and the wider story of scientific and human progress. I am into longevity, health, biohacking, hybrid athleticism and biotech, and I spend as much time as I can skiing, backpacking and climbing in the mountains. I carry a camera on those trips, and the gallery collects the best shots: summits, glaciers, ski tours and trails.', link: { label: 'open the gallery →', href: 'explore/' } },
  ],
  evals: [
    { bench: 'UBC graduating average', score: '96.2%', note: 'B.Sc. Physics & Mathematics' },
    { bench: 'Peer-reviewed publications', score: '5', note: 'ACS Synth. Bio. · IDA · IEEE SMC ×2 · IJGMMP' },
    { bench: 'High-school rank', score: '#1', note: 'top of my class' },
    { bench: 'Hands-on experience', score: '5+ yrs', note: 'ML · software development · analytics' },
  ],
  honors: [
    { label: 'UBC', items: [
      'Graduating Student Award in Physics & Mathematics',
      'International Student Faculty Award',
      'Deputy Vice-Chancellor Award for International Students',
      'International Major Entrance Scholarship',
      'Outstanding International Student Award',
    ] },
    { label: 'High school', items: [
      'Bronze medal, Spanish Physics Olympiad (local phase)',
      'First prize, Spanish Mathematics Olympiad (local phase)',
    ] },
    { label: 'Other', items: [
      'CAN-SBX 2018 winner, Canadian Space Agency',
    ] },
  ],
  certs: [
    { label: 'IBM Certified Associate Developer: Quantum Computation using Qiskit', href: 'https://www.credly.com/badges/2ffc6f20-d1fc-4ce0-ab66-ddfc0ada28f4' },
    { label: 'QHack 2022 Coding Challenges: completion certificate', href: 'assets/docs/qhack-2022-certificate.pdf' },
    { label: 'Deep Learning A-Z: Hands-On Artificial Neural Networks', href: 'https://www.udemy.com/certificate/UC-815f5a91-385f-4fa7-85c4-5b3367fbfca1/' },
    { label: 'Machine Learning A-Z: Hands-On Python & R in Data Science', href: 'https://www.udemy.com/certificate/UC-XFO8LZNT/' },
  ],
};

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
  { id: 'p0013', ar: 0.75, alt: 'Ibex on a rocky ridge under a blue sky' },
  { id: 'p0075', ar: 0.75, alt: 'Climber on a snowy slope below dark rock' },
  { id: 'p0083', ar: 0.75, alt: 'Snow-covered ridge under drifting cloud' },
  { id: 'p0471', ar: 0.75, alt: 'Driftwood on a quiet beach at dusk' },
  { id: 'p0815', ar: 0.75, alt: 'Limestone peaks above a green valley' },
  { id: 'p0894', ar: 0.75, alt: 'Hiker on a rocky ridge high in the mountains' },
  { id: 'p0983', ar: 0.75, alt: 'Sandstone pinnacle in the morning haze' },
  { id: 'p0989', ar: 0.75, alt: 'Solar eclipse watched from a rocky summit' },
  { id: 'p0995', ar: 0.75, alt: 'Hiker on a boulder field at golden hour' },
  { id: 'p1292', ar: 0.75, alt: 'Snowy firs below a white mountain' },
  { id: 'p1580', ar: 1.333, alt: 'Golden light on a snow-covered peak' },
  { id: 'p2135', ar: 0.75, alt: 'Red rock slope under a bright blue sky' },
  { id: 'p2227', ar: 0.75, alt: 'Tree frog on a large green leaf at night' },
  { id: 'p2384', ar: 0.75, alt: 'Wooden bench half buried in snow' },
  { id: 'p2456', ar: 0.75, alt: 'Cow grazing on an alpine pasture' },
  { id: 'p2485', ar: 0.75, alt: 'Cloud rolling over a grassy ridge' },
  { id: 'p2495', ar: 0.75, alt: 'Lone hiker on a trail facing distant peaks at sunset' },
  { id: 'p2527', ar: 0.75, alt: 'Small chapel in a meadow below jagged peaks' },
  { id: 'p2586', ar: 0.75, alt: 'Sunlit rock towers against a blue sky' },
  { id: 'p2603', ar: 0.75, alt: 'Sun over a small mountain lake' },
  { id: 'p2611', ar: 0.75, alt: 'Three jagged peaks seen from a rocky trail' },
  { id: 'p2616', ar: 0.75, alt: 'Three peaks framed by the window of an old tunnel' },
  { id: 'p2645', ar: 0.75, alt: 'Narrow trail along a green ridge' },
  { id: 'p2811', ar: 0.75, alt: 'Dark rock streaks on a snowfield' },
  { id: 'p2961', ar: 1.0, alt: 'Backpacker above a high mountain lake' },
  { id: 'p2998', ar: 1.333, alt: 'Sunlit cliffs above a forested valley' },
  { id: 'p3023', ar: 0.75, alt: 'Hiker standing on a rock spur above the clouds' },
  { id: 'p3213', ar: 0.75, alt: 'Mountain hut under rocky peaks' },
  { id: 'p3264', ar: 1.333, alt: 'Granite slabs and a rugged range' },
  { id: 'p3388', ar: 0.75, alt: 'Dark cliffs above a still lake' },
  { id: 'p4001', ar: 0.75, alt: 'Village below a pyramid-shaped peak' },
  { id: 'p4009', ar: 0.75, alt: 'Hiker above a long glacier' },
  { id: 'p4039', ar: 0.75, alt: 'Turquoise lake and waterfall below a cliff' },
  { id: 'p4071', ar: 0.75, alt: 'Hiker on a ridge above a turquoise lake' },
  { id: 'p4362', ar: 0.75, alt: 'Green forested hillside under clouds' },
  { id: 'p4502', ar: 0.75, alt: 'Sand dunes under a clear sky' },
  { id: 'p4528', ar: 0.75, alt: 'Sunset over a dune crest' },
  { id: 'p4564', ar: 0.75, alt: 'Climber resting on boulders above the clouds' },
  { id: 'p4641', ar: 0.75, alt: 'Palm-lined beach with turquoise water' },
  { id: 'p4666', ar: 0.75, alt: 'Sea cave in a limestone cliff' },
  { id: 'p4838', ar: 0.75, alt: 'Sunlight through a forest canopy' },
  { id: 'p4877', ar: 0.75, alt: 'Smoking volcano above the pines' },
  { id: 'p4937', ar: 0.75, alt: 'Hiker with a volcano behind' },
  { id: 'p4960', ar: 0.75, alt: 'Silhouette on a wooden stair above the clouds' },
  { id: 'p5246', ar: 0.75, alt: 'Palm tree and sunset over the sea' },
  { id: 'p5676', ar: 0.75, alt: 'Two hikers in rain jackets beside a glacier' },
  { id: 'p5725', ar: 0.75, alt: 'Cow grazing beside a mountain hut' },
  { id: 'p5767', ar: 0.75, alt: 'Rocky valley with a stream' },
  { id: 'p5794', ar: 0.75, alt: 'Suspension bridge across a gorge' },
  { id: 'p5850', ar: 0.75, alt: 'Green ridge above a turquoise lake' },
  { id: 'p5908', ar: 0.75, alt: 'Turquoise lake below snowy peaks' },
  { id: 'p5960', ar: 0.75, alt: 'Sea cliff dropping to deep blue water' },
  { id: 'p5965', ar: 0.75, alt: 'View out of a sea cave to a headland' },
  { id: 'p6454', ar: 0.75, alt: 'Pyramid-shaped peak above a snowfield' },
  { id: 'p6484', ar: 0.75, alt: 'Snowy ridge beside cable lines' },
  { id: 'p6772', ar: 0.75, alt: 'Wooden huts in a snowy valley' },
  { id: 'p6947', ar: 0.75, alt: 'Snow bowl below rocky summits' },
  { id: 'p7014', ar: 0.75, alt: 'Ski slope under a blue sky and white peaks' },
  { id: 'p7016', ar: 0.75, alt: 'Chairlift over a snowy slope' },
  { id: 'p7052', ar: 0.75, alt: 'Snowy peaks under a hazy sun' },
  { id: 'p7056', ar: 0.75, alt: 'Windswept snow ridge' },
  { id: 'p7175', ar: 0.75, alt: 'Chairlift against the low sun' },
  { id: 'p7186', ar: 0.75, alt: 'Pine forest on a snowy mountainside' },
  { id: 'p7204', ar: 0.75, alt: 'Skier crossing a wide snowy plateau' },
  { id: 'p7865', ar: 0.75, alt: 'Volcano erupting at night with hikers on the slope' },
  { id: 'p8083', ar: 0.75, alt: 'Two skiers in the snow' },
  { id: 'p8290', ar: 0.75, alt: 'Hiker waving from a ridge covered in yellow broom' },
  { id: 'p8651', ar: 0.75, alt: 'Two hikers on a grassy ridge toward a glacier peak' },
  { id: 'p8703', ar: 0.75, alt: 'Meadow and firs below a rock wall' },
  { id: 'p8934', ar: 0.75, alt: 'Turquoise lake beneath limestone cliffs' },
  { id: 'p9188', ar: 0.75, alt: 'Cow grazing on a green slope' },
  { id: 'p9218', ar: 0.75, alt: 'Warm light on a jagged peak at sunrise' },
  { id: 'p9968', ar: 0.75, alt: 'Rock pillar against the sunset' },
  { id: 'paccdca90', ar: 0.562, alt: 'Rocky peaks above a green slope' },
];
