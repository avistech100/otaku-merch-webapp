import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select(`
            *,
            product_images(src, alt_text),
            product_variants(*)
          `)
          .eq('status', 'approved');

        if (category) {
          // If category is name, we need to join or fetch category ID first
          const { data: catData } = await supabase
            .from('categories')
            .select('id')
            .eq('name', category)
            .single();
          
          if (catData) {
            query = query.eq('category_id', catData.id);
          }
        }

        const { data, error } = await query;

        if (error) throw error;

        const mappedProducts = data.map(p => ({
          id: p.id,
          title: p.title,
          price: p.price,
          description: p.description,
          image: p.product_images?.[0]?.src || 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
          category: category || 'General',
          isLimited: p.is_limited_edition,
          hypeLevel: p.hype_score > 80 ? 'Legendary' : 'Medium',
          chain: p.crypto_chain
        }));

        setProducts(mappedProducts);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
};
