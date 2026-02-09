import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useCallback, useEffect, useState } from 'react';

interface BannerSlide {
    id: number;
    image: string;
    title: string;
    subtitle: string;
    cta?: string;
    ctaLink?: string;
}

interface ApiBanner {
    id: number;
    header: string;
    description?: string;
    image_url?: string;
}

interface BannerCarouselProps {
    slides?: BannerSlide[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

const defaultSlides: BannerSlide[] = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'PURE ELEGANCE',
        subtitle: 'Minimalist clothing for the modern style',
        cta: 'EXPLORE',
        ctaLink: '#products',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'NOIR COLLECTION',
        subtitle: 'Where simplicity meets sophistication',
        cta: 'DISCOVER',
        ctaLink: '#products',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1542834369-7daefed8d178?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80',
        title: 'LIMITED EDITION',
        subtitle: 'Exclusive black & white designs',
        cta: 'SHOP NOW',
        ctaLink: '#products',
    },
];

// Transform API banner data to carousel slide format
const transformBannerToSlide = (banner: ApiBanner): BannerSlide => ({
    id: banner.id,
    image: banner.image_url || defaultSlides[0].image,
    title: banner.header,
    subtitle: banner.description || '',
    cta: 'EXPLORE',
    ctaLink: '#products',
});

/**
 * Hero banner carousel with smooth transitions and auto-play
 * Features dynamic slides from API with fallback to default slides
 */
