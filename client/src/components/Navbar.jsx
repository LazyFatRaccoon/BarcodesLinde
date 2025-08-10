// components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ButtonLink } from "./ui/ButtonLink";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-zinc-700 my-3 flex items-center justify-between py-5 px-10 rounded-lg text-white">
      <div className="flex items-center gap-3">
        <span className="text-m font-bold">
          <Link to={isAuthenticated ? "/scan" : "/"}>Scanner</Link>
        </span>
        <span className="text-m font-bold">
          <Link to={isAuthenticated ? "/generate" : "/"}>Barcodes</Link>
        </span>

        {/* Адмінське меню */}
        {isAuthenticated && user?.role === "admin" && (
          <span className="text-m font-bold">
            <Link to="/admin/users">Users</Link>
          </span>
        )}
        {isAuthenticated &&
          (user?.role === "admin" || user?.role === "manager") && (
            <span className="text-m font-bold">
              <Link to="/assets">Assets</Link>
            </span>
          )}
      </div>

      <ul className="flex items-center gap-x-4">
        {isAuthenticated ? (
          <>
            <li className="opacity-90">Welcome {user?.username}</li>
            {/* Якщо задачі ще потрібні */}
            {/* <li><ButtonLink to="/add-task">Add Task</ButtonLink></li> */}

            {/* Зміна пароля доступна всім залогіненим */}
            <li>
              <ButtonLink to="/change-password">Change password</ButtonLink>
            </li>

            <li>
              <Link to="/" onClick={logout}>
                Logout
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <ButtonLink to="/login">Login</ButtonLink>
            </li>
            {/* Якщо самореєстрацію вимкнули, сховай лінк нижче */}
            {/* <li><ButtonLink to="/register">Register</ButtonLink></li> */}
          </>
        )}
      </ul>
    </nav>
  );
}
