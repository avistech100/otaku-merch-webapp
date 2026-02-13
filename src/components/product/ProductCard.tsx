import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addItem = useCartStore((state) => state.addItem);

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, product.sizes[0]);
    };

    return (
        <Link
            to={`/product/${product.id}`}
            className="card-product group animate-fadeIn"
        >
            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden">
                <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isLimited && (
                        <span className="badge-limited">
                            Limited
                        </span>
                    )}
                    {product.hypeLevel === 'Legendary' && (
                        <span className="badge-trending">
                            Legendary
                        </span>
                    )}
                </div>

                {/* Action Buttons (Overlay) */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="bg-primary-white p-3 rounded-full shadow-lg hover:text-accent-anime transition-all">
                        <FaHeart size={18} />
                    </button>
                    <button
                        onClick={handleQuickAdd}
                        className="bg-primary-black text-primary-white p-3 rounded-full shadow-lg hover:bg-accent-crypto transition-all"
                    >
                        <FaShoppingBag size={18} />
                    </button>
                </div>
            </div>

            {/* Product Details */}
            <div className="p-3 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex-grow min-w-0">
                        <p className="text-[8px] font-black text-primary-dark-gray/30 uppercase tracking-[0.2em] mb-0.5">
                            {product.creatorBadge || 'Verified Creator'}
                        </p>
                        <h3 className="font-normal text-xs group-hover:text-accent-crypto transition-all text-primary-black leading-tight">
                            {product.title}
                        </h3>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="font-black text-base text-primary-black">
                        ${product.price.toFixed(2)}
                    </p>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
