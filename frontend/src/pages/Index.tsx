import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Brain, MessageSquare } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="page-container-centered safe-top safe-bottom">
      <div className="mobile-container text-center">
        {/* Hero */}
        <div className="mb-12 animate-fade-in-up">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-glow animate-bounce-subtle">
            <GraduationCap className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">
            AI Tutor
          </h1>
          <p className="text-lg text-muted-foreground max-w-xs mx-auto">
            Your intelligent study companion powered by artificial intelligence
          </p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: BookOpen, label: "Summaries" },
            { icon: Brain, label: "Flashcards" },
            { icon: MessageSquare, label: "AI Chat" },
          ].map((feature, index) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-2 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Button
            onClick={() => navigate("/login")}
            className="w-full h-14 rounded-xl btn-gradient text-base"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button
            onClick={() => navigate("/signup")}
            variant="outline"
            className="w-full h-14 rounded-xl text-base border-2"
          >
            Create Account
          </Button>
        </div>

        {/* AI badge */}
        <div className="flex items-center justify-center gap-2 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Powered by AI</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
