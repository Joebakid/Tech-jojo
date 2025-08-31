import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-7xl font-bold text-gray-800">404</h1>
      <p className="mt-4 text-xl font-medium text-gray-600">
        Page Not Found :(
      </p>
      <p className="mt-2 text-sm text-gray-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  );
}
