import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadMaterial } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, FileText, Loader2, Check, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UploadMaterial = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mode, setMode] = useState<"upload" | "text">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [processingStep, setProcessingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadMaterial();

  const processingSteps = [
    "Uploading content...",
    "Analyzing structure...",
    "Extracting key concepts...",
    "Generating study materials...",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    // Simulate processing steps
    setProcessingStep(0);
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < processingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 600);

    try {
      // Persist raw text for AI chat
      if (mode === "text" && text) {
        sessionStorage.setItem("lastRawText", text);
      }
      const result = await uploadMutation.mutateAsync({
        file: mode === "upload" ? file : null,
        text: mode === "text" ? text : null,
      });
      clearInterval(stepInterval);
      navigate("/summary", { state: { noteId: result.note_id, summary: result.summary } });
    } catch (error: any) {
      clearInterval(stepInterval);
      toast({
        title: "Upload failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isValid = mode === "upload" ? file !== null : text.trim().length > 50;

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container">
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
            <h1 className="text-xl font-bold text-foreground">Upload Material</h1>
            <p className="text-sm text-muted-foreground">Add your study content</p>
          </div>
        </div>

        {/* Processing State */}
        {uploadMutation.isPending ? (
          <div className="card-elevated p-8 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Processing Your Content
            </h2>
            <div className="space-y-3">
              {processingSteps.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 text-sm ${
                    index <= processingStep
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {index < processingStep ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : index === processingStep ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl mb-8">
              <button
                onClick={() => setMode("upload")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "upload"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload PDF
              </button>
              <button
                onClick={() => setMode("text")}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  mode === "text"
                    ? "bg-card text-foreground shadow-soft"
                    : "text-muted-foreground"
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Paste Text
              </button>
            </div>

            {/* Upload Area */}
            {mode === "upload" ? (
              <div className="card-elevated p-6 animate-fade-in">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                />
                
                {file ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-success" />
                    </div>
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-medium text-foreground">
                      Tap to upload PDF
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or drag and drop
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="card-elevated p-6 animate-fade-in">
                <Textarea
                  placeholder="Paste your study material here... (minimum 50 characters)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[200px] rounded-xl resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2 text-right">
                  {text.length} characters
                </p>
              </div>
            )}

            {/* AI Hint */}
            <div className="flex items-start gap-3 mt-6 p-4 bg-primary/5 rounded-xl">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Our AI will analyze your content and generate summaries, flashcards, 
                and quiz questions to help you learn effectively.
              </p>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid}
              className="w-full h-12 rounded-xl btn-gradient mt-6"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Study Materials
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadMaterial;
