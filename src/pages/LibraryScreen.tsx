import HomeLayout from "../components/layouts/HomeLayout";

const LibraryScreen = () => {
  return (
    <HomeLayout>
      <div className="w-full h-full flex items-center justify-center mt-12">
        <section className="w-full flex justify-start items-center rounded-lg relative max-w-screen-xl p-12 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/auth-illustration.png')" }}
        >
          <div className="absolute inset-0 bg-black/70 rounded-lg"></div>
          <div className="relative z-10 flex flex-col gap-4 text-white">
            <h2 className="text-5xl font-extrabold">Library</h2>
            <p className="text-lg max-w-2xl">
              Experience the future of digital libraries where readers control
              the ecosystem. Borrow, lend, and discover books while earning
              rewards through our innovative blockchain system. Every page
              turned, every book shared transparently recorded forever.
            </p>
          </div>
        </section>
      </div>
    </HomeLayout>
  );
};

export default LibraryScreen;
