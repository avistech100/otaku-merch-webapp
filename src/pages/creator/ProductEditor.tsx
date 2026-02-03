import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import FileUpload from '../../components/shared/FileUpload';
import { FaSave, FaSpinner, FaArrowLeft, FaTimes, FaPlus, FaTag, FaBox, FaLayerGroup } from 'react-icons/fa';

const CATEGORIES = ['T-Shirts', 'Hoodies', 'Accessories', 'Art Prints', 'Collectibles'];
const SIZES = ['S', 'M', 'L', 'XL', '2XL'];

const ProductEditor: React.FC = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);

    // Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [comparePrice, setComparePrice] = useState('');
    const [sku, setSku] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [stockQuantity, setStockQuantity] = useState('0');
    const [isLimitedEdition, setIsLimitedEdition] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Media
    const [images, setImages] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    // Variants
    const [hasVariants, setHasVariants] = useState(false);
    const [variants, setVariants] = useState<{ id?: string, name: string, price: number, stock: number }[]>([]);

    useEffect(() => {
        if (isEditMode && user) {
            fetchProduct();
        }
    }, [isEditMode, user]);

    const fetchProduct = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching product:', error);
            return;
        }

        if (data) {
            setTitle(data.title);
            setDescription(data.description || '');
            setPrice(data.price.toString());
            setComparePrice(data.compare_price?.toString() || '');
            setSku(data.sku || '');
            setCategory(data.category);
            setStockQuantity(data.stock_quantity.toString());
            setIsLimitedEdition(data.is_limited_edition);
            setTags(data.tags || []);
            setImages([data.image_url, ...(data.additional_images || [])].filter(Boolean));

            if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
                setHasVariants(true);
                setVariants(data.variants);
            }
        }
        setFetching(false);
    };

    const handleSave = async (status: 'draft' | 'pending') => {
        if (!user) return;
        setLoading(true);

        try {
            let uploadedImageUrls: string[] = [];

            // Upload New Files with square ratio validation
            const { uploadProductImage } = await import('../../utils/imageUpload');

            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                try {
                    const url = await uploadProductImage(file, id || 'temp', images.length + i);
                    uploadedImageUrls.push(url);
                } catch (error: any) {
                    // Show error but continue with other uploads
                    alert(`Failed to upload ${file.name}: ${error.message}`);
                }
            }

            const finalImages = [...images, ...uploadedImageUrls];

            if (finalImages.length === 0) {
                alert('Please upload at least one product image');
                setLoading(false);
                return;
            }

            const mainImage = finalImages[0] || '';

            const productData = {
                title,
                description,
                price: parseFloat(price),
                compare_price: comparePrice ? parseFloat(comparePrice) : null,
                sku,
                category,
                stock_quantity: parseInt(stockQuantity),
                is_limited_edition: isLimitedEdition,
                tags,
                image_url: mainImage,
                additional_images: finalImages.slice(1),
                creator_id: user.id,
                status: status,
                variants: hasVariants ? variants : []
            };

            if (isEditMode) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert(productData);
                if (error) throw error;
            }

            navigate('/creator/products');

        } catch (error: any) {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addTag = () => {
        if (tagInput && !tags.includes(tagInput)) {
            setTags([...tags, tagInput]);
            setTagInput('');
        }
    };

    if (fetching) return <div className="animate-pulse p-10 font-black text-center text-4xl">INITIALIZING ASSET DATA...</div>;

    return (
        <div className="max-w-5xl mx-auto animate-fadeIn pb-32">
            {/* Header */}
            <div className="flex items-center gap-6 mb-12">
                <button onClick={() => navigate('/creator/products')} className="w-14 h-14 rounded-full bg-primary-white shadow-lg flex items-center justify-center hover:bg-primary-black hover:text-white transition-all group">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter text-primary-black mb-2">{isEditMode ? 'Modify Asset' : 'New Drop Injection'}</h1>
                    <p className="text-primary-dark-gray/60 font-medium uppercase tracking-[0.2em] text-xs">ID: {id || 'NEW_ENTRY_GENESIS'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Data */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <FaBox className="text-accent-anime" /> Core Specifications
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Product Title</label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="e.g. NAKAMOTO GENESIS HOODIE"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Description & Lore</label>
                                <textarea
                                    required
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="w-full h-48 p-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-medium outline-none resize-none"
                                    placeholder="Describe materials, fit, and the story behind this piece..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Inventory & Pricing */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                            <FaLayerGroup className="text-accent-crypto" /> Logistics & Valuation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Listing Price ($)</label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Compare Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={comparePrice}
                                    onChange={e => setComparePrice(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="0.00 (Optional)"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">SKU / Serial Number</label>
                                <input
                                    type="text"
                                    value={sku}
                                    onChange={e => setSku(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="OTKU-GEN-001"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Total Inventory Units</label>
                                <input
                                    type="number"
                                    required
                                    value={stockQuantity}
                                    onChange={e => setStockQuantity(e.target.value)}
                                    className="w-full h-14 px-6 rounded-2xl bg-bg-light/30 border-2 border-transparent focus:border-primary-black focus:bg-primary-white transition-all font-bold outline-none"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-6 p-6 rounded-2xl bg-bg-light/30">
                            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setIsLimitedEdition(!isLimitedEdition)}>
                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isLimitedEdition ? 'bg-primary-black border-primary-black' : 'border-primary-dark-gray/20'}`}>
                                    {isLimitedEdition && <FaTimes className="text-white text-xs" />}
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-primary-black">Limited Edition Asset</span>
                            </div>
                        </div>
                    </section>

                    {/* Variants */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                <FaLayerGroup className="text-accent-anime" /> Morphological Variants
                            </h3>
                            <button
                                type="button"
                                onClick={() => setHasVariants(!hasVariants)}
                                className={`w-14 h-8 rounded-full transition-all relative ${hasVariants ? 'bg-accent-anime shadow-lg shadow-accent-anime/30' : 'bg-bg-light'}`}
                            >
                                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${hasVariants ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {hasVariants && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="grid grid-cols-3 gap-4">
                                    <select className="col-span-1 h-12 bg-bg-light/30 rounded-xl px-4 text-xs font-black outline-none border border-transparent focus:border-primary-black" id="var-size">
                                        {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <input type="number" className="col-span-1 h-12 bg-bg-light/30 rounded-xl px-4 text-xs font-black outline-none border border-transparent focus:border-primary-black" placeholder="Stock" id="var-stock" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const size = (document.getElementById('var-size') as HTMLSelectElement).value;
                                            const stock = (document.getElementById('var-stock') as HTMLInputElement).value;
                                            if (size && stock) {
                                                setVariants([...variants, { name: size, price: parseFloat(price) || 0, stock: parseInt(stock) }]);
                                                (document.getElementById('var-stock') as HTMLInputElement).value = '';
                                            }
                                        }}
                                        className="col-span-1 bg-primary-black text-white rounded-xl flex items-center justify-center hover:bg-accent-anime transition-all"
                                    >
                                        <FaPlus />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {variants.map((v, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-bg-light">
                                            <span className="font-black text-xs">{v.name} - {v.stock} UNITS</span>
                                            <button onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="text-primary-dark-gray/40 hover:text-red-500">
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column - Organization & Media */}
                <div className="space-y-8">
                    {/* Media Setup */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-4">Visual Identity</h3>
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                            <p className="text-xs font-bold text-blue-600 flex items-center gap-2">
                                ⚠️ Images must be SQUARE (1:1 ratio)
                            </p>
                            <p className="text-[10px] text-primary-dark-gray/60 mt-1">
                                Max 5MB per image. JPG, PNG, or WebP only.
                            </p>
                        </div>
                        <FileUpload
                            onFilesSelected={setNewFiles}
                            maxFiles={5}
                            existingImages={images}
                            label="Inject Images"
                            onRemoveExisting={(url) => setImages(images.filter(img => img !== url))}
                        />
                    </section>

                    {/* Taxonomy */}
                    <section className="bg-primary-white p-10 rounded-[40px] shadow-xl shadow-black/5 border border-bg-light">
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Taxonomy</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Sector</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full h-12 px-6 rounded-xl bg-bg-light/30 font-black text-xs outline-none cursor-pointer border border-transparent focus:border-primary-black"
                                >
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-dark-gray/40 mb-2 block">Tags</label>
                                <div className="flex gap-2 mb-4">
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                        className="flex-1 h-12 px-6 rounded-xl bg-bg-light/30 font-bold text-xs outline-none border border-transparent focus:border-primary-black"
                                        placeholder="Add label..."
                                    />
                                    <button type="button" onClick={addTag} className="w-12 h-12 rounded-xl bg-bg-light flex items-center justify-center text-primary-dark-gray"><FaTag size={12} /></button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-primary-black text-white rounded-full text-[10px] font-black flex items-center gap-2">
                                            {tag}
                                            <FaTimes className="cursor-pointer" size={8} onClick={() => setTags(tags.filter(t => t !== tag))} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-primary-white/80 backdrop-blur-xl border border-white/20 p-4 rounded-full shadow-2xl flex items-center gap-4 z-50">
                <button
                    onClick={() => handleSave('draft')}
                    disabled={loading}
                    className="px-10 py-4 font-black uppercase tracking-widest text-xs text-primary-dark-gray hover:text-primary-black transition-all"
                >
                    Save Draft
                </button>
                <div className="w-px h-8 bg-primary-dark-gray/20" />
                <button
                    onClick={() => handleSave('pending')}
                    disabled={loading}
                    className="px-10 py-4 bg-primary-black text-white rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-accent-anime transition-all shadow-xl shadow-accent-anime/20"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    {isEditMode ? 'Authorize Update' : 'Initialize Mission'}
                </button>
            </div>
        </div>
    );
};

export default ProductEditor;
