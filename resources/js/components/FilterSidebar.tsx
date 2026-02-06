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
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                )}

                {/* Filter Panel - Enhanced with smooth animations and better shadows */}
                <aside
                    className={`fixed left-0 top-0 z-40 h-screen w-80 overflow-hidden border-r-2 border-black bg-gradient-to-b from-black to-gray-950 shadow-2xl transition-all duration-500 ease-out lg:relative lg:h-[32rem] lg:w-full lg:shadow-lg ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} `}
                    aria-label="Product filters"
                >
                    {/* Mobile Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 bg-black/90 px-5 py-4 backdrop-blur-md lg:hidden">
                        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-tight text-white">
                            <SlidersHorizontal
                                size={18}
                                strokeWidth={2.5}
                                className="animate-pulse"
                            />
                            FILTERS
                        </h2>
                        <button
                            onClick={onClose}
                            className="group relative border border-white/30 p-2 text-white transition-all duration-300 hover:scale-110 hover:border-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
                            aria-label="Close filters"
                        >
                            <X
                                size={18}
                                strokeWidth={2.5}
                                className="transition-transform group-hover:rotate-90"
                            />
                        </button>
                    </div>

                    {/* Desktop Header */}
                    <div className="sticky top-0 z-10 hidden border-b border-white/20 bg-black/90 px-5 py-5 backdrop-blur-md lg:block">
                        <div className="mb-3 flex items-center gap-2.5">
                            <SlidersHorizontal
                                size={18}
                                strokeWidth={2.5}
                                className="animate-pulse text-white"
                            />
                            <h2 className="text-sm font-black uppercase tracking-tight text-white">
                                FILTERS
                            </h2>
                        </div>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-white to-transparent" />
                    </div>

                    {/* Scrollable Content Container */}
                    <div className="scrollbar-noir h-full overflow-y-auto lg:h-[calc(32rem-6rem)]">
                        <div className="space-y-4 p-5">
                            {/* Sort By */}
                            <div className="group border border-white/30 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-white/5">
                                <button
                                    onClick={() => toggleSection('sort')}
                                    className="flex w-full items-center justify-between text-white transition-all duration-200"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        SORT BY
                                    </span>
                                    {expandedSections.sort ? (
                                        <ChevronUp
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform group-hover:translate-y-0.5"
                                        />
                                    )}
                                </button>
                                {expandedSections.sort && (
                                    <div className="animate-in fade-in slide-in-from-top-2 mt-4 duration-300">
                                        <select
                                            id="sortBy"
                                            value={filters.sortBy}
                                            onChange={(e) =>
                                                onFilterChange({
                                                    sortBy: e.target
                                                        .value as Filters['sortBy'],
                                                })
                                            }
                                            className="w-full cursor-pointer border border-white/50 bg-white px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-black shadow-sm transition-all duration-200 hover:border-white hover:shadow-md focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
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
                            <div className="group border border-white/30 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-white/5">
                                <button
                                    onClick={() => toggleSection('price')}
                                    className="flex w-full items-center justify-between text-white transition-all duration-200"
                                >
                                    <span className="text-xs font-bold uppercase tracking-wide">
                                        PRICE
                                    </span>
                                    {expandedSections.price ? (
                                        <ChevronUp
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform group-hover:translate-y-0.5"
                                        />
                                    )}
                                </button>
                                {expandedSections.price && (
                                    <div className="animate-in fade-in slide-in-from-top-2 mt-4 duration-300">
                                        {/* Quick Select Buttons */}
                                        <div className="flex flex-wrap gap-2.5">
                                            <button
                                                onClick={() =>
                                                    onFilterChange({
                                                        priceMin: 0,
                                                        priceMax: 50,
                                                    })
                                                }
                                                className={`group relative overflow-hidden border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
                                                    filters.priceMin === 0 &&
                                                    filters.priceMax === 50
                                                        ? 'border-white bg-white text-black shadow-lg shadow-white/20'
                                                        : 'border-white/50 bg-black text-white hover:border-white hover:bg-white hover:text-black hover:shadow-lg hover:shadow-white/10'
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
                                                className={`group relative overflow-hidden border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
                                                    filters.priceMin === 50 &&
                                                    filters.priceMax === 100
                                                        ? 'border-white bg-white text-black shadow-lg shadow-white/20'
                                                        : 'border-white/50 bg-black text-white hover:border-white hover:bg-white hover:text-black hover:shadow-lg hover:shadow-white/10'
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
                                                className={`group relative overflow-hidden border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 ${
                                                    filters.priceMin === 100 &&
                                                    filters.priceMax === 200
                                                        ? 'border-white bg-white text-black shadow-lg shadow-white/20'
                                                        : 'border-white/50 bg-black text-white hover:border-white hover:bg-white hover:text-black hover:shadow-lg hover:shadow-white/10'
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
                                                className={`border-2 px-2 py-1 text-xs font-bold uppercase tracking-wide transition-all ${
                                                    filters.priceMin === 200 &&
                                                    filters.priceMax === 10000
                                                        ? 'border-white bg-white text-black shadow-lg shadow-white/20'
                                                        : 'border-white/50 bg-black text-white hover:border-white hover:bg-white hover:text-black hover:shadow-lg hover:shadow-white/10'
                                                }`}
                                            >
                                                €200+
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Gender Filter */}
                            <div className="group border border-white/30 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-white/5">
                                <button
                                    onClick={() => toggleSection('gender')}
                                    className="flex w-full items-center justify-between text-white transition-all duration-200"
                                >
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                                        GENDER
                                        {filters.gender &&
                                            filters.gender.length > 0 && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[10px] font-black text-black shadow-sm">
                                                    {filters.gender.length}
                                                </span>
                                            )}
                                    </span>
                                    {expandedSections.gender ? (
                                        <ChevronUp
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={14}
                                            strokeWidth={2.5}
                                            className="transition-transform group-hover:translate-y-0.5"
                                        />
                                    )}
                                </button>
                                {expandedSections.gender && (
                                    <div className="animate-in fade-in slide-in-from-top-2 mt-4 space-y-2.5 duration-300">
                                        {[
                                            { value: 'male', label: 'MALE' },
                                            {
                                                value: 'female',
                                                label: 'FEMALE',
                                            },
                                            {
                                                value: 'unisex',
                                                label: 'UNISEX',
                                            },
                                        ].map((genderOption) => (
                                            <label
                                                key={genderOption.value}
                                                className="group flex cursor-pointer items-center gap-3 border border-white/40 bg-black/20 p-3 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-white hover:bg-white hover:text-black hover:shadow-md active:scale-100"
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
                                                            filters.gender ||
                                                            [];
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
                                                    className="h-4 w-4 cursor-pointer rounded border-2 border-white bg-black text-black transition-all duration-200 checked:bg-white focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black"
                                                />
                                                <span className="text-xs font-semibold uppercase tracking-wide text-white transition-colors group-hover:text-black">
                                                    {genderOption.label}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="group border border-white/30 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:shadow-lg hover:shadow-white/5">
                                <button
                                    onClick={() => toggleSection('categories')}
                                    className="flex w-full items-center justify-between font-black uppercase tracking-tight text-white"
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
                                        <ChevronDown
                                            size={16}
                                            strokeWidth={3}
                                        />
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
                                                <span className="flex-1 text-xs font-bold uppercase tracking-wide text-white group-hover:text-black">
                                                    {category.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Active Filter Chips */}
                            {selectedCategories.length > 0 && (
                                <div className="border border-white/30 bg-black/40 p-4 backdrop-blur-sm">
                                    <label className="mb-3 block text-xs font-bold uppercase tracking-wide text-white/80">
                                        ACTIVE FILTERS
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
                                                className="group inline-flex items-center gap-2 border border-white bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-black shadow-sm transition-all duration-200 hover:scale-105 hover:border-black hover:bg-black hover:text-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black active:scale-95"
                                                aria-label={`Remove category filter: ${category.name}`}
                                            >
                                                <span>{category.name}</span>
                                                <X
                                                    size={12}
                                                    strokeWidth={2.5}
                                                    className="transition-transform group-hover:rotate-90"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Clear All Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={onClearFilters}
                                    className="group relative w-full overflow-hidden border border-white/50 bg-gradient-to-r from-black to-gray-900 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-white hover:from-white hover:to-gray-100 hover:text-black hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-black active:scale-100"
                                >
                                    <span className="relative z-10">
                                        CLEAR ALL FILTERS
                                    </span>
                                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                                </button>
                            )}
                        </div>
                    </div>
                </aside>
            </>
        );
    },
);

FilterSidebar.displayName = 'FilterSidebar';
