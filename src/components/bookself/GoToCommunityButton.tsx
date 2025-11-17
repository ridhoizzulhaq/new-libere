import { useState } from "react";
import { FaWhatsapp, FaTimes } from "react-icons/fa";
import { eventTemplates } from "../../core/constants/events";
import EventCard from "./EventCard";

interface Props {
  book: Book;
}

const WHATSAPP_LINK = "https://chat.whatsapp.com/Gfw9o8xR0hTHiF9jRFQBZ5";

const GoToCommunityButton = ({ book }: Props) => {
  const [showModal, setShowModal] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Map events to the clicked book
  const events = eventTemplates.map((template) => ({
    ...template,
    bookTitle: book.title,
  }));

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="cursor-pointer flex flex-row gap-1.5 justify-center items-center w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-2.5 py-1.5 rounded text-xs font-medium transition-colors"
      >
        Go to Community
      </button>

      {/* Community Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Close Button */}
            <div className="sticky top-0 bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h3 className="text-xl font-semibold text-zinc-900">
                Community Access
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-zinc-500 hover:text-zinc-700 transition-colors"
                aria-label="Close modal"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* WhatsApp Community Section */}
              <div>
                <h4 className="text-lg font-semibold text-zinc-900 mb-3">
                  Join WhatsApp Community
                </h4>
                <p className="text-sm text-zinc-600 mb-4">
                  Connect with other readers and the author in our exclusive WhatsApp community.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-lg font-medium transition-colors"
                >
                  <FaWhatsapp className="text-xl" />
                  <span>Join WhatsApp Group</span>
                </a>
              </div>

              {/* Events Section */}
              {events.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-zinc-900 mb-3">
                    Exclusive Events
                  </h4>
                  <p className="text-sm text-zinc-600 mb-4">
                    Because you own "{book.title}", you're invited to these exclusive events:
                  </p>
                  <div className="space-y-4">
                    {events.map((event, index) => (
                      <div key={index}>
                        <EventCard event={event} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoToCommunityButton;
