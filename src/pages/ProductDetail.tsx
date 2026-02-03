import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/useCartStore';
import ProductCard from '../components/product/ProductCard';
import { FaMinus, FaPlus, FaCheck, FaStar, FaChevronLeft } from 'react-icons/fa';
import CommentSection from '../components/product/CommentSection';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<any>(null);
    const [variants, setVariants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const addItem = useCartStore(state => state.addItem);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('Description');

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            try {
                // Fetch product with images and variants
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        product_images(*),
                        product_variants(*),
                        categories(name)
                    `)
                    .eq('id', id)
                    .single();

                if (data) {
                    const mainImage = data.image_url;
                    const additionalImages = data.additional_images || [];
                    const allImages = [mainImage, ...additionalImages].filter(Boolean);

                    const mappedProduct = {
                        id: data.id,
                        title: data.title,
                        price: data.price,
                        description: data.description,
                        images: allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600'],
                        category: data.categories?.name || 'Uncategorized',
                        creatorId: data.creator_id,
                        isLimited: data.is_limited_edition,
                        sizes: data.variants?.map((v: any) => v.name).filter(Boolean) || [],
                        details: {
                            materials: data.metadata?.materials || 'Premium materials',
                            designStory: data.story || 'No story provided'
                        },
                        reviews: []
                    };
                    setProduct(mappedProduct);
                    setVariants(data.variants || []);

                    // Fetch related products
                    const { data: related } = await supabase
                        .from('products')
                        .select('*, product_images(src)')
                        .eq('category_id', data.category_id)
                        .neq('id', id)
                        .limit(4);

                    if (related) {
                        setRelatedProducts(related.map(r => ({
                            id: r.id,
                            title: r.title,
                            price: r.price,
                            image: r.product_images?.[0]?.src || '',
                        })));
                    }
                }
            } catch (err) {
                console.error("Error fetching product:", err);
            } finally {
                setLoading(false);
            }
        }

        if (id) {
            fetchProduct();

            // Real-time Subscription for Inventory Updates
            const channel = supabase
                .channel(`product-variants-${id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'product_variants',
                        filter: `product_id=eq.${id}`
                    },
                    (payload) => {
                        console.log('Inventory updated:', payload);
                        setVariants(current =>
                            current.map(v => v.id === payload.new.id ? payload.new : v)
                        );
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [id]);


    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center font-black text-4xl animate-pulse">
                OTAKU <span className="text-accent ml-2">LOADING...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="layout-container py-40 text-center animate-fadeIn">
                <h2 className="text-4xl font-black mb-8 text-primary-black uppercase tracking-tighter">Product Not Found</h2>
                <Link to="/products" className="btn-primary inline-block">RETURN TO SHOP</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.sizes.length > 0 && !selectedSize) {
            alert('Please select a size');
            return;
        }
        addItem(product, selectedSize);
    };

    return (
        <div className="layout-container py-12 animate-fadeIn">
            {/* Breadcrumb */}
            <Link to="/products" className="flex items-center gap-2 text-primary-dark-gray/60 font-bold mb-12 hover:text-primary-black transition-all">
                <FaChevronLeft size={12} /> BACK TO COLLECTION
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
                {/* Left: Images */}
                <div className="space-y-6">
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-bg-light border border-bg-light shadow-sm">
                        <img
                            src={product.images[activeImage]}
                            alt={product.title}
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {product.images.map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-accent-anime' : 'border-transparent hover:border-bg-light'}`}
                            >
                                <img src={img} alt={`${product.title} view ${idx}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="flex flex-col justify-center">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            {product.isLimited && (
                                <span className="badge-limited">LIMITED EDITION</span>
                            )}
                            <span className="text-accent-crypto font-black text-xs uppercase tracking-widest">{product.category}</span>
                        </div>
                        <h1 className="text-5xl font-black mb-4 tracking-tighter uppercase leading-none text-primary-black">{product.title}</h1>
                        <div className="flex items-center gap-6">
                            <p className="text-4xl font-black text-primary-black">${Number(product.price).toFixed(2)}</p>
                            <div className="flex items-center gap-1 text-accent-warning">
                                <FaStar /> <span className="text-primary-black font-bold ml-1">4.9</span> <span className="text-primary-dark-gray/60 font-medium ml-1 text-sm">(Verified)</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-primary-dark-gray/60 text-lg mb-10 leading-relaxed font-medium">
                        {product.description}
                    </p>

                    {/* Size Selector */}
                    {product.sizes.length > 0 && (
                        <div className="mb-10">
                            <div className="flex justify-between items-end mb-4">
                                <h4 className="font-black text-sm uppercase tracking-widest text-primary-black">Select Size</h4>
                                <button className="text-primary-dark-gray/60 text-xs font-bold underline hover:text-primary-black">Size Guide</button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {product.sizes.map((size: string) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-14 rounded-full border-2 font-black transition-all flex items-center justify-center
                        ${selectedSize === size ? 'border-accent-anime bg-accent-anime text-primary-white' : 'border-bg-light hover:border-primary-black text-primary-black'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity & Add to Cart */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-12">
                        <div className="flex items-center border-2 border-bg-light rounded-full px-4 py-3 h-16 sm:w-40 justify-between text-primary-black font-bold">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:text-accent-anime transition-all p-2"><FaMinus size={12} /></button>
                            <span className="font-black text-xl">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="hover:text-accent-anime transition-all p-2"><FaPlus size={12} /></button>
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 btn-primary h-16 rounded-full flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl shadow-black/10"
                        >
                            Add to Cart
                        </button>
                    </div>

                    <button className="w-full bg-accent-anime text-primary-white font-black text-lg h-16 rounded-full hover:brightness-110 shadow-xl shadow-accent-anime/20 transition-all uppercase tracking-widest">
                        Buy Now
                    </button>

                    {/* Creator Badge */}
                    <div className="flex items-center gap-4 p-6 bg-bg-light/50 rounded-3xl border border-bg-light">
                        <div className="w-12 h-12 bg-primary-white rounded-full overflow-hidden shadow-sm">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${product.creatorId || 'default'}`} alt="Creator" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-accent-crypto uppercase tracking-widest">Verified Creator</p>
                            <h4 className="font-bold flex items-center gap-2 uppercase text-primary-black">CreativeLabs <FaCheck className="text-accent-crypto" size={10} /></h4>
                        </div>
                        <Link to={`/products`} className="ml-auto text-xs font-black border-b border-primary-black hover:text-accent-crypto hover:border-accent-crypto transition-all">VIEW ALL PRODUCTS</Link>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <section className="mb-24 animate-slideUp">
                <div className="flex border-b border-bg-light mb-10 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {['Description', 'Materials', 'Reviews', 'Design Story'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-10 py-5 font-black text-sm uppercase tracking-widest border-b-2 transition-all
                ${activeTab === tab ? 'border-accent-anime text-primary-black' : 'border-transparent text-primary-dark-gray/40 hover:text-primary-black'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="max-w-3xl">
                    {activeTab === 'Description' && (
                        <div className="space-y-6 text-primary-dark-gray/70 text-lg font-medium leading-relaxed">
                            <p>{product.description}</p>
                            <p>Crafted for the digital vanguard, this piece combines street aesthetics with high-grade fabrication.</p>
                        </div>
                    )}
                    {activeTab === 'Materials' && (
                        <p className="text-primary-dark-gray/70 text-lg font-medium leading-relaxed">{product.details.materials}</p>
                    )}
                    {activeTab === 'Design Story' && (
                        <p className="text-primary-dark-gray/70 text-lg font-medium leading-relaxed">{product.details.designStory}</p>
                    )}
                    {activeTab === 'Reviews' && (
                        <CommentSection productId={id!} />
                    )}
                </div>
            </section>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <section className="animate-slideUp">
                    <h2 className="text-4xl font-black mb-12 tracking-tighter uppercase text-primary-black">You May Also Like</h2>
                    <div className="grid-products">
                        {relatedProducts.map((p: any) => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProductDetail;

