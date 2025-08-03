// ********* Footer here mostly prepared settings *********

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-full flex items-center justify-center mb-6">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-500 to-transparent"></div>
          </div>
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <p className="text-base font-medium">
              <span className="text-gray-400">&copy; 2024</span>{" "}
              <span className="text-blue-400">Mert Topcu</span>{" "}
              <span className="text-gray-400">-</span>{" "}
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent font-semibold">
                NewMind AI
              </span>{" "}
              <span className="text-gray-400">- All rights reserved.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};