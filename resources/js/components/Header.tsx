import { Search, ShoppingCart } from 'lucide-react';
import { memo } from 'react';
import { useCartStore } from '../store/cartStore';

interface HeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
}

/**
 * Noir-themed minimalist header with pure black and white design
 * Memoized to prevent unnecessary re-renders
 */
export const Header = memo(({ searchValue, onSearchChange }: HeaderProps) => {
    const { totalItems, openCart } = useCartStore();

    return (
        <header className="shadow-soft sticky top-0 z-50 bg-white transition-shadow duration-300">
            <div className="border-b border-gray-200">
                <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex h-20 items-center justify-between gap-6 lg:gap-12">
                        {/* Logo / Brand - Elevated */}
                        <div className="flex-shrink-0">
                            <a
                                href="/"
                                className="block transition-all duration-300 hover:scale-105"
                            >
                                <img
                                    src="/images/1-02.png"
                                    alt="NOIR"
                                    className="h-14 w-auto lg:h-16"
                                />
                            </a>
                        </div>

                        {/* Search Bar - Premium Design */}
                        <div className="max-w-3xl flex-1">
                            <div className="group relative">
                                <Search
                                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-black"
                                    size={20}
                                    strokeWidth={2}
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    placeholder="Search products..."
                                    className="w-full border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-12 text-sm font-medium tracking-wide text-black placeholder-gray-400 transition-all duration-300 focus:border-black focus:bg-white focus:ring-1 focus:ring-black focus:outline-none"
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        {/* Cart Button - Refined */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={openCart}
                                className="group relative flex items-center gap-2 border-2 border-transparent px-4 py-3 transition-all duration-300 hover:border-black focus:border-black focus:outline-none"
                                aria-label={`Shopping cart with ${totalItems} items`}
                            >
                                <ShoppingCart
                                    size={24}
                                    strokeWidth={2}
                                    className="transition-transform group-hover:scale-110"
                                />
                                {totalItems > 0 && (
                                    <span className="flex h-7 min-w-[1.75rem] items-center justify-center bg-black px-2 text-xs font-bold text-white transition-all group-hover:scale-110">
                                        {totalItems > 99 ? '99+' : totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';
