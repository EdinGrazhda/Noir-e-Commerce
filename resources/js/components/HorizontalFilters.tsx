import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import type { Category, Filters, Product } from '../types/store';

interface HorizontalFiltersProps {
    filters: Filters;
    categories: Category[];
    products?: Product[];
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
        products = [],
        onFilterChange,
        onClearFilters,
        hasActiveFilters,
    }: HorizontalFiltersProps) => {
        const [expandedSection, setExpandedSection] = useState<string | null>(
            null,
        );

        // Calculate dynamic price ranges based on actual product prices
        const PRICE_RANGES = useMemo(() => {
            if (products.length === 0) {
                return [
                    { label: 'Under €50', min: 0, max: 50 },
                    { label: '€50-€100', min: 50, max: 100 },
                    { label: '€100-€200', min: 100, max: 200 },
                    { label: '€200+', min: 200, max: 500 },
                ];
            }

            const prices = products.map((p) => p.price || 0);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);

            // Round to nearest 10
            const roundedMin = Math.floor(minPrice / 10) * 10;
            const roundedMax = Math.ceil(maxPrice / 10) * 10;

            // Calculate quartiles for better distribution
            const quarter = (roundedMax - roundedMin) / 4;

            return [
                {
                    label: `Under €${Math.ceil(roundedMin + quarter)}`,
                    min: roundedMin,
                    max: Math.ceil(roundedMin + quarter),
                },
                {
                    label: `€${Math.ceil(roundedMin + quarter)}-€${Math.ceil(roundedMin + quarter * 2)}`,
                    min: Math.ceil(roundedMin + quarter),
                    max: Math.ceil(roundedMin + quarter * 2),
                },
                {
                    label: `€${Math.ceil(roundedMin + quarter * 2)}-€${Math.ceil(roundedMin + quarter * 3)}`,
                    min: Math.ceil(roundedMin + quarter * 2),
                    max: Math.ceil(roundedMin + quarter * 3),
                },
                {
                    label: `€${Math.ceil(roundedMin + quarter * 3)}+`,
                    min: Math.ceil(roundedMin + quarter * 3),
                    max: roundedMax + 50,
                },
            ];
        }, [products]);

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
            (filters.priceMin !== undefined || filters.priceMax !== undefined
                ? 1
                : 0);

        return (
            <div className="shadow-soft sticky top-20 z-30 bg-white transition-shadow duration-300">
                {/* Main Filter Bar */}
                <div className="border-b border-gray-200">
                    <div className="mx-auto max-w-[1920px] px-3 sm:px-6 lg:px-16 xl:px-24">
                        <div className="flex items-center justify-between gap-2 py-3 sm:gap-4 sm:py-5">
                            {/* Left: Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
                                {/* Sort Dropdown */}
                                {/* Sort Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('sort')}
                                        className={`hover:shadow-soft group flex items-center gap-1.5 border px-3 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                                            expandedSection === 'sort'
                                                ? 'shadow-elevated border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <SlidersHorizontal
                                            size={14}
                                            strokeWidth={2}
                                            className="sm:h-4 sm:w-4"
                                        />
                                        <span>Sort</span>
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 sm:h-4 sm:w-4 ${expandedSection === 'sort' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Price Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('price')}
                                        className={`hover:shadow-soft group flex items-center gap-1.5 border px-3 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                                            expandedSection === 'price'
                                                ? 'shadow-elevated border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span>Price</span>
                                        {(filters.priceMin !== undefined ||
                                            filters.priceMax !== undefined) && (
                                            <span className="flex h-4 w-4 items-center justify-center bg-black text-[10px] font-black text-white group-hover:scale-110 sm:h-5 sm:w-5 sm:text-xs">
                                                1
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 sm:h-4 sm:w-4 ${expandedSection === 'price' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Gender Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => toggleSection('gender')}
                                        className={`hover:shadow-soft group flex items-center gap-1.5 border px-3 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                                            expandedSection === 'gender'
                                                ? 'shadow-elevated border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span>Gender</span>
                                        {filters.gender &&
                                            filters.gender.length > 0 && (
                                                <span className="flex h-4 w-4 items-center justify-center bg-black text-[10px] font-black text-white group-hover:scale-110 sm:h-5 sm:w-5 sm:text-xs">
                                                    {filters.gender.length}
                                                </span>
                                            )}
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 sm:h-4 sm:w-4 ${expandedSection === 'gender' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>

                                {/* Categories Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            toggleSection('categories')
                                        }
                                        className={`hover:shadow-soft group flex items-center gap-1.5 border px-3 py-2 text-xs font-bold tracking-wide uppercase transition-all duration-300 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm ${
                                            expandedSection === 'categories'
                                                ? 'shadow-elevated border-black bg-black text-white'
                                                : 'border-gray-300 bg-white text-black hover:border-black'
                                        }`}
                                    >
                                        <span className="xs:inline hidden sm:inline">
                                            Categories
                                        </span>
                                        <span className="xs:hidden inline sm:hidden">
                                            Cat.
                                        </span>
                                        {filters.categories.length > 0 && (
                                            <span className="flex h-4 w-4 items-center justify-center bg-black text-[10px] font-black text-white group-hover:scale-110 sm:h-5 sm:w-5 sm:text-xs">
                                                {filters.categories.length}
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={14}
                                            className={`transition-transform duration-300 sm:h-4 sm:w-4 ${expandedSection === 'categories' ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {/* Right: Active Filters & Clear */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {hasActiveFilters && (
                                    <>
                                        <div className="hidden items-center gap-2 lg:flex">
                                            <span className="text-xs font-semibold text-gray-600 sm:text-sm">
                                                {activeFilterCount}{' '}
                                                {activeFilterCount === 1
                                                    ? 'filter'
                                                    : 'filters'}{' '}
                                                active
                                            </span>
                                        </div>
                                        <button
                                            onClick={onClearFilters}
                                            className="shadow-soft hover:shadow-elevated group flex items-center gap-1.5 border border-red-600 bg-red-600 px-3 py-2 text-xs font-bold tracking-wide text-white uppercase transition-all duration-300 hover:bg-red-700 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
                                        >
                                            <X
                                                size={14}
                                                strokeWidth={2}
                                                className="sm:h-4 sm:w-4"
                                            />
                                            <span className="hidden sm:inline">
                                                Clear All
                                            </span>
                                            <span className="inline sm:hidden">
                                                Clear
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Active Filter Tags */}
                        {selectedCategories.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pb-4">
                                <span className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                                    Active:
                                </span>
                                {selectedCategories.map((category) => (
                                    <button
                                        key={category.id}
                                        onClick={() =>
                                            handleCategoryToggle(category.id)
                                        }
                                        className="group inline-flex items-center gap-1.5 border border-black bg-black px-3 py-1 text-xs font-semibold text-white uppercase transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black active:scale-95"
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
                    <div className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50">
                        <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-16 xl:px-24">
                            <div className="py-8">
                                {/* Sort Options */}
                                {expandedSection === 'sort' && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    onFilterChange({
                                                        sortBy: option.value as Filters['sortBy'],
                                                    });
                                                    setExpandedSection(null);
                                                }}
                                                className={`hover:shadow-soft border px-5 py-4 text-sm font-semibold uppercase transition-all duration-300 ${
                                                    filters.sortBy ===
                                                    option.value
                                                        ? 'shadow-elevated border-black bg-black text-white'
                                                        : 'border-gray-300 bg-white text-black hover:border-black'
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
                                                onClick={() =>
                                                    handlePriceSelect(
                                                        range.min,
                                                        range.max,
                                                    )
                                                }
                                                className={`hover:shadow-soft border px-5 py-4 text-sm font-semibold uppercase transition-all duration-300 ${
                                                    filters.priceMin ===
                                                        range.min &&
                                                    filters.priceMax ===
                                                        range.max
                                                        ? 'shadow-elevated border-black bg-black text-white'
                                                        : 'border-gray-300 bg-white text-black hover:border-black'
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
                                                onClick={() =>
                                                    handleGenderToggle(
                                                        gender.value,
                                                    )
                                                }
                                                className={`hover:shadow-soft border px-5 py-4 text-sm font-semibold uppercase transition-all duration-300 ${
                                                    filters.gender?.includes(
                                                        gender.value,
                                                    )
                                                        ? 'shadow-elevated border-black bg-black text-white'
                                                        : 'border-gray-300 bg-white text-black hover:border-black'
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
                                                onClick={() =>
                                                    handleCategoryToggle(
                                                        category.id,
                                                    )
                                                }
                                                className={`hover:shadow-soft border px-5 py-4 text-sm font-semibold uppercase transition-all duration-300 ${
                                                    filters.categories.includes(
                                                        category.id,
                                                    )
                                                        ? 'shadow-elevated border-black bg-black text-white'
                                                        : 'border-gray-300 bg-white text-black hover:border-black'
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
