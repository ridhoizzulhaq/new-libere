export interface EventTemplate {
  title: string;
  date: string;
  time: string;
  mode: "online" | "offline";
  platform?: string;
  location?: string;
  description: string;
}

export const eventTemplates: EventTemplate[] = [
  {
    title: "Author Q&A Session",
    date: "December 20, 2025",
    time: "14:00 - 16:00 WIB",
    mode: "online" as const,
    platform: "Zoom",
    description: "Join us for an interactive session with the author. Ask questions about the book, writing process, and get exclusive insights.",
  },
  {
    title: "Book Club Discussion",
    date: "January 10, 2026",
    time: "18:00 - 20:00 WIB",
    mode: "offline" as const,
    location: "Jakarta, Indonesia",
    description: "Deep dive discussion about the book's themes and characters. Connect with fellow readers and share your perspectives.",
  },
  {
    title: "Writing Workshop",
    date: "January 25, 2026",
    time: "10:00 - 13:00 WIB",
    mode: "online" as const,
    platform: "Google Meet",
    description: "Learn writing techniques from the author. Get hands-on practice and personalized feedback on your writing.",
  },
];
