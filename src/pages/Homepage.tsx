import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Clock,
  CreditCard,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import useAuthStore from "../store/authStore";

const Homepage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="font-bold text-xl text-primary">
            PrintSpark Studio
          </Link>
          <div className="flex space-x-4">
            <Link to="/login">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-white "
              >
                Login
              </Button>
            </Link>            <Link to="/register">
              <Button className="bg-primary hover:bg-primary-500">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-100 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Fast & Reliable Printing Services for Students
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Upload your documents, customize your order, and get your prints
                without waiting in line.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">                <Link to="/register">
                  <Button className="bg-primary hover:bg-primary-500 text-white px-8 py-6 rounded-lg text-lg">
                    Sign Up
                  </Button>
                </Link>
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary-100 px-8 py-6 rounded-lg text-lg"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158"
                alt="Student using printing service"
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <Upload size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
              <p className="text-gray-600">
                Upload PDF, DOC, or other document formats
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <FileText size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Options</h3>
              <p className="text-gray-600">
                Select color, quantity, and other print options
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <CreditCard size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Make Payment</h3>
              <p className="text-gray-600">
                Pay securely using our payment gateway
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-4 rounded-full mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your Prints</h3>
              <p className="text-gray-600">
                Track status and collect your prints
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PrintSpark Studio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <Clock className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Save Time</h3>
              <p className="text-gray-600">
                No more waiting in long queues. Order prints from anywhere,
                anytime.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <CreditCard className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden costs. Pay only for what you
                print.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <CheckCircle className="text-primary mb-4" size={32} />
              <h3 className="text-xl font-semibold mb-2">High Quality</h3>
              <p className="text-gray-600">
                Professional quality prints for your assignments, projects, and
                presentations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary-400 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">            Sign up now and get your first 10 black and white prints free!
          </p>
          <Link to="/register">
            <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-lg text-lg font-medium">
              Sign Up <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">PrintSpark Studio</h3>
              <p className="text-gray-400">
                The easiest way to get your documents printed on campus.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-400 hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white">
                    Login
                  </Link>
                </li>
                <li>                  <Link
                    to="/register"
                    className="text-gray-400 hover:text-white"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-400">Document Printing</span>
                </li>
                <li>
                  <span className="text-gray-400">Color Printing</span>
                </li>
                <li>
                  <span className="text-gray-400">Double-Sided Printing</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-400">
                    Email: support@printspark.com
                  </span>
                </li>
                <li>
                  <span className="text-gray-400">Phone: (123) 456-7890</span>
                </li>
                <li>
                  <span className="text-gray-400">
                    Location: Campus Library, Room 101
                  </span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>© 2025 PrintSpark Studio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
