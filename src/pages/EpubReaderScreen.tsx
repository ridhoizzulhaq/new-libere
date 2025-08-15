import { useParams } from "react-router-dom";
import { ReactReader } from "react-reader";
import { useState } from "react";

const EpubReaderScreen = () => {
  const { epub } = useParams();
  const [location, setLocation] = useState<string | number>(0);

  console.log("epub", epub);

  return (
    <div style={{ height: "100vh" }}>
      <ReactReader
        url="https://react-reader.metabits.no/files/alice.epub"
        location={location}
        locationChanged={(epubcfi: string) => setLocation(epubcfi)}
      />
    </div>
  );
};

export default EpubReaderScreen;
