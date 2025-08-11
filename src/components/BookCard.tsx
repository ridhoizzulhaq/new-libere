const BookCard = ({ id, title, genre, coverUrl }: Book) => {
  return (
    <li className="w-full">
      <a
        href={`/books/${id}`}
        className="w-full flex flex-col items-center p-4 rounded-lg shadow"
      >
        <div className="text-center hidden lg:flex">
          <div className="w-full h-64 ">
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4 w-full">
          <p className="line-clamp-1 text-base font-semibold  xs:text-xl">
            {title}
          </p>
          <p className="mt-1 line-clamp-1 text-sm italic  xs:text-base">
            {genre}
          </p>
        </div>
      </a>
    </li>
  );
};

export default BookCard;
