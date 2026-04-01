const Footer = () => {
  return (
    <footer className="bg-[#0f172a] text-white/80 mt-auto border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          <div className="flex-1">
            <div className="font-extrabold tracking-wide text-white text-lg">
              UniBorrow
            </div>
            <p className="text-sm mt-3 text-white/60">
              Smart campus borrowing & exchange. Verified trust, in-app chat,
              safe pickups.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="font-semibold text-white">Platform</div>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Browse
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                How it works
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Verified users
              </a>
            </div>
            <div className="space-y-3">
              <div className="font-semibold text-white">Support</div>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Help center
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Contact
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Report an issue
              </a>
            </div>
            <div className="space-y-3">
              <div className="font-semibold text-white">Legal</div>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Terms
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Privacy
              </a>
              <a className="block text-sm text-white/60 hover:text-white" href="#">
                Guidelines
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} UniBorrow. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

