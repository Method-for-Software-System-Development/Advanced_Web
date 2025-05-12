import React from "react";


const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center 
                    bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 p-8 gap-6">
      {/*Test1*/}
      <h1 className="text-6xl font-extrabold text-white drop-shadow-lg animate-bounce">
        Welcome to Pet Clinic!
      </h1>

      {/*Test2*/}
      <p className="text-xl text-white/80 hover:text-yellow-200 transition-colors">
        Look at this colourful gradient &amp; hover effects 👀
      </p>

      {/* Test3*/}
      <button className="bg-teal-400 hover:bg-teal-600 active:bg-teal-700
                         text-white font-semibold py-3 px-8 rounded-xl
                         shadow-lg hover:shadow-2xl transition 
                         duration-300 ease-out hover:scale-110">
        Click Me if you like Kayo!
      </button>
    </div>
  );
};

export default Home;
