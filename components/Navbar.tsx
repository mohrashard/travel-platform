import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Lynkerr Travel
                        </Link>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="text-gray-600 hover:text-gray-900 font-medium px-3 py-2 rounded-md transition duration-150 ease-in-out"
                        >
                            Login
                        </Link>
                        <Link
                            href="/register"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition duration-150 ease-in-out shadow-sm shadow-blue-600/20"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
