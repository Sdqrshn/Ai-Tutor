import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, BASE_URL } from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

// Auth types
interface AuthResponse {
  message: string;
  access_token: string;
  token_type: string;
}

interface ProfileResponse {
  id: string;
  name: string;
  email: string;
}

interface SummaryData {
  title: string;
  overview: string;
  keyPoints: string[];
  concepts: { term: string; definition: string }[];
}

interface UploadResponse {
  note_id: string;
  summary: SummaryData;
}

// Auth hooks
export function useLogin() {
  const { setAuth } = useAuth();
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const data = await apiClient<AuthResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setAuth(data.access_token);
      return data;
    },
  });
}

export function useSignup() {
  const { setAuth } = useAuth();
  return useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      const data = await apiClient<AuthResponse>("/auth/signup", {
        method: "POST",
        body: { name, email, password },
      });
      setAuth(data.access_token);
      return data;
    },
  });
}

// Profile hook
export function useProfile() {
  const { token, setUser } = useAuth();
  return useQuery({
    queryKey: ["profile", token],
    queryFn: async () => {
      const data = await apiClient<ProfileResponse>("/profile/profile", { token });
      setUser(data);
      return data;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });
}

// Notes history types
interface NoteHistory {
  _id: string;
  title: string;
  source_type: string;
  summary: {
    title: string;
    overview: string;
    keyPoints: string[];
    concepts: { term: string; definition: string }[];
  };
  created_at: string;
}

// Notes history hook
export function useNotesHistory() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["notes-history", token],
    queryFn: async () => {
      const data = await apiClient<NoteHistory[]>("/profile/notes-history", { token });
      return data;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}
//Delete Note
export function useDeleteNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      return apiClient(`/profile/notes/${noteId}`, {
        method: "DELETE",
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes-history", token],
      });
    },
  });
}

//Rename Notes
export function useRenameNote() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noteId,
      title,
    }: {
      noteId: string;
      title: string;
    }) => {
      return apiClient(`/profile/notes/${noteId}?title=${encodeURIComponent(title)}`, {
        method: "PATCH",
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes-history", token],
      });
    },
  });
}

// Upload hook
export function useUploadMaterial() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, text }: { file: File | null; text: string | null }): Promise<UploadResponse> => {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (text) formData.append("text", text);

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/ai/generate-summary`, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Something went wrong" }));
        throw new Error(error.detail || "Upload failed");
      }

      return res.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notes-history", token],
      });
    },
  });
}

export function useGenerateFlashcards() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const data = await apiClient<{ id: string; front: string; back: string }[]>(
        `/ai/${noteId}/flashcards`,
        { method: "POST", token }
      );
      return data;
    },
  });
}

export function useGenerateQuiz() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const data = await apiClient<{ id: string; question: string; options: string[]; correctIndex: number }[]>(
        `/ai/${noteId}/quiz`,
        { method: "POST", token }
      );
      return data;
    },
  });
}

// Mock Exam types
interface MockExamMCQ {
  id: string;
  question: string;
  options: string[];
  answer: string;
}

interface MockExamOpenQuestion {
  id: string;
  question: string;
}

interface MockExamSection {
  section: string;
  questions: (MockExamMCQ | MockExamOpenQuestion)[];
}

export interface MockExamResponse {
  title: string;
  sections: MockExamSection[];
}

// Mock Exam hook
export function useGenerateMockExam() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async (noteIds: string[]) => {
      const data = await apiClient<MockExamResponse>("/ai/generate-mock-exam", {
        method: "POST",
        token,
        body: { note_ids: noteIds },
      });
      return data;
    },
  });
}

// Chat hook
export function useSendMessage() {
  const { token } = useAuth();
  return useMutation({
    mutationFn: async ({
      noteId,
      messages,
      newMessage,
    }: {
      noteId: string;
      messages: { role: string; content: string }[];
      newMessage: string;
    }) => {
      const data = await apiClient<{ reply: string }>(`/ai/${noteId}/chat`, {
        method: "POST",
        token,
        body: {
          note_id: noteId,
          messages,
          new_message: newMessage,
        },
      });
      return data.reply;
    },
  });
}
