import Link from 'next/link';
import Image from 'next/image';

type FooterLink = { label: string; href: string };

/*
 * Adjust the hrefs below to match your real routes under src/app.
 * Every link here points to a real existing page.
 */
const exploreLinks: FooterLink[] = [
  { label: 'Players', href: '/players' },
  { label: 'Teams & clans', href: '/teams' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Search', href: '/search' },
];

const playLinks: FooterLink[] = [
  { label: 'Scrims hub', href: '/scrims' },
  { label: 'Host a scrim', href: '/scrims/create' },
  { label: 'Player Studio', href: '/player' },
  { label: 'Join community', href: '/join' },
];

const legalLinks: FooterLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Support', href: '/support' },
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
];

const linkClass =
  'inline-block rounded-[2px] py-1.5 text-[#B5B5B5] underline-offset-4 transition-colors ' +
  'hover:text-white hover:underline ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFE93B]';

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1F1F1F] bg-[#0A0A0A] text-[#B5B5B5]">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-[2px] font-display text-xl font-bold tracking-tight text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FFE93B]"
            >
              <Image
                src="/photos/logo1.png"
                alt="CallOfDutyMobile India Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain flex-shrink-0"
              />
              <span className="flex items-baseline gap-1.5">
                CallOfDutyMobile
                <span className="text-sm font-medium text-[#8A8A8A]">India</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6">
              Player profiles, rosters, tournaments and scrims for Indian Call of Duty: Mobile.
            </p>
            <Link
              href="/join"
              className="mt-6 inline-flex items-center rounded-[2px] bg-[#FFE93B] px-4 py-2.5 text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-[#FFF17A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Get verified
            </Link>
          </div>

          {/* Link columns */}
          <FooterColumn title="Explore" links={exploreLinks} />
          <FooterColumn title="Play" links={playLinks} />
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-[#1F1F1F] pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">&copy; {year} CallOfDutyMobile India</p>
            <nav aria-label="Legal">
              <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-[#8A8A8A]">
            Community-operated and not affiliated with or endorsed by Activision or Tencent. Call of
            Duty: Mobile and its marks belong to their respective owners.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
