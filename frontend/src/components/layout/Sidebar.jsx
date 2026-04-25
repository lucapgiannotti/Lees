// src/components/layout/Sidebar.jsx
import { Link, NavLink } from 'react-router-dom'
import NewBatch from '../../pages/NewBatch'

// Define our navigation links in a clean array
const navLinks = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/batches', icon: 'kettle', label: 'Active Batches' },
  { path: '/recipes', icon: 'menu_book', label: 'Recipes' },
  { path: '/calculators', icon: 'calculate', label: 'Calculators' },
  { path: '/inventory', icon: 'inventory_2', label: 'Inventory' },
  { path: '/new-batch', icon: 'add', label: 'New Batch' },
]

export default function Sidebar() {
  return (
    <nav className="hidden md:flex flex-col gap-4 p-6 fixed left-0 top-0 h-full w-64 border-r border-outline-variant bg-surface-container-low z-20">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter">Lees</h1>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
          Open Source Brewing
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            // NavLink gives us access to an 'isActive' boolean!
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 ${
                isActive
                  ? 'bg-surface-container-high text-primary border border-outline-variant shadow-sm shadow-primary/10'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`
            }
          >
            {/* We also use isActive here to make the icon solid when selected */}
            {({ isActive }) => (
              <>
                <span
                  className="material-symbols-outlined"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {link.icon}
                </span>
                <span className="font-body-md text-body-md font-medium">{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto">
        <Link to="/new-batch">
          <button className="w-full flex justify-center items-center gap-2 bg-primary text-on-primary py-3 rounded-xl font-body-md text-body-md font-medium hover:opacity-90 transition-opacity min-h-12">
            <span className="material-symbols-outlined">add</span>
            New Batch
          </button>
        </Link>
        <div className="mt-6 flex items-center gap-3 border-t border-outline-variant pt-4">
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-bold border border-outline-variant">
            BM
          </div>
          <div>
            <p className="font-body-md text-body-md font-medium">Brewmaster</p>
          </div>
        </div>
      </div>
    </nav>
  )
}