export const BannerCarousel = memo(
    ({
        slides: propSlides,
        autoPlay = true,
        autoPlayInterval = 5000,
    }: BannerCarouselProps) => {
        const [currentSlide, setCurrentSlide] = useState(0);
        const [isHovered, setIsHovered] = useState(false);
        const [slides, setSlides] = useState<BannerSlide[]>(propSlides || []);
        const [isLoading, setIsLoading] = useState(!propSlides);

        const nextSlide = useCallback(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, [slides.length]);

        const prevSlide = useCallback(() => {
            setCurrentSlide(
                (prev) => (prev - 1 + slides.length) % slides.length,
            );
        }, [slides.length]);

        const goToSlide = useCallback((index: number) => {
            setCurrentSlide(index);
        }, []);

        // Fetch banners from API if not provided via props
        useEffect(() => {
            if (propSlides) {
                setSlides(propSlides);
                setIsLoading(false);
                return;
            }

            const fetchBanners = async () => {
                try {
                    const response = await fetch('/api/banners/active');
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data.length > 0) {
                            const transformedSlides = data.data.map(
                                transformBannerToSlide,
                            );
                            setSlides(transformedSlides);
                        } else {
                            // No banners found - show empty array instead of default slides
                            setSlides([]);
                        }
                    } else {
                        // API error - show empty array instead of default slides
                        setSlides([]);
                    }
                } catch (error) {
                    console.error('Error fetching banners:', error);
                    // Network error - show empty array instead of default slides
                    setSlides([]);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchBanners();
        }, [propSlides]);

        // Auto-play functionality
        useEffect(() => {
            if (!autoPlay || isHovered || isLoading) return;

            const interval = setInterval(nextSlide, autoPlayInterval);
            return () => clearInterval(interval);
        }, [autoPlay, autoPlayInterval, nextSlide, isHovered, isLoading]);

        if (isLoading) {
            return (
                <div className="relative flex h-96 w-full items-center justify-center bg-black sm:h-[28rem] lg:h-[32rem]">
                    <div className="text-center text-white">
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin border-4 border-white border-t-transparent"></div>
                        <p className="font-medium tracking-widest uppercase">
                            LOADING...
                        </p>
                    </div>
                </div>
            );
        }

        // If no slides available, show minimalist empty state
        if (slides.length === 0) {
            return (
                <div className="relative flex h-96 w-full items-center justify-center bg-black sm:h-[28rem] lg:h-[32rem]">
                    <div className="text-center text-white">
                        <div className="mb-6">
                            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center border-4 border-white">
                                <svg
                                    className="h-12 w-12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="square"
                                        strokeLinejoin="miter"
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mb-2 text-2xl font-black tracking-tighter uppercase">
                            NO BANNERS
                        </h2>
                        <p className="font-medium tracking-wide uppercase opacity-60">
                            CONTENT COMING SOON
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div
                className="relative h-96 w-full overflow-hidden bg-black sm:h-[28rem] lg:h-[32rem]"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="region"
                aria-label="Featured content carousel"
            >
                {/* Slides Container */}
                <div
                    className="flex h-full transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            className="relative flex h-full min-w-full items-center justify-center"
                        >
                            {/* Background Image - Grayscale */}
                            <div className="absolute inset-0">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="h-full w-full object-cover grayscale"
                                    style={{
                                        filter: 'grayscale(100%) contrast(1.2)',
                                    }}
                                    loading="lazy"
                                />
                                {/* Strong Black Overlay */}
                                <div className="absolute inset-0 bg-black opacity-60" />
                            </div>

                            {/* Content - Split Layout */}
                            <div className="relative z-10 w-full px-6 sm:px-12 lg:px-24">
                                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-2">
                                    {/* Left Side - Text */}
                                    <div className="text-center lg:text-left">
                                        {/* Slide Counter */}
                                        <div className="mb-4 inline-block border-2 border-white px-4 py-1">
                                            <span className="font-black tracking-widest text-white uppercase">
                                                {String(index + 1).padStart(
                                                    2,
                                                    '0',
                                                )}{' '}
                                                /{' '}
                                                {String(slides.length).padStart(
                                                    2,
                                                    '0',
                                                )}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="mb-4 text-4xl leading-tight font-black tracking-tighter text-white uppercase sm:text-5xl lg:text-7xl">
                                            {slide.title}
                                        </h2>

                                        {/* Decorative Line */}
                                        <div className="mx-auto mb-6 h-1 w-24 bg-white lg:mx-0" />

                                        {/* Subtitle */}
                                        <p className="mb-8 text-base font-medium tracking-wide text-white/90 uppercase sm:text-lg">
                                            {slide.subtitle}
                                        </p>

                                        {/* CTA Button */}
                                        {slide.cta && (
                                            <button
                                                onClick={() => {
                                                    if (
                                                        slide.ctaLink?.startsWith(
                                                            '#',
                                                        )
                                                    ) {
                                                        document
                                                            .querySelector(
                                                                slide.ctaLink,
                                                            )
                                                            ?.scrollIntoView({
                                                                behavior:
                                                                    'smooth',
                                                            });
                                                    }
                                                }}
                                                className="group relative inline-block border-2 border-white bg-transparent px-10 py-4 font-black tracking-widest text-white uppercase transition-all duration-300 hover:bg-white hover:text-black focus:ring-4 focus:ring-white focus:outline-none"
                                                aria-label={`${slide.cta} - ${slide.title}`}
                                            >
                                                {slide.cta}
                                                <span className="absolute bottom-0 left-0 -z-10 h-0 w-full bg-white transition-all duration-300 group-hover:h-full" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Right Side - Geometric Shape */}
                                    <div className="hidden justify-center lg:flex">
                                        <div className="relative h-64 w-64 border-4 border-white">
                                            <div className="absolute -right-4 -bottom-4 h-64 w-64 border-4 border-white/50" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Navigation Arrows - Sharp Design */}
                <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-4 -translate-y-1/2 border-2 border-white bg-black/50 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black focus:ring-2 focus:ring-white focus:outline-none sm:left-8 sm:p-4"
                    aria-label="Previous slide"
                >
                    <ChevronLeft size={24} strokeWidth={3} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-4 -translate-y-1/2 border-2 border-white bg-black/50 p-3 backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-black focus:ring-2 focus:ring-white focus:outline-none sm:right-8 sm:p-4"
                    aria-label="Next slide"
                >
                    <ChevronRight size={24} strokeWidth={3} />
                </button>

                {/* Slide Indicators - Square Design */}
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-3 w-3 border-2 border-white transition-all duration-300 focus:ring-2 focus:ring-white focus:outline-none ${
                                index === currentSlide
                                    ? 'scale-125 bg-white'
                                    : 'bg-transparent hover:bg-white/50'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="absolute right-0 bottom-0 left-0 h-1 bg-white/20">
                    <div
                        className="h-full bg-white transition-all duration-100 ease-linear"
                        style={{
                            width:
                                autoPlay && !isHovered
                                    ? `${((currentSlide + 1) / slides.length) * 100}%`
                                    : '0%',
                        }}
                    />
                </div>
            </div>
        );
    },
);

BannerCarousel.displayName = 'BannerCarousel';
