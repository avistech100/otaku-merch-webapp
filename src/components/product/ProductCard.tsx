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
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-grow min-w-0">
                        <p className="text-[10px] font-bold text-primary-dark-gray/60 uppercase tracking-widest mb-1">
                            {product.creatorBadge}
                        </p>
                        <h3 className="font-bold text-base group-hover:text-accent-crypto transition-all truncate pr-2 text-primary-black">
                            {product.title}
                        </h3>
                    </div>
                </div>
                <div className="mt-auto">
                    <p className="font-black text-lg text-primary-black">
                        ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-5 h-5 bg-bg-light rounded-full overflow-hidden">
                            <img
                                src={product.creatorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${product.creatorId}`}
                                alt="Creator"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-[10px] text-primary-dark-gray/60 font-medium tracking-tight">by {product.creatorName}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
