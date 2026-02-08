import type { Product, Creator } from '../types';

export const creators: Creator[] = [
    {
        id: 'c1',
        name: 'Satoshi Nakamoto Clone',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Satoshi',
        banner: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200',
        bio: 'Digital nomad and crypto enthusiast designing for the decentralized future.',
        followers: 12500,
        socials: { twitter: '@satoshi_clone', website: 'https://satoshi.mech' }
    },
    {
        id: 'c2',
        name: 'Amu-Chan',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amu',
        banner: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=1200',
        bio: 'Anime artist specializing in mecha and cyberpunk aesthetics.',
        followers: 8900,
        socials: { instagram: '@amuchan_art' }
    }
];

export const products: Product[] = [
    {
        id: 'p1',
        title: 'Nakamoto Genesis Hoodie',
        price: 89.99,
        description: 'A heavyweight premium hoodie featuring the original Bitcoin genesis block hash in minimalist typography.',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
        images: [
            'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Crypto Brands',
        creatorId: 'c1',
        creatorName: 'Satoshi Nakamoto Clone',
        creatorBadge: 'Verified Dev',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        isLimited: true,
        hypeLevel: 'High',
        chain: 'Ethereum',
        reviews: [
            { id: 'r1', userName: 'VitalikF', rating: 5, comment: 'Incredible quality, fast shipping!', date: '2024-01-15' }
        ],
        details: {
            materials: '80% Organic Cotton, 20% Recycled Polyester',
            designStory: 'The hash of the first block in the Bitcoin blockchain represents the birth of a new era. We wanted to celebrate that with a clean, wearable design.'
        }
    },
    {
        id: 'p2',
        title: 'Mecha-01 Oversized Tee',
        price: 45.00,
        description: 'Cyberpunk inspired oversized tee with intricate mecha line art on the back.',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
        images: [
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Anime Series',
        creatorId: 'c2',
        creatorName: 'Amu-Chan',
        creatorBadge: 'Top Artist',
        sizes: ['M', 'L', 'XL'],
        isLimited: false,
        hypeLevel: 'Medium',
        anime: 'Cyberpunk 2077',
        reviews: [],
        details: {
            materials: '100% Cotton',
            designStory: 'Inspired by the classic mecha designs of the 90s, updated with a modern cyberpunk twist.'
        }
    },
    {
        id: 'p3',
        title: 'Solana Summer Kimono',
        price: 120.00,
        description: 'Flowy traditional kimono with a futuristic Solana gradient and mesh panels.',
        image: 'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=600',
        images: [
            'https://images.unsplash.com/photo-1578632292335-df3abbb0d586?auto=format&fit=crop&q=80&w=600'
        ],
        category: 'Limited Edition',
        creatorId: 'c1',
        creatorName: 'Satoshi Nakamoto Clone',
        creatorBadge: 'Featured',
        sizes: ['One Size'],
        isLimited: true,
        hypeLevel: 'Legendary',
        chain: 'Solana',
        reviews: [],
        details: {
            materials: 'Sustainable Silk Alternative',
            designStory: 'The speed and energy of Solana captured in a traditional Japanese garment.'
        }
    }
];
