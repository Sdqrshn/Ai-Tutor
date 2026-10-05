import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGenerateQuiz } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Trophy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuizSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="skeleton h-4 w-1/4" />
    <div className="skeleton h-6 w-full" />
    <div className="skeleton h-6 w-4/5" />
    <div className="space-y-3 mt-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="skeleton h-14 rounded-xl" />
      ))}
    </div>
  </div>
);

const Quiz = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const noteId = location.state?.noteId as string | undefined;
  const { mutate: generateQuiz, data: questions, isPending: isLoading } = useGenerateQuiz();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (noteId) {
      generateQuiz(noteId, {
        onError: (error: any) => {
          toast({ title: "Failed to generate quiz", description: error?.message || "Something went wrong", variant: "destructive" });
        },
      });
    }
  }, [noteId]);

  if (!noteId) {
    return (
      <div className="page-container safe-top safe-bottom">
        <div className="mobile-container text-center py-20">
          <p className="text-muted-foreground mb-4">No note selected. Upload material first.</p>
          <Button onClick={() => navigate("/upload")} className="rounded-xl">Upload Material</Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions?.[currentIndex];

  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswer === null) {
      setSelectedAnswer(optionIndex);
    }
  };

  const handleNext = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    if (!questions) return 0;
    return answers.filter(
      (answer, index) => answer === questions[index].correctIndex
    ).length;
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
  };

  const getOptionClassName = (optionIndex: number) => {
    if (selectedAnswer === null) return "quiz-option";
    const isCorrect = currentQuestion?.correctIndex === optionIndex;
    const isSelected = selectedAnswer === optionIndex;
    if (isCorrect) return "quiz-option correct";
    if (isSelected && !isCorrect) return "quiz-option incorrect";
    return "quiz-option opacity-50";
  };

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/summary")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Quiz</h1>
            <p className="text-sm text-muted-foreground">
              {showResults ? "Results" : questions ? `Question ${currentIndex + 1} of ${questions.length}` : "Loading..."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="card-elevated p-6"><QuizSkeleton /></div>
        ) : showResults ? (
          <div className="animate-fade-in">
            <div className="card-elevated p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Quiz Complete!</h2>
              <p className="text-muted-foreground mb-6">You scored {calculateScore()} out of {questions?.length}</p>

              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                    strokeDasharray={`${(calculateScore() / (questions?.length || 1)) * 352} 352`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">
                    {Math.round((calculateScore() / (questions?.length || 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-left">
                {questions?.map((q, index) => {
                  const isCorrect = answers[index] === q.correctIndex;
                  return (
                    <div key={q.id} className={`flex items-center gap-3 p-3 rounded-xl ${isCorrect ? "bg-success/10" : "bg-destructive/10"}`}>
                      {isCorrect ? <Check className="w-5 h-5 text-success" /> : <X className="w-5 h-5 text-destructive" />}
                      <span className="text-sm text-foreground truncate">Q{index + 1}: {q.question}</span>
                    </div>
                  );
                })}
              </div>

              <Button onClick={resetQuiz} className="w-full h-12 rounded-xl btn-gradient mt-6">
                <RotateCcw className="w-5 h-5 mr-2" />Try Again
              </Button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="animate-fade-in">
            <div className="progress-bar mb-6">
              <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / (questions?.length || 1)) * 100}%` }} />
            </div>

            <div className="card-elevated p-6 mb-6">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Question {currentIndex + 1}</p>
              <h2 className="text-lg font-medium text-foreground">{currentQuestion.question}</h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button key={index} onClick={() => handleSelectAnswer(index)} disabled={selectedAnswer !== null} className={getOptionClassName(index)}>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>

            {selectedAnswer !== null && (
              <div className="mt-6 animate-fade-in">
                <div className={`p-4 rounded-xl mb-4 ${selectedAnswer === currentQuestion.correctIndex ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {selectedAnswer === currentQuestion.correctIndex
                    ? "🎉 Correct! Great job!"
                    : `❌ The correct answer is: ${currentQuestion.options[currentQuestion.correctIndex]}`}
                </div>
                <Button onClick={handleNext} className="w-full h-12 rounded-xl btn-gradient">
                  {currentIndex < (questions?.length || 1) - 1 ? "Next Question" : "See Results"}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Quiz;