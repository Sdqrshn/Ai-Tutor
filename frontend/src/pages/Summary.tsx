import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Brain, MessageSquare, Layers, Lightbulb } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; 

const Summary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingSummary = location.state?.summary as {
    title: string;
    overview: string;
    keyPoints: string[];
    concepts: { term: string; definition: string }[];
  } | undefined;

  const incomingNoteId = location.state?.noteId as string | undefined;

  // Persist summary & noteId to sessionStorage
  if (incomingSummary) {
    sessionStorage.setItem("lastSummary", JSON.stringify(incomingSummary));
  }
  if (incomingNoteId) {
    sessionStorage.setItem("lastNoteId", incomingNoteId);
  }

  const summary = incomingSummary ?? (() => {
    try { return JSON.parse(sessionStorage.getItem("lastSummary") || "null"); } catch { return undefined; }
  })();
  const noteId = incomingNoteId ?? sessionStorage.getItem("lastNoteId") ?? undefined;

  if (!summary) {
    return (
      <div className="page-container safe-top safe-bottom">
        <div className="mobile-container text-center py-20">
          <p className="text-muted-foreground mb-4">No summary available. Upload material first.</p>
          <Button onClick={() => navigate("/upload")} className="rounded-xl">
            Upload Material
          </Button>
        </div>
      </div>
    );
  }

  const navigationCards = [
    {
      icon: Layers,
      title: "Flashcards",
      description: "Review key concepts",
      path: "/flashcards",
      state: { noteId },
      color: "bg-info/10 text-info",
    },
    {
      icon: Brain,
      title: "Take Quiz",
      description: "Test your knowledge",
      path: "/quiz",
      state: { noteId },
      color: "bg-accent/10 text-accent",
    }
  ];

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container pb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {summary.title}
            </h1>
            <p className="text-sm text-muted-foreground">AI-generated overview</p>
          </div>
        </div>

        {summary ? (  
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <Accordion type="multiple" defaultValue={["summary"]}>
              <AccordionItem
                value="summary"
                className="card-elevated px-6 border-0"
              >
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {summary.title}
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {summary.overview}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Key Points */}
            <Accordion type="multiple">
              <AccordionItem
                value="key-points"
                className="card-elevated px-6 border-0"
              >
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    Key Points
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <ul className="spac e-y-3">
                    {summary.keyPoints.map((point, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Key Concepts */}
            <Accordion type="multiple">
              <AccordionItem
                value="key-concepts"
                className="card-elevated px-6 border-0"
              >
                <AccordionTrigger>
                  <span className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Key Concepts
                  </span>
                </AccordionTrigger>

                <AccordionContent>
                  <div className="space-y-4">
                    {summary.concepts.map((concept, index) => (
                      <div
                        key={index}
                        className="border-l-2 border-primary/30 pl-4"
                      >
                        <h4 className="font-medium text-foreground">
                          {concept.term}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {concept.definition}
                        </p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Navigation Cards */}
            <div className="space-y-3">
              {navigationCards.map((card) => (
                <button
                  key={card.path}
                  onClick={() => navigate(card.path, { state: (card as any).state })}
                  className="card-interactive p-4 flex items-center gap-4 w-full text-left"
                >
                  <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{card.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <Button
        onClick={() => navigate("/chat", { state: { noteId } })}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg btn-gradient p-0"
        aria-label="Open Study Chat"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Summary;
