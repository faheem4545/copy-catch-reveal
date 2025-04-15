
import { Link } from "react-router-dom";
import { FileCheck, LayoutDashboard, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-sm py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <FileCheck className="h-8 w-8 text-purple-600" />
          <span className="text-xl font-bold gradient-text">PlagiarismCheck</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors">Home</Link>
          <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors">Dashboard</Link>
          <Link to="/about" className="text-gray-700 hover:text-purple-600 transition-colors">About</Link>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
