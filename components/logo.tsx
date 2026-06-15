import Link from "next/link"

const Logo = () => {
    return (
    <Link 
    href="/" 
    className="flex-1 flex items-center
     gap-2 text-2xl
    "
    >
        <span className="inline-block font-black text-transparent bg-clip-text bg-gradient-to-tr from-primary to-violet-500 text-2xl scale-110 motion-safe:hover:scale-125 transition-transform duration-200">
    x
  </span>
  <span className="font-bold text-foreground tracking-wide">
    design<span className="text-primary/80">.ai</span>
  </span>
    </Link>
    );
};

export default Logo;