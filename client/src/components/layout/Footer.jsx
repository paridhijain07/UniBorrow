import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-100/60 dark:bg-[#070a12] text-slate-600 dark:text-slate-400 mt-auto border-t border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="md:col-span-1 space-y-3">
            <div className="font-extrabold tracking-tight text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <span>Uni<span className="text-orange-500">Borrow</span></span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                Campus
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Smart peer-to-peer campus borrowing & gear exchange. Verified student trust, zero commission, safe campus pickup zones.
            </p>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Platform
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/browse" className="hover:text-orange-500 transition-colors">
                  Browse Gear
                </Link>
              </li>
              <li>
                <Link to="/add-item" className="hover:text-orange-500 transition-colors">
                  List an Item
                </Link>
              </li>
              <li>
                <Link to="/browse?listingType=Exchange" className="hover:text-orange-500 transition-colors">
                  Free Exchange
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Community
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500 dark:text-slate-400">Library Pickup Zone</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">Student ID Verification</span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">Peer Reviews & Karma</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Trust & Safety
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              All interactions happen inside verified university zones with in-app chat negotiation.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200/60 dark:border-slate-800/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-3">
          <div>
            © {new Date().getFullYear()} UniBorrow. Built for campus communities.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Campus Network Active</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

