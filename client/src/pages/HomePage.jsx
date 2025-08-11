import { Link } from "react-router-dom";

function HomePage() {
  return (
    <section className=" flex justify-center items-center">
      <header className="bg-zinc-800 p-10">
        <h1 className="text-5xl py-2 font-bold">Barcodes manager</h1>
        <p>
          Choose Scanner to create new Asset or edit existing one. Choose
          Barcodes to create or print new barcod for Assets
        </p>
      </header>
    </section>
  );
}

export default HomePage;
