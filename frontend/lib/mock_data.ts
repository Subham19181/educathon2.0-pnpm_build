/**
 * Mock data for demo: topics, lessons and quizzes.
 * Used to make the dashboard and quiz experience feel rich even without real data.
 */

export interface MockQuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface MockTopic {
  id: string;
  subject: string;
  title: string; // short title, e.g. "Physics: Kinematics"
  subtitle: string; // more specific focus
  duration: string;
  icon: string;
  color: string; // tailwind bg color class
  lesson: string; // pre-written lesson text
  quiz: MockQuizQuestion[];
}

export const MOCK_TOPICS: MockTopic[] = [
  {
    id: "physics-kinematics",
    subject: "Physics",
    title: "Physics: Kinematics",
    subtitle: "Motion in 1D",
    duration: "20 min warm-up",
    icon: "🔬",
    color: "bg-blue-500",
    lesson:
      "Kinematics is the branch of mechanics that describes how objects move without asking why they move.\n\n" +
      "Key ideas:\n" +
      "• Position (x) describes where an object is.\n" +
      "• Displacement (Δx) is the change in position, not the total path.\n" +
      "• Velocity (v) is displacement per unit time and has direction.\n" +
      "• Acceleration (a) is the rate of change of velocity.\n\n" +
      "For constant acceleration in 1D (like free fall), we use the SUVAT equations:\n" +
      "1. v = u + at\n" +
      "2. s = ut + 1/2 at²\n" +
      "3. v² = u² + 2as\n\n" +
      "Where u = initial velocity, v = final velocity, a = acceleration, t = time, s = displacement.",
    quiz: [
      {
        question: "Which quantity describes how fast and in what direction an object moves?",
        options: ["A. Speed", "B. Velocity", "C. Acceleration"],
        answer: "B. Velocity",
      },
      {
        question: "A car accelerates from rest at 2 m/s² for 5 s. What is its final velocity?",
        options: ["A. 2 m/s", "B. 5 m/s", "C. 10 m/s"],
        answer: "C. 10 m/s",
      },
      {
        question: "In kinematics, which equation relates v, u, a and s?",
        options: [
          "A. v = u + at",
          "B. s = ut + 1/2 at²",
          "C. v² = u² + 2as",
        ],
        answer: "C. v² = u² + 2as",
      },
    ],
  },
  {
    id: "chem-thermo",
    subject: "Chemistry",
    title: "Chemistry: Thermodynamics",
    subtitle: "Enthalpy & Spontaneity",
    duration: "25 min concept sprint",
    icon: "⚗️",
    color: "bg-green-500",
    lesson:
      "Chemical thermodynamics studies energy changes during reactions.\n\n" +
      "Enthalpy (ΔH) is the heat absorbed or released at constant pressure.\n" +
      "• ΔH < 0 → exothermic reaction (releases heat).\n" +
      "• ΔH > 0 → endothermic reaction (absorbs heat).\n\n" +
      "Spontaneity is determined by Gibbs free energy: ΔG = ΔH − TΔS.\n" +
      "• ΔG < 0 → spontaneous reaction.\n" +
      "• ΔG > 0 → non-spontaneous reaction.\n" +
      "• ΔG = 0 → equilibrium.",
    quiz: [
      {
        question: "For an exothermic reaction at constant pressure, ΔH is:",
        options: ["A. Positive", "B. Negative", "C. Zero"],
        answer: "B. Negative",
      },
      {
        question: "A reaction is spontaneous when:",
        options: [
          "A. ΔG < 0",
          "B. ΔH > 0",
          "C. ΔS < 0",
        ],
        answer: "A. ΔG < 0",
      },
      {
        question: "ΔG = ΔH − TΔS represents:",
        options: [
          "A. Arrhenius equation",
          "B. Gibbs free energy",
          "C. Ideal gas law",
        ],
        answer: "B. Gibbs free energy",
      },
    ],
  },
  {
    id: "bio-cell-division",
    subject: "Biology",
    title: "Biology: Cell Division",
    subtitle: "Mitosis basics",
    duration: "15 min revision",
    icon: "🧬",
    color: "bg-purple-500",
    lesson:
      "Cell division allows organisms to grow, repair tissues, and reproduce.\n\n" +
      "Mitosis produces two genetically identical daughter cells. It has four main stages (PMAT):\n" +
      "1. Prophase – chromosomes condense, nuclear envelope breaks down.\n" +
      "2. Metaphase – chromosomes align at the cell equator.\n" +
      "3. Anaphase – sister chromatids separate to opposite poles.\n" +
      "4. Telophase – nuclear envelopes reform, chromosomes decondense.\n\n" +
      "Cytokinesis then divides the cytoplasm, forming two cells.",
    quiz: [
      {
        question: "Mitosis results in:",
        options: [
          "A. Four haploid cells",
          "B. Two genetically identical diploid cells",
          "C. Two genetically different cells",
        ],
        answer: "B. Two genetically identical diploid cells",
      },
      {
        question: "During which stage do chromosomes line up at the equator?",
        options: ["A. Prophase", "B. Metaphase", "C. Anaphase"],
        answer: "B. Metaphase",
      },
      {
        question: "Separation of sister chromatids occurs in:",
        options: ["A. Anaphase", "B. Telophase", "C. Prophase"],
        answer: "A. Anaphase",
      },
    ],
  },
  {
    id: "math-integration",
    subject: "Mathematics",
    title: "Mathematics: Integration",
    subtitle: "Indefinite integrals",
    duration: "30 min practice",
    icon: "∫",
    color: "bg-orange-500",
    lesson:
      "Integration is the reverse process of differentiation. It can be thought of as 'adding up' infinitely many tiny quantities.\n\n" +
      "Basic rules:\n" +
      "• ∫ k dx = kx + C\n" +
      "• ∫ x^n dx = x^{n+1} / (n+1) + C, for n ≠ −1\n" +
      "• ∫ 1/x dx = ln|x| + C\n\n" +
      "Example: ∫ (3x^2 + 2) dx = x^3 + 2x + C.",
    quiz: [
      {
        question: "∫ x^2 dx equals:",
        options: ["A. x^3/3 + C", "B. 2x + C", "C. x^3 + C"],
        answer: "A. x^3/3 + C",
      },
      {
        question: "The integral of 1/x is:",
        options: [
          "A. x^2/2 + C",
          "B. ln|x| + C",
          "C. 1/(x^2) + C",
        ],
        answer: "B. ln|x| + C",
      },
      {
        question: "Integration is often interpreted as:",
        options: ["A. Slope", "B. Area under a curve", "C. Rate of change"],
        answer: "B. Area under a curve",
      },
    ],
  },
];
