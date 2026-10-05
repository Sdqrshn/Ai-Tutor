import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGenerateFlashcards } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FlashcardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/2] skeleton rounded-2xl" />
    <div className="flex justify-center gap-4 mt-6">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton w-24 h-10 rounded-xl" />
      <div className="skeleton w-10 h-10 rounded-xl" />
    </div>
  </div>
);

const Flashcards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const noteId = location.state?.noteId as string | undefined;
  const { mutate: generateFlashcards, data: flashcards, isPending: isLoading } = useGenerateFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (noteId) {
      generateFlashcards(noteId, {
        onError: (error: any) => {
          toast({ title: "Failed to generate flashcards", description: error?.message || "Something went wrong", variant: "destructive" });
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

  const handleNext = () => {
    if (flashcards && currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 150);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 150);
    }
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const currentCard = flashcards?.[currentIndex];

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/summary")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Flashcards</h1>
            <p className="text-sm text-muted-foreground">
              {flashcards ? `${currentIndex + 1} of ${flashcards.length}` : "Loading..."}
            </p>
          </div>
        </div>

        {isLoading ? (
          <FlashcardSkeleton />
        ) : currentCard ? (
          <div className="animate-fade-in">
            <div className="progress-bar mb-6">
              <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / (flashcards?.length || 1)) * 100}%` }} />
            </div>

            <div className="flashcard" onClick={handleFlip}>
              <div className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}>
                <div className="flashcard-face flashcard-front">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Question</p>
                    <p className="text-lg font-medium text-foreground">{currentCard.front}</p>
                  </div>
                </div>
                <div className="flashcard-face flashcard-back">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary-foreground/70 mb-2">Answer</p>
                    <p className="text-lg font-medium">{currentCard.back}</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">Tap card to flip</p>

            <div className="flex items-center justify-center gap-4 mt-6">
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl" onClick={handlePrevious} disabled={currentIndex === 0}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" className="rounded-xl px-6" onClick={handleFlip}>
                <RotateCcw className="w-4 h-4 mr-2" />Flip
              </Button>
              <Button variant="outline" size="icon" className="w-12 h-12 rounded-xl" onClick={handleNext} disabled={currentIndex === (flashcards?.length || 1) - 1}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-1.5 mt-6">
              {flashcards?.map((_, index) => (
                <button key={index} onClick={() => { setIsFlipped(false); setCurrentIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary w-6" : "bg-muted-foreground/30"}`} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Flashcards;
