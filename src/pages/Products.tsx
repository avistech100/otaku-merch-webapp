import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products } from '../data/mockData';
import ProductCard from '../components/product/ProductCard';
import { FaChevronDown } from 'react-icons/fa';

const Products: React.FC = () => {
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');

    const [selectedChain, setSelectedChain] = useState<string>('All');
    const [selectedSort, setSelectedSort] = useState<string>('Newest');

    const filteredProducts = useMemo(() => {
        let result = products;

        if (categoryParam) {
            result = result.filter(p => p.category === categoryParam);
        }

        if (selectedChain !== 'All') {
            result = result.filter(p => p.chain === selectedChain);
        }

        if (selectedSort === 'Price: Low to High') {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (selectedSort === 'Price: High to Low') {
            result = [...result].sort((a, b) => b.price - a.price);
        }

        return result;
    }, [categoryParam, selectedChain, selectedSort]);

    return (
        <div className="layout-container py-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase text-primary-black">
                        {categoryParam || 'All Products'}
                    </h1>
                    <p className="text-primary-dark-gray/60 font-medium">Showing {filteredProducts.length} items</p>
                </div>

                {/* Filters & Sorting */}
                <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:flex-none">
                        <select
                            value={selectedChain}
                            onChange={(e) => setSelectedChain(e.target.value)}
                            className="input-select pr-12 w-full cursor-pointer font-bold focus:ring-2 focus:ring-accent-crypto text-primary-black"
                        >
                            <option>All Chains</option>
                            <option>Ethereum</option>
                            <option>Solana</option>
                            <option>Polygon</option>
                        </select>
                        <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-dark-gray/30" size={12} />
                    </div>

                    <div className="relative group flex-1 md:flex-none">
                        <select
                            value={selectedSort}
                            onChange={(e) => setSelectedSort(e.target.value)}
                            className="input-select pr-12 w-full cursor-pointer font-bold focus:ring-2 focus:ring-accent-anime text-primary-black"
                        >
                            <option>Newest</option>
                            <option>Price: Low to High</option>
                            <option>Price: High to Low</option>
                        </select>
                        <FaChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary-dark-gray/30" size={12} />
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
