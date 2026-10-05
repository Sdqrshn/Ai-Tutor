// Mock data and simulated API functions for AI Tutor

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Summary {
  title: string;
  overview: string;
  keyPoints: string[];
  concepts: { term: string; definition: string }[];
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Mock Summary Data
// const mockSummary: Summary = {
//   title: "Introduction to Machine Learning",
//   overview: "Machine Learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. This study material covers the fundamental concepts, algorithms, and applications of ML in modern technology.",
//   keyPoints: [
//     "Machine Learning automates analytical model building using algorithms",
//     "Three main types: Supervised, Unsupervised, and Reinforcement Learning",
//     "Key algorithms include Linear Regression, Decision Trees, and Neural Networks",
//     "Data preprocessing is crucial for model accuracy",
//     "Model evaluation metrics help assess performance",
//     "Real-world applications span healthcare, finance, and autonomous systems"
//   ],
//   concepts: [
//     {
//       term: "Supervised Learning",
//       definition: "A type of ML where the model learns from labeled training data to make predictions on new, unseen data."
//     },
//     {
//       term: "Neural Networks",
//       definition: "Computing systems inspired by biological neural networks that can learn to perform tasks by considering examples."
//     },
//     {
//       term: "Overfitting",
//       definition: "When a model learns the training data too well, including noise, resulting in poor performance on new data."
//     },
//     {
//       term: "Feature Engineering",
//       definition: "The process of selecting and transforming variables to improve model performance."
//     }
//   ]
// };

// // Mock Flashcards Data
// const mockFlashcards: Flashcard[] = [
//   {
//     id: "1",
//     front: "What is Machine Learning?",
//     back: "A subset of AI that enables systems to automatically learn and improve from experience without being explicitly programmed."
//   },
//   {
//     id: "2",
//     front: "What are the three main types of Machine Learning?",
//     back: "Supervised Learning, Unsupervised Learning, and Reinforcement Learning."
//   },
//   {
//     id: "3",
//     front: "What is Supervised Learning?",
//     back: "A type of ML where the algorithm learns from labeled training data to make predictions on new, unseen data."
//   },
//   {
//     id: "4",
//     front: "What is Overfitting?",
//     back: "When a model learns the training data too well, including noise and outliers, causing poor performance on new data."
//   },
//   {
//     id: "5",
//     front: "What is a Neural Network?",
//     back: "A computing system inspired by biological neural networks, consisting of interconnected nodes that process information."
//   },
//   {
//     id: "6",
//     front: "What is Feature Engineering?",
//     back: "The process of using domain knowledge to select, modify, or create features that make machine learning algorithms work better."
//   },
//   {
//     id: "7",
//     front: "What is Cross-Validation?",
//     back: "A technique for evaluating ML models by training on subsets of data and testing on the remaining portion."
//   },
//   {
//     id: "8",
//     front: "What is Gradient Descent?",
//     back: "An optimization algorithm used to minimize the loss function by iteratively moving towards the minimum."
//   }
// ];

// // Mock Quiz Data
// const mockQuizQuestions: QuizQuestion[] = [
//   {
//     id: "1",
//     question: "Which type of learning uses labeled data for training?",
//     options: ["Unsupervised Learning", "Supervised Learning", "Reinforcement Learning", "Transfer Learning"],
//     correctIndex: 1
//   },
//   {
//     id: "2",
//     question: "What is the main goal of Machine Learning?",
//     options: [
//       "To replace all human jobs",
//       "To enable computers to learn from data without explicit programming",
//       "To create sentient AI",
//       "To store large amounts of data"
//     ],
//     correctIndex: 1
//   },
//   {
//     id: "3",
//     question: "What happens when a model overfits?",
//     options: [
//       "It performs well on both training and test data",
//       "It fails to learn any patterns",
//       "It learns training data too well, including noise",
//       "It becomes faster at processing"
//     ],
//     correctIndex: 2
//   },
//   {
//     id: "4",
//     question: "Which algorithm is commonly used for classification tasks?",
//     options: ["Linear Regression", "K-Means Clustering", "Decision Trees", "Principal Component Analysis"],
//     correctIndex: 2
//   },
//   {
//     id: "5",
//     question: "What is the purpose of a validation set?",
//     options: [
//       "To train the model",
//       "To tune hyperparameters and prevent overfitting",
//       "To store the final model",
//       "To visualize data"
//     ],
//     correctIndex: 1
//   }
// ];



// API Functions

// export async function mockLogin(email: string, password: string): Promise<User> {
//   await delay(1500);
//   // Accept any credentials for demo
//   return {
//     id: "user-1",
//     name: email.split("@")[0],
//     email: email
//   };
// }

// export async function mockSignup(name: string, email: string, password: string): Promise<User> {
//   await delay(1800);
//   return {
//     id: "user-1",
//     name: name,
//     email: email
//   };
// }

// export async function mockUploadMaterial(file: File | null, text: string | null): Promise<{ success: boolean }> {
//   // Simulate processing steps
//   await delay(2500);
//   return { success: true };
// }

// export async function fetchSummary(): Promise<Summary> {
//   await delay(1800);
//   return mockSummary;
// }

// export async function fetchFlashcards(): Promise<Flashcard[]> {
//   await delay(1500);
//   return mockFlashcards;
// }

// export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
//   await delay(1600);
//   return mockQuizQuestions;
// }

