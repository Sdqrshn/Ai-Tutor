import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useRef } from "react";
import type { MockExamResponse } from "@/hooks/useApi";

const MockExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);
  const exam = location.state?.exam as MockExamResponse | undefined;

  if (!exam) {
    return (
      <div className="page-container safe-top safe-bottom">
        <div className="mobile-container text-center py-20">
          <p className="text-muted-foreground">No exam data found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${exam.title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; padding: 40px; line-height: 1.6; }
          .exam-title { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 8px; }
          .exam-subtitle { font-size: 13px; text-align: center; color: #666; margin-bottom: 32px; border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; }
          .section-title { font-size: 18px; font-weight: bold; margin: 28px 0 16px; padding-bottom: 6px; border-bottom: 1px solid #ccc; }
          .question { margin-bottom: 20px; }
          .question-text { font-size: 14px; font-weight: 500; margin-bottom: 8px; }
          .options { list-style: none; padding-left: 8px; }
          .options li { font-size: 13px; margin-bottom: 4px; padding: 4px 0; }
          .answer-line { border-bottom: 1px solid #ccc; height: 28px; margin: 4px 0; }
          .long-answer-space { height: 120px; border: 1px solid #ddd; border-radius: 4px; margin-top: 8px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="exam-title">${exam.title}</div>
        <div class="exam-subtitle">Generated from your study notes</div>
        ${exam.sections.map(section => `
          <div class="section-title">Section: ${section.section}</div>
          ${section.questions.map((q, i) => `
            <div class="question">
              <div class="question-text">${i + 1}. ${'question' in q ? q.question : ''}</div>
              ${'options' in q && (q as any).options ? `
                <ul class="options">
                  ${(q as any).options.map((opt: string) => `<li>${opt}</li>`).join('')}
                </ul>
              ` : section.section === 'Long Answer' ? `
                <div class="long-answer-space"></div>
              ` : `
                <div class="answer-line"></div>
                <div class="answer-line"></div>
                <div class="answer-line"></div>
              `}
            </div>
          `).join('')}
        `).join('')}
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  return (
    <div className="page-container safe-top safe-bottom">
      <div className="mobile-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Dashboard</span>
          </button>
          <Button onClick={handleDownloadPDF} size="sm" className="btn-gradient rounded-xl">
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
        </div>

        {/* Exam Content */}
        <div ref={printRef}>
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{exam.title}</h1>
            <p className="text-sm text-muted-foreground">Generated from your study notes</p>
          </div>

          <div className="space-y-8">
            {exam.sections.map((section, sIdx) => (
              <div key={sIdx}>
                <h2 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                  Section: {section.section}
                </h2>
                <div className="space-y-5">
                  {section.questions.map((q, qIdx) => (
                    <div key={q.id || qIdx} className="card-elevated p-4 rounded-xl">
                      <p className="font-medium text-foreground text-sm mb-3">
                        {qIdx + 1}. {q.question}
                      </p>
                      {'options' in q && (q as any).options ? (
                        <div className="space-y-2 pl-2">
                          {(q as any).options.map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="text-sm text-muted-foreground py-1">
                              {opt}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border border-dashed border-border rounded-lg p-3 mt-2">
                          <p className="text-xs text-muted-foreground italic">
                            {section.section === 'Long Answer' ? 'Write your detailed answer here...' : 'Write your answer here...'}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
};

export default MockExam;
