function HomePage() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">OJ Lite</h1>
          <p className="mt-2 text-gray-700">Practice coding problems and check your solutions.</p>
          <p className="mt-4">
            <a
              href="/problems"
              className="text-sm text-indigo-600 hover:underline"
            >
              View problems
            </a>
          </p>
        </div>
      </div>
    );
  }
  
  export default HomePage;  