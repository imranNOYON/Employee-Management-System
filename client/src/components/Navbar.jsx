import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center text-white">
      <Link to="/" className="text-xl font-bold hover:underline">EMS</Link>

      <div className="space-x-6 flex items-center">
        {!user ? (
          <>
            <Link to="/login" className="hover:underline">Login</Link>
            <Link to="/signup" className="hover:underline">Register</Link>
          </>
        ) : (
          <>
            {user.role === 'admin' && (
              <Link to="/dashboard/admin" className="hover:underline">Admin Dashboard</Link>
            )}
            {user.role === 'employee' && (
              <Link to="/dashboard/employee" className="hover:underline">Employee Dashboard</Link>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
