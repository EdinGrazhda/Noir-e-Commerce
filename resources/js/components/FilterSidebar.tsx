import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { Category, Filters } from '../types/store';

interface FilterSidebarProps {
    filters: Filters;
    categories: Category[];
    onFilterChange: (updates: Partial<Filters>) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    isOpen: boolean;
    onClose: () => void;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

/**
 * Filter sidebar - sticky on desktop, drawer on mobile
 * Provides comprehensive filtering options in a dedicated panel with modern, aesthetic design
 */
export const FilterSidebar = memo(
    ({
        filters,
        categories,
        onFilterChange,
        onClearFilters,
        hasActiveFilters,
        isOpen,
        onClose,
    }: FilterSidebarProps) => {
        const [expandedSections, setExpandedSections] = useState({
            sort: true,
            price: true,
            gender: true,
            categories: true,
        });

        const toggleSection = (section: keyof typeof expandedSections) => {
            setExpandedSections((prev) => ({
                ...prev,
                [section]: !prev[section],
            }));
        };

        const selectedCategories = useMemo(() => {
            return categories.filter((cat) =>
                filters.categories.includes(cat.id),
            );
        }, [categories, filters.categories]);

        const handleCategoryToggle = (categoryId: number) => {
            const newCategories = filters.categories.includes(categoryId)
                ? filters.categories.filter((id) => id !== categoryId)
                : [...filters.categories, categoryId];
            onFilterChange({ categories: newCategories });
        };

        const handleRemoveCategory = (categoryId: number) => {
            onFilterChange({
                categories: filters.categories.filter(
                    (id) => id !== categoryId,
                ),
            });
        };

        return (
            <>
                {/* Mobile Backdrop */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                )}

                {/* Filter Panel - 30% Width on Left Side - Matches Banner Height */}
                <aside
                    className={`fixed top-0 left-0 z-40 h-screen w-80 overflow-y-auto border-r-4 border-black bg-black shadow-2xl transition-transform duration-300 ease-in-out lg:relative lg:h-[32rem] lg:w-full ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
                    aria-label="Product filters"
                >
                    {/* Mobile Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b-2 border-white bg-black px-4 py-4 lg:hidden">
                        <h2 className="flex items-center gap-2 font-black tracking-tighter text-white uppercase">
                            <SlidersHorizontal size={20} strokeWidth={3} />
                            FILTERS
                        </h2>
                        <button
                            onClick={onClose}
                            className="border-2 border-white p-2 text-white transition-all hover:bg-white hover:text-black focus:ring-2 focus:ring-white focus:outline-none"
                            aria-label="Close filters"
                        >
                            <X size={20} strokeWidth={3} />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="sticky top-0 z-10 hidden border-b-2 border-white bg-black px-4 py-5 lg:block">
                        <div className="mb-2 flex items-center gap-2">
                            <SlidersHorizontal
                                size={20}
                                strokeWidth={3}
                                className="text-white"
                            />
                            <h2 className="font-black tracking-tighter text-white uppercase">
                                FILTERS
                            </h2>
                        </div>
                        <div className="h-1 w-12 bg-white" />
                    </div>

                    {/* Scrollable Content Container */}
                    <div className="h-full overflow-y-auto custom-scrollbar lg:h-[calc(32rem-6rem)]">
                        <div className="space-y-3 p-4">
                        {/* Sort By */}
                        <div className="border-2 border-white p-3">
                            <button
                                onClick={() => toggleSection('sort')}
                                className="flex w-full items-center justify-between font-black tracking-tight text-white uppercase"
                            >
                                <span className="text-xs">SORT BY</span>
                                {expandedSections.sort ? (
                                    <ChevronUp size={16} strokeWidth={3} />
                                ) : (
                                    <ChevronDown size={16} strokeWidth={3} />
                                )}
                            </button>
                            {expandedSections.sort && (
                                <div className="mt-3">
                                    <select
                                        id="sortBy"
                                        value={filters.sortBy}
                                        onChange={(e) =>
                                            onFilterChange({
                                                sortBy: e.target
                                                    .value as Filters['sortBy'],
                                            })
                                        }
                                        className="w-full cursor-pointer border-2 border-black bg-white px-3 py-2 text-xs font-bold tracking-wide text-black uppercase transition-all hover:bg-gray-100 focus:ring-2 focus:ring-white focus:outline-none"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Price Range */}
                        <div className="border-2 border-white p-3">
                            <button
                                onClick={() => toggleSection('price')}
                                className="flex w-full items-center justify-between font-black tracking-tight text-white uppercase"
                            >
                                <span className="text-xs">PRICE</span>
                                {expandedSections.price ? (
                                    <ChevronUp size={16} strokeWidth={3} />
                                ) : (
                                    <ChevronDown size={16} strokeWidth={3} />
                                )}
                            </button>
                            {expandedSections.price && (
                                <div className="mt-3">
                                    {/* Quick Select Buttons */}
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                onFilterChange({
                                                    priceMin: 0,
                                                    priceMax: 50,
                                                })
                                            }
                                            className={`border-2 px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all ${
                                                filters.priceMin === 0 &&
                                                filters.priceMax === 50
                                                    ? 'border-white bg-white text-black'
                                                    : 'border-white bg-black text-white hover:bg-white hover:text-black'
                                            }`}
                                        >
                                            UNDER €50
                                        </button>
                                        <button
                                            onClick={() =>
                                                onFilterChange({
                                                    priceMin: 50,
                                                    priceMax: 100,
                                                })
                                            }
                                            className={`border-2 px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all ${
                                                filters.priceMin === 50 &&
                                                filters.priceMax === 100
                                                    ? 'border-white bg-white text-black'
                                                    : 'border-white bg-black text-white hover:bg-white hover:text-black'
                                            }`}
                                        >
                                            €50-€100
                                        </button>
                                        <button
                                            onClick={() =>
                                                onFilterChange({
                                                    priceMin: 100,
                                                    priceMax: 200,
                                                })
                                            }
                                            className={`border-2 px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all ${
                                                filters.priceMin === 100 &&
                                                filters.priceMax === 200
                                                    ? 'border-white bg-white text-black'
                                                    : 'border-white bg-black text-white hover:bg-white hover:text-black'
                                            }`}
                                        >
                                            €100-€200
                                        </button>
                                        <button
                                            onClick={() =>
                                                onFilterChange({
                                                    priceMin: 200,
                                                    priceMax: 10000,
                                                })
                                            }
                                            className={`border-2 px-2 py-1 text-xs font-bold tracking-wide uppercase transition-all ${
                                                filters.priceMin === 200 &&
                                                filters.priceMax === 10000
                                                    ? 'border-white bg-white text-black'
                                                    : 'border-white bg-black text-white hover:bg-white hover:text-black'
                                            }`}
                                        >
                                            €200+
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Gender Filter */}
                        <div className="border-2 border-white p-3">
                            <button
                                onClick={() => toggleSection('gender')}
                                className="flex w-full items-center justify-between font-black tracking-tight text-white uppercase"
                            >
                                <span className="flex items-center gap-2 text-xs">
                                    GENDER
                                    {filters.gender &&
                                        filters.gender.length > 0 && (
                                            <span className="flex h-4 w-4 items-center justify-center border border-white bg-white text-[10px] font-black text-black">
                                                {filters.gender.length}
                                            </span>
                                        )}
                                </span>
                                {expandedSections.gender ? (
                                    <ChevronUp size={16} strokeWidth={3} />
                                ) : (
                                    <ChevronDown size={16} strokeWidth={3} />
                                )}
                            </button>
                            {expandedSections.gender && (
                                <div className="mt-3 space-y-2">
                                    {[
                                        { value: 'male', label: 'MALE' },
                                        { value: 'female', label: 'FEMALE' },
                                        { value: 'unisex', label: 'UNISEX' },
                                    ].map((genderOption) => (
                                        <label
                                            key={genderOption.value}
                                            className="group flex cursor-pointer items-center gap-2 border border-white p-2 transition-all hover:bg-white hover:text-black"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={
                                                    filters.gender?.includes(
                                                        genderOption.value,
                                                    ) || false
                                                }
                                                onChange={() => {
                                                    const currentGenders =
                                                        filters.gender || [];
                                                    const newGenders =
                                                        currentGenders.includes(
                                                            genderOption.value,
                                                        )
                                                            ? currentGenders.filter(
                                                                  (g) =>
                                                                      g !==
                                                                      genderOption.value,
                                                              )
                                                            : [
                                                                  ...currentGenders,
                                                                  genderOption.value,
                                                              ];
                                                    onFilterChange({
                                                        gender: newGenders,
                                                    });
                                                }}
                                                className="h-4 w-4 cursor-pointer border-2 border-white bg-black text-black focus:ring-2 focus:ring-white focus:ring-offset-0"
                                            />
                                            <span className="text-xs font-bold tracking-wide text-white uppercase group-hover:text-black">
                                                {genderOption.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="border-2 border-white p-3">
                            <button
                                onClick={() => toggleSection('categories')}
                                className="flex w-full items-center justify-between font-black tracking-tight text-white uppercase"
                            >
                                <span className="flex items-center gap-2 text-xs">
                                    CATEGORIES
                                    {filters.categories.length > 0 && (
                                        <span className="flex h-4 w-4 items-center justify-center border border-white bg-white text-[10px] font-black text-black">
                                            {filters.categories.length}
                                        </span>
                                    )}
                                </span>
                                {expandedSections.categories ? (
                                    <ChevronUp size={16} strokeWidth={3} />
                                ) : (
                                    <ChevronDown size={16} strokeWidth={3} />
                                )}
                            </button>
                            {expandedSections.categories && (
                                <div className="custom-scrollbar mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            className="group flex cursor-pointer items-center gap-2 border border-white p-2 transition-all hover:bg-white hover:text-black"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={filters.categories.includes(
                                                    category.id,
                                                )}
                                                onChange={() =>
                                                    handleCategoryToggle(
                                                        category.id,
                                                    )
                                                }
                                                className="h-4 w-4 cursor-pointer border-2 border-white bg-black text-black focus:ring-2 focus:ring-white"
                                            />
                                            <span className="flex-1 text-xs font-bold tracking-wide text-white uppercase group-hover:text-black">
                                                {category.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Filter Chips */}
                        {selectedCategories.length > 0 && (
                            <div className="border-2 border-white p-3">
                                <label className="mb-3 block text-xs font-black tracking-tight text-white uppercase">
                                    ACTIVE
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() =>
                                                handleRemoveCategory(
                                                    category.id,
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 border-2 border-white bg-white px-2 py-1 text-xs font-bold tracking-wide text-black uppercase transition-all hover:bg-black hover:text-white focus:ring-2 focus:ring-white focus:outline-none"
                                            aria-label={`Remove category filter: ${category.name}`}
                                        >
                                            <span>{category.name}</span>
                                            <X size={12} strokeWidth={3} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Clear All Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={onClearFilters}
                                className="w-full border-2 border-white bg-black py-3 text-xs font-black tracking-widest text-white uppercase transition-all duration-200 hover:bg-white hover:text-black focus:ring-2 focus:ring-white focus:outline-none"
                            >
                                CLEAR ALL
                            </button>
                        )}
                        </div>
                    </div>

                    {/* Custom scrollbar styles */}
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #000000;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #FFFFFF;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #CCCCCC;
                        }
                    `}</style>
                </aside>
            </>
        );
    },
);

FilterSidebar.displayName = 'FilterSidebar';
