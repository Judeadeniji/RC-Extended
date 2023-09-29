import { useNavigate } from "react-router-dom";


function Header() {
  const navigate = useNavigate();
  
  return (
    <header className="dark:bg-black dark:text-white w-full z-10 fixed h-[55px] bg-white bg-opacity-40 backdrop-blur-xl border-b">
      <div className="py-2 container flex justify-between items-center mx-auto w-full h-full px-3">
        <h1 className="text-xl font-bold">RMDB</h1>
        <button onClick={() => navigate("/all")} className="transition-all duration-200 text-white rounded font-semibold hover:shadow-md hover:shadow-green-200 bg-gradient-to-r from-green-400 to-green-700 py-2 px-4">
          Browse
        </button>
      </div>
    </header>
  )
}

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="w-full select-none overflow-hidden dark:bg-black">
      <Header />
      <div className="w-full mt-28 flex flex-col md:flex-row gap-y-9 md:gap-0 md:px-6">
        <section className="relative p-3 md:w-1/2 m-0">
          <div className="flex top-0 flex-col w-full h-full text-center md:text-left">
          <h1 className="font-cal dark:text-white text-6xl md:text-7xl font-bold leading-[59px]">
            Welcome  To The {" "}
            <span className="bg-clip-text bg-gradient-to-r from-[#051b24]
            text-transparent to-green-600">
              Rick & Morty
            </span>
              {" "} Database 
          </h1>
          <p className="text-md font-semibold dark:text-[#ccc] space-x-1 mt-3 text-gray-600">
            A database with over 800 characters.
          </p>
          <div className="my-3 mx-auto w-80 h-56">
            <img loading="lazy" className="h-full w-full -z-40 -mt-12 object-center" src="/hero-image.png" />
          </div>
        <div className="-z-50 blur-2xl absolute -right-36 -top-16 h-72 w-72 rounded-r-full rounded-l-2xl bg-gradient-to-bl from-green-50 to-blue-200" />

        </div>
        </section>
        <section className="w-full relative grid place-content-center h-full md:w-1/2 m-0">
          <div className="h-72 -z-50 absolute rounded-full w-72 m-auto bg-gradient-to-bl md:left-0 -left-20 -top-28 from-green-100 via-blue-100 via-pink-100 to-transparent blur-lg" />
          <div className="self-center justify-self-center mx-auto mt-4 my-4 flex gap-x-3">
          <button onClick={() => navigate("/all")} className="text-white rounded font-semibold hover:shadow-md hover:shadow-green-200 bg-gradient-to-r from-black to-green-600 py-2 px-5">
            Enter App
          </button>
          <button className="text-transparent rounded font-semibold border
          border-pink-500 bg-clip-text bg-gradient-to-r from-[#051b24]
            text-transparent to-pink-600 py-2 px-4">
            Learn More
          </button>
          </div>
        </section>
      </div>
    </main>
  )
}