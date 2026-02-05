import { Search, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import { memo } from 'react';
import { useCartStore } from '../store/cartStore';

interface HeaderProps {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onToggleFilters?: () => void;
}

/**
 * Noir-themed minimalist header with pure black and white design
 * Memoized to prevent unnecessary re-renders
 */
export const Header = memo(
    ({ searchValue, onSearchChange, onToggleFilters }: HeaderProps) => {
        const { totalItems, openCart } = useCartStore();

        return (
            <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
                <div className="mx-auto px-4 sm:px-6 lg:px-16 xl:px-24">
                    <div className="flex h-16 items-center justify-between gap-4 sm:h-20 sm:gap-8 lg:gap-16">
                        {/* Filter Toggle (Mobile Only) */}
                        <button
                            onClick={onToggleFilters}
                            className="relative flex-shrink-0 rounded-none border-2 border-black p-2 transition-all hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none sm:p-2.5 lg:hidden"
                            aria-label="Toggle filters"
                        >
                            <SlidersHorizontal
                                size={20}
                                className="sm:h-6 sm:w-6"
                            />
                        </button>

                        {/* Logo / Brand */}
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-black tracking-tighter text-black uppercase sm:text-3xl lg:text-4xl">
                                NOIR
                            </h1>
                        </div>

                        {/* Search Bar - Minimalist Design */}
                        <div className="max-w-2xl flex-1">
                            <div className="relative">
                                <Search
                                    className="absolute top-1/2 left-3 -translate-y-1/2 text-black sm:left-4"
                                    size={20}
                                    strokeWidth={2.5}
                                    aria-hidden="true"
                                />
                                <input
                                    type="search"
                                    value={searchValue}
                                    onChange={(e) =>
                                        onSearchChange(e.target.value)
                                    }
                                    placeholder="SEARCH PRODUCTS..."
                                    className="w-full border-2 border-black bg-white py-2.5 pr-4 pl-10 font-medium tracking-wide text-black uppercase placeholder-gray-400 transition-all focus:bg-black focus:text-white focus:placeholder-gray-400 focus:outline-none sm:py-3 sm:pl-12 sm:text-sm"
                                    aria-label="Search products"
                                />
                            </div>
                        </div>

                        {/* Cart Button */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={openCart}
                                className="relative border-2 border-black p-2 transition-all hover:bg-black hover:text-white focus:ring-2 focus:ring-black focus:outline-none sm:p-2.5"
                                aria-label={`Shopping cart with ${totalItems} items`}
                            >
                                <ShoppingCart
                                    size={22}
                                    strokeWidth={2.5}
                                    className="sm:h-6 sm:w-6"
                                />
                                {totalItems > 0 && (
                                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border border-white bg-black text-[10px] font-bold text-white sm:h-6 sm:w-6 sm:text-xs">
                                        {totalItems > 99 ? '99' : totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        );
    },
);

Header.displayName = 'Header';
