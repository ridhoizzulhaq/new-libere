import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo } from "react-icons/fa";

interface Event {
  title: string;
  date: string;
  time: string;
  mode: "online" | "offline";
  platform?: string;
  location?: string;
  description: string;
  bookTitle?: string;
}

interface Props {
  event: Event;
}

const EventCard = ({ event }: Props) => {
  return (
    <div className="w-full flex flex-col">
      {/* Book Ownership Badge */}
      {event.bookTitle && (
        <div className="mb-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-t-lg inline-block shadow-sm">
          <p className="text-xs font-semibold">
            Because you own "{event.bookTitle}"
          </p>
        </div>
      )}

      {/* Event Card */}
      <div className="group w-full flex flex-row gap-4 p-4 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-md transition-all duration-200 bg-white">
      {/* Left: Icon Section */}
      <div className="flex-shrink-0 w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-zinc-200 transition-colors">
        {event.mode === "online" ? (
          <FaVideo className="text-xl text-zinc-700" />
        ) : (
          <FaMapMarkerAlt className="text-xl text-zinc-700" />
        )}
      </div>

      {/* Right: Event Details */}
      <div className="flex-1 min-w-0">
        {/* Title and Mode */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-base font-semibold text-zinc-900 flex-1">
            {event.title}
          </h3>
          <div className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded text-xs font-medium text-zinc-700">
            {event.mode === "online" ? (
              <>
                <FaVideo className="text-xs" />
                <span>Online</span>
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="text-xs" />
                <span>Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Date and Time */}
        <div className="flex flex-wrap items-center gap-3 mb-2 text-sm text-zinc-600">
          <div className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-xs text-zinc-500" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FaClock className="text-xs text-zinc-500" />
            <span>{event.time}</span>
          </div>
        </div>

        {/* Location/Platform */}
        <div className="mb-2 text-sm text-zinc-600">
          {event.mode === "online" ? (
            <span className="font-medium">Platform: {event.platform}</span>
          ) : (
            <span className="font-medium">Location: {event.location}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-zinc-500 line-clamp-2">
          {event.description}
        </p>
      </div>
      </div>
    </div>
  );
};

export default EventCard;
