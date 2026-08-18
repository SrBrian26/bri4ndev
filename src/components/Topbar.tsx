import AnimatedWordmark from "./AnimatedWordmark";
import { scrollToSection } from "../lib/scroll";
import { propsCorreo } from "../lib/email";
// import LogoBadge from "./LogoBadge";

type Social = {
  label: string;
  href: string;
  icon: string;
  /** El del correo no lleva `mailto:`: lo arma el clic. Ver `lib/email.ts`. */
  correo?: true;
};

const socials: Social[] = [
  {
    label: "GitHub",
    href: "https://github.com/SrBrian26",
    icon: "fa-brands fa-github",
  },
  {
    label: "Correo",
    href: "#contact",
    icon: "fa-solid fa-envelope",
    correo: true,
  },
];

export default function Topbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-principal/45 bg-[#0F1420]/40 backdrop-blur-md">
      <div className="flex items-center h-14 justify-between px-4 sm:pr-6 sm:pl-20">
        <a
          href="#hero"
          onClick={scrollToSection}
          aria-label="bri4n.dev — inicio"
          className="flex items-center no-underline"
        >
          <AnimatedWordmark className="text-xl sm:text-[22px]" />
          {/* {screen.width >= 640 ? (
            <AnimatedWordmark className="text-xl sm:text-[22px]" />
          ) : (
            <LogoBadge />
          )} */}
        </a>

        <nav className="flex items-center gap-1">
          {socials.map((social) => {
            const external = social.href.startsWith("http");

            return (
              <a
                key={social.href}
                href={social.href}
                {...(social.correo ? propsCorreo : null)}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                aria-label={social.label}
                className="group relative flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 no-underline transition-colors duration-200 hover:bg-zinc-800/60 hover:text-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <i
                  className={`${social.icon} text-[17px] group-hover:text-secundario transform duration-200`}
                  aria-hidden="true"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 -translate-y-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-zinc-100 opacity-0 shadow-lg shadow-black/40 transition duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                >
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-t border-l border-zinc-800 bg-zinc-900"
                  />
                  {social.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
