import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, BookOpen, Brain, MessageSquare, Sparkles, LogOut, User, FileText, Clock, Upload, ClipboardList, X, Loader2, Trash2, Pencil } from "lucide-react";
import { useProfile, useNotesHistory, useGenerateMockExam, useDeleteNote, useRenameNote } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { isLoading } = useProfile();
  const { data: notes, isLoading: notesLoading } = useNotesHistory();
  const generateMockExam = useGenerateMockExam();
  const deleteNote = useDeleteNote();
  const renameNote = useRenameNote();
  const { toast } = useToast();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  const [renamingNoteId, setRenamingNoteId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNoteClick = (note: any) => {
    if (selectMode) {
      toggleNoteSelection(note._id);
      return;
    }
    navigate("/summary", {
      state: { noteId: note._id, summary: note.summary },
    });
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const handleCancelSelect = () => {
    setSelectMode(false);
    setSelectedNotes(new Set());
  };

  const handleGenerateExam = () => {
    if (selectedNotes.size === 0) {
      toast({ title: "Select at least one note", variant: "destructive" });
      return;
    }
    generateMockExam.mutate(Array.from(selectedNotes), {
      onSuccess: (exam) => {
        setSelectMode(false);
        setSelectedNotes(new Set());
        navigate("/mock-exam", { state: { exam } });
      },
      onError: (error) => {
        toast({ title: "Failed to generate exam", description: error.message, variant: "destructive" });
      },
    });
  };

  const features = [
    { icon: BookOpen, title: "Smart Summaries", description: "AI-generated summaries of your study materials" },
    { icon: Brain, title: "Flashcards", description: "Interactive flashcards for effective memorization" },
    { icon: MessageSquare, title: "AI Tutor Chat", description: "Ask questions and get instant explanations" },
  ];

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container">
        {/* Profile Bar */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            {isLoading ? (
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            ) : (
              <div>
                <p className="font-medium text-foreground text-sm">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Logout">
            <LogOut className="w-5 h-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-glow animate-bounce-subtle">
            <GraduationCap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Tutor</h1>
          <p className="text-muted-foreground">Your intelligent study companion powered by AI</p>
        </div>

        {/* Hero Section */}
        <div className="card-elevated p-6 mb-8 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Ready to learn?</h2>
              <p className="text-sm text-muted-foreground mt-1">Upload your study material and let AI help you master any subject</p>
            </div>
          </div>
          <Button onClick={() => navigate("/upload")} className="w-full h-12 rounded-xl btn-gradient">
            <BookOpen className="w-5 h-5 mr-2" />
            Start Learning
          </Button>
        </div>

        {/* Notes History */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Your Notes</h3>
            <div className="flex items-center gap-1">
              {!selectMode && notes && notes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-auto py-1 px-2"
                  onClick={() => setSelectMode(true)}
                >
                  <ClipboardList className="w-3.5 h-3.5 mr-1" />
                  Mock Exam
                </Button>
              )}
              {selectMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground h-auto py-1 px-2"
                  onClick={handleCancelSelect}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary h-auto py-1 px-2"
                onClick={() => navigate("/upload")}
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                New
              </Button>
            </div>
          </div>

          {/* Selection action bar */}
          {selectMode && (
            <div className="card-elevated p-3 mb-3 flex items-center justify-between rounded-xl">
              <p className="text-xs text-muted-foreground">
                {selectedNotes.size === 0 ? "Select notes for mock exam" : `${selectedNotes.size} note${selectedNotes.size > 1 ? "s" : ""} selected`}
              </p>
              <Button
                size="sm"
                className="btn-gradient rounded-lg text-xs h-8"
                onClick={handleGenerateExam}
                disabled={selectedNotes.size === 0 || generateMockExam.isPending}
              >
                {generateMockExam.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Exam"
                )}
              </Button>
            </div>
          )}

          {notesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elevated p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note._id}
                  onClick={() => handleNoteClick(note)}
                  className={`card-interactive p-4 flex items-start gap-3 w-full text-left transition-all ${
                    selectMode && selectedNotes.has(note._id) ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                >
                  {selectMode && (
                    <div className="flex items-center justify-center pt-1">
                      <Checkbox
                        checked={selectedNotes.has(note._id)}
                        onCheckedChange={() => toggleNoteSelection(note._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {renamingNoteId === note._id ? (
                      <div
                        className="flex items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Input
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (renameValue.trim()) {
                              renameNote.mutate({
                                noteId: note._id,
                                title: renameValue.trim(),
                              });
                              setRenamingNoteId(null);
                            }
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    ) : (
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {note.title || note.summary?.title}
                      </h4>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{note.summary?.overview}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {note.source_type === "pdf" ? "PDF" : "Text"}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingNoteId(note._id);
                      setRenameValue(note.summary?.title || note.title || "");
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote.mutate(note._id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevated p-6 text-center">
              <p className="text-sm text-muted-foreground">No notes yet. Upload your first study material to get started!</p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">What you can do</h3>
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-interactive p-4 flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
};

export default Dashboard;
