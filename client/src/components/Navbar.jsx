import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { ButtonLink } from "./ui/ButtonLink";
import {
  ScanLine,
  Barcode,
  Users,
  Boxes,
  KeyRound,
  LogOut,
} from "lucide-react";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  // утиліта: рендер іконки + тексту (іконка на xs, текст з sm і вище)
  const NavItem = ({ to, icon: Icon, label }) => (
    <Link
      to={to}
      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-600 transition"
      title={label}
    >
      <Icon className="h-5 w-5 sm:hidden" /> {/* іконка на мобілці */}
      <span className="hidden sm:inline text-m font-bold">{label}</span>
    </Link>
  );

  return (
    <nav className="bg-zinc-700 my-3 flex items-center justify-between py-3 px-4 md:px-10 rounded-lg text-white">
      <div className="flex items-center gap-1 sm:gap-3">
        {isAuthenticated && (
          <NavItem
            to={isAuthenticated ? "/scan" : "/"}
            icon={ScanLine}
            label="Scanner"
          />
        )}
        {isAuthenticated && (
          <NavItem
            to={isAuthenticated ? "/generate" : "/"}
            icon={Barcode}
            label="Barcodes"
          />
        )}

        {/* Адмінське меню */}
        {isAuthenticated && user?.role === "admin" && (
          <NavItem to="/admin/users" icon={Users} label="Users" />
        )}

        {isAuthenticated &&
          (user?.role === "admin" || user?.role === "manager") && (
            <NavItem to="/assets" icon={Boxes} label="Assets" />
          )}
      </div>

      <ul className="flex items-center gap-2 sm:gap-4">
        {isAuthenticated ? (
          <>
            <li className="hidden sm:block opacity-90">{user?.username}</li>

            {/* Change password */}
            <li>
              <Link
                to="/change-password"
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-600 transition"
                title="Change password"
              >
                <KeyRound className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline">Change password</span>
              </Link>
            </li>

            {/* Logout */}
            <li>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-zinc-600 transition"
                title="Logout"
              >
                <LogOut className="h-5 w-5 sm:hidden" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <ButtonLink to="/login">
                <span className="hidden sm:inline">Login</span>
                {/* Можна додати іконку для xs, якщо хочеш */}
              </ButtonLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
