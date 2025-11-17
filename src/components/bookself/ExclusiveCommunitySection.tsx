import EventCard from "./EventCard";
import { eventTemplates } from "../../core/constants/events";

interface Props {
  books: Book[];
}

const ExclusiveCommunitySection = ({ books }: Props) => {
  // Take first 3 books from bookshelf for events

  // Map events to books (take first 3 books)
  const events = eventTemplates.map((template, index) => ({
    ...template,
    bookTitle: books[index]?.title || "Unknown Book",
  }));
  return (
    <section className="w-full mt-10">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-zinc-900 mb-2">
          Exclusive Community
        </h2>
        <div className="max-w-3xl">
          <p className="text-sm text-zinc-700">
            This feature gives special access to private events that are only available for people who bought the ebook directly from us. We can confirm this because the ebook is issued as a unique digital item on blockchain.
          </p>
        </div>
      </div>

      {/* Events List - Horizontal Scroll */}
      <div className="w-full overflow-x-auto pb-4 -mx-6 px-6">
        <div className="flex gap-4 snap-x snap-mandatory">
          {events.map((event, index) => (
            <div key={index} className="flex-shrink-0 w-[350px] sm:w-[400px] lg:w-[450px] snap-start">
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExclusiveCommunitySection;
