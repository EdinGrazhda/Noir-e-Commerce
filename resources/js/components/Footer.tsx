import { Instagram, Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t-4 border-black bg-black text-white">
            <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-16">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tighter uppercase">
                            NOIR
                        </h2>
                        <div className="h-1 w-16 bg-white" />
                        <p className="font-medium tracking-wide text-gray-400 uppercase">
                            Premium footwear for the modern soul
                        </p>
                    </div>

                    {/* Locations */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-black tracking-tight uppercase">
                            <MapPin className="h-5 w-5" strokeWidth={3} />
                            LOCATIONS
                        </h3>
                        <ul className="space-y-2.5 text-sm font-medium tracking-wide text-gray-400 uppercase">
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 flex-shrink-0 border-2 border-white" />
                                <span>Rr. Tirana (Përballë Abi Qarshia)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 flex-shrink-0 border-2 border-white" />
                                <span>Rr. Zahir Pajaziti</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1 h-2 w-2 flex-shrink-0 border-2 border-white" />
                                <span>
                                    Rr. De Rada (Afër Stacionit Autobusave)
                                </span>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 text-lg font-black tracking-tight uppercase">
                            <Phone className="h-5 w-5" strokeWidth={3} />
                            CONTACT
                        </h3>
                        <ul className="space-y-2.5 text-sm font-medium text-gray-400">
                            <li>
                                <a
                                    href="tel:+38343509944"
                                    className="flex items-center gap-2 tracking-wide uppercase transition-colors hover:text-white"
                                >
                                    <Phone
                                        className="h-4 w-4"
                                        strokeWidth={2.5}
                                    />
                                    043 509 944
                                </a>
                            </li>
                            <li>
                                <a
                                    href="tel:+38349831828"
                                    className="flex items-center gap-2 tracking-wide uppercase transition-colors hover:text-white"
                                >
                                    <Phone
                                        className="h-4 w-4"
                                        strokeWidth={2.5}
                                    />
                                    049 831 828
                                </a>
                            </li>
                            <li>
                                <a
                                    href="mailto:info@andshoes-ks.com"
                                    className="flex items-center gap-2 transition-colors hover:text-white"
                                >
                                    <Mail
                                        className="h-4 w-4"
                                        strokeWidth={2.5}
                                    />
                                    info@andshoes-ks.com
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black tracking-tight uppercase">
                            FOLLOW US
                        </h3>
                        <div className="flex flex-col gap-3">
                            <a
                                href="https://www.instagram.com/and.shoess/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 border-2 border-white bg-transparent px-4 py-2.5 font-black tracking-widest text-white uppercase transition-all hover:bg-white hover:text-black"
                            >
                                <Instagram
                                    className="h-5 w-5"
                                    strokeWidth={3}
                                />
                                INSTAGRAM
                            </a>
                            <a
                                href="https://www.tiktok.com/@and.shoess"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex items-center gap-2 border-2 border-white bg-transparent px-4 py-2.5 font-black tracking-widest text-white uppercase transition-all hover:bg-white hover:text-black"
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                                TIKTOK
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 border-t-2 border-white pt-6">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                            © {new Date().getFullYear()} NOIR. ALL RIGHTS
                            RESERVED.
                        </p>
                        <div className="flex gap-6 text-sm font-bold tracking-widest text-gray-400 uppercase">
                            <a
                                href="#"
                                className="border-b-2 border-transparent transition-all hover:border-white hover:text-white"
                            >
                                PRIVACY
                            </a>
                            <a
                                href="#"
                                className="border-b-2 border-transparent transition-all hover:border-white hover:text-white"
                            >
                                TERMS
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
