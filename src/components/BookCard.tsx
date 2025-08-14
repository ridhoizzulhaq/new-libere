import { NavLink } from "react-router-dom";

const BookCard = ({ id, title, metadataUri, author }: Book) => {
  return (
    <li className="w-full">
      <NavLink
        to={`/books/${id}`}
        className="w-full flex flex-col items-center p-4 rounded-lg border border-zinc-200"
      >
        <div className="flex">
          <div className="w-full h-64">
            <img
              src={metadataUri}
              alt={title}
              className="w-full h-full object-cover rounded"
            />
          </div>
        </div>
        <div className="mt-4 w-full">
          <p className="line-clamp-1 text-base font-semibold">{title}</p>
          <p className="line-clamp-1 text-sm italic text-zinc-400">{author}</p>
        </div>
      </NavLink>
    </li>
  );
};

export default BookCard;
