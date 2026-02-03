import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/product/ProductCard';
import { FaChevronDown } from 'react-icons/fa';

const Products: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedChain, setSelectedChain] = useState<string>('All');
    const [selectedSort, setSelectedSort] = useState<string>('Newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch categories
                const { data: catData } = await supabase.from('categories').select('*');
                if (catData) setCategories(catData);

                // Fetch products (approved status)
                const { data: prodData } = await supabase
                    .from('products')
                    .select(`
                        *,
                        product_images(src, alt_text)
                    `)
                    .eq('status', 'approved');

                if (prodData) {
                    const mappedProducts = prodData.map(p => ({
                        id: p.id,
                        title: p.title,
                        price: p.price,
                        description: p.description,
                        image: p.product_images?.[0]?.src || '',
                        category: catData?.find(c => c.id === p.category_id)?.name || '',
                        isLimited: p.is_limited_edition,
                        hypeLevel: p.hype_score > 80 ? 'Legendary' : p.hype_score > 50 ? 'High' : 'Medium',
                        chain: p.crypto_chain
                    }));
                    setProducts(mappedProducts);
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (categoryParam) {
            result = result.filter(p => p.category === categoryParam);
        }

        if (searchParam) {
            const query = searchParam.toLowerCase();
            result = result.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description?.toLowerCase().includes(query)
            );
        }

        if (selectedChain !== 'All') {
            result = result.filter(p => p.chain === selectedChain);
        }

        // Price Filter
        result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

        if (selectedSort === 'Price: Low to High') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (selectedSort === 'Price: High to Low') {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        return result;
    }, [products, categoryParam, searchParam, selectedChain, selectedSort, priceRange]);

    const chains = useMemo(() => {
        const uniqueChains = Array.from(new Set(products.map(p => p.chain).filter(Boolean)));
        return ['All', ...uniqueChains];
    }, [products]);

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center font-black text-4xl animate-pulse">
                OTAKU <span className="text-accent ml-2">LOADING...</span>
            </div>
        );
    }

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <div className="flex flex-col gap-8 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase text-primary-black">
                            {searchParam ? `Results for "${searchParam}"` : categoryParam || 'All Products'}
                        </h1>
                        <p className="text-primary-dark-gray/60 font-medium">Showing {filteredProducts.length} items</p>
                    </div>

                    {/* Filters & Sorting */}
                    <div className="flex flex-wrap gap-4 w-full md:w-auto items-center">
                        {/* Price Range */}
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200">
                            <span className="text-xs font-bold text-gray-500">Price:</span>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-16 text-sm font-bold outline-none border-b border-gray-200 focus:border-black"
                            />
                            <span className="text-gray-400">-</span>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-16 text-sm font-bold outline-none border-b border-gray-200 focus:border-black"
                            />
                        </div>

                        <div className="relative group flex-1 md:flex-none">
                            <select
                                value={selectedChain}
                                onChange={(e) => setSelectedChain(e.target.value)}
                                className="input-select pr-12 w-full cursor-pointer font-bold focus:ring-2 focus:ring-accent-crypto text-primary-black min-w-[140px]"
                            >
                                <option value="All">All Chains</option>
                                {chains.filter(c => c !== 'All').map(chain => (
                                    <option key={chain} value={chain}>{chain}</option>
                                ))}
                            </select>
                            <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-dark-gray/30" size={12} />
                        </div>

                        <div className="relative group flex-1 md:flex-none">
                            <select
                                value={selectedSort}
                                onChange={(e) => setSelectedSort(e.target.value)}
                                className="input-select pr-12 w-full cursor-pointer font-bold focus:ring-2 focus:ring-accent-anime text-primary-black min-w-[160px]"
                            >
                                <option>Newest</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                            <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-dark-gray/30" size={12} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
                <div className="grid-products">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="py-40 text-center animate-slideUp">
                    <h2 className="text-2xl font-black text-primary-dark-gray/20 mb-4 uppercase tracking-tighter">No Products Found</h2>
                    <button
                        onClick={() => { setSelectedChain('All'); }}
                        className="text-accent-anime font-bold underline decoration-accent-anime/30 underline-offset-4 hover:text-primary-black transition-all"
                    >
                        Clear all filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Products;

