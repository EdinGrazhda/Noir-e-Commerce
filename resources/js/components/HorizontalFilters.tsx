import { ChevronDown, Filter, SlidersHorizontal, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { Category, Filters } from '../types/store';

interface HorizontalFiltersProps {
    filters: Filters;
    categories: Category[];
    onFilterChange: (updates: Partial<Filters>) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
] as const;

const PRICE_RANGES = [
    { label: 'Under €50', min: 0, max: 50 },
    { label: '€50-€100', min: 50, max: 100 },
    { label: '€100-€200', min: 100, max: 200 },
    { label: '€200+', min: 200, max: 10000 },
];

const GENDERS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'unisex', label: 'Unisex' },
];

/**
 * Modern horizontal filter bar - sticky at top, expandable sections
 * Superior UX for product filtering with full-width product grid
 */
export const HorizontalFilters = memo(
    ({
        filters,
        categories,
        onFilterChange,
        onClearFilters,
        hasActiveFilters,
    }: HorizontalFiltersProps) => {
        const [expandedSection, setExpandedSection] = useState<string | null>(null);

        const toggleSection = (section: string) => {
            setExpandedSection(expandedSection === section ? null : section);
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

        const handlePriceSelect = (min: number, max: number) => {
            onFilterChange({ priceMin: min, priceMax: max });
            setExpandedSection(null);
        };

        const handleGenderToggle = (gender: string) => {
            const currentGenders = filters.gender || [];
            const newGenders = currentGenders.includes(gender)
                ? currentGenders.filter((g) => g !== gender)
                : [...currentGenders, gender];
            onFilterChange({ gender: newGenders });
        };

        const activeFilterCount = 
            filters.categories.length + 
            (filters.gender?.length || 0) + 
            (filters.priceMin !== undefined || filters.priceMax !== undefined ? 1 : 0);

        return (
            <div className="sticky top-0 z-30 bg-white shadow-md">
                {/* Main Filter Bar */}
                <div className="border-b-2 border-black">
                    <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between gap-4 py-4">
                            {/* Left: Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-2">
                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('sort')}
                                        className={`group flex items-center gap-2 border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 ${
                                            expandedSection === 'sort'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/30 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <SlidersHorizontal size={16} strokeWidth={2.5} />
                                        <span>Sort</span>
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${expandedSection === 'sort' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Price Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('price')}
                                        className={`group flex items-center gap-2 border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 ${
                                            expandedSection === 'price'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/30 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span>Price</span>
                                        {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-black">
                                                1
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${expandedSection === 'price' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Gender Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('gender')}
                                        className={`group flex items-center gap-2 border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 ${
                                            expandedSection === 'gender'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/30 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span>Gender</span>
                                        {filters.gender && filters.gender.length > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-black">
                                                {filters.gender.length}
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${expandedSection === 'gender' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Categories Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('categories')}
                                        className={`group flex items-center gap-2 border-2 px-4 py-2.5 text-sm font-bold uppercase tracking-wide transition-all duration-200 hover:scale-105 active:scale-95 ${
                                            expandedSection === 'categories'
                                                ? 'border-black bg-black text-white'
                                                : 'border-black/30 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span>Categories</span>
                                        {filters.categories.length > 0 && (
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-black text-black">
                                                {filters.categories.length}
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Right: Active Filters & Clear */}
                            <div className="flex items-center gap-2">
                                {hasActiveFilters && (
                                    <>
                                        <div className="hidden items-center gap-2 sm:flex">
                                            <span className="text-sm font-semibold text-gray-600">
                                                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
                                            </span>
                                        </div>
                                        <button
                                            onClick={onClearFilters}
                                            className="group flex items-center gap-2 border-2 border-red-600 bg-red-600 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all duration-200 hover:scale-105 hover:bg-red-700 active:scale-95"
                                        >
                                            <X size={16} strokeWidth={2.5} />
                                            <span className="hidden sm:inline">Clear All</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Tags */}
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pb-4">
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                                    Active:
                                </span>
                                {selectedCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryToggle(category.id)}
                                        className="group inline-flex items-center gap-1.5 border border-black bg-black px-3 py-1 text-xs font-semibold uppercase text-white transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
                                    >
                                        <span>{category.name}</span>
                                        <X size={12} strokeWidth={2.5} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Expandable Dropdown Sections */}
                {expandedSection && (
                    <div className="border-b-2 border-black bg-gradient-to-b from-gray-50 to-white">
                        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
                            <div className="py-6">
                                {/* Sort Options */}
                                {expandedSection === 'sort' && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    onFilterChange({ sortBy: option.value as Filters['sortBy'] });
                                                    setExpandedSection(null);
                                                }}
                                                className={`border-2 px-4 py-3 text-sm font-semibold uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                                                    filters.sortBy === option.value
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-black/30 bg-white text-black hover:border-black'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Price Ranges */}
                                {expandedSection === 'price' && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {PRICE_RANGES.map((range) => (
                                            <button
                                                key={range.label}
                                                onClick={() => handlePriceSelect(range.min, range.max)}
                                                className={`border-2 px-4 py-3 text-sm font-semibold uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                                                    filters.priceMin === range.min && filters.priceMax === range.max
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-black/30 bg-white text-black hover:border-black'
                                                }`}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Gender Options */}
                                {expandedSection === 'gender' && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {GENDERS.map((gender) => (
                                            <button
                                                key={gender.value}
                                                onClick={() => handleGenderToggle(gender.value)}
                                                className={`border-2 px-4 py-3 text-sm font-semibold uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                                                    filters.gender?.includes(gender.value)
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-black/30 bg-white text-black hover:border-black'
                                                }`}
                                            >
                                                {gender.label}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Categories Grid */}
                                {expandedSection === 'categories' && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                                        {categories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => handleCategoryToggle(category.id)}
                                                className={`border-2 px-4 py-3 text-sm font-semibold uppercase transition-all duration-200 hover:scale-105 active:scale-95 ${
                                                    filters.categories.includes(category.id)
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-black/30 bg-white text-black hover:border-black'
                                                }`}
                                            >
                                                {category.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

HorizontalFilters.displayName = 'HorizontalFilters';
