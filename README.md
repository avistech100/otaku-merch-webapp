# Otaku Merch 🚀

A premium, responsive e-commerce marketplace for Web3 and Anime-themed clothing. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features

- **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop.
- **Modern Tech Stack**: React 19, Vite, TypeScript, Tailwind CSS v4.
- **State Management**: Zustand for seamless shopping cart experience with `localStorage` persistence.
- **Interactive UI**: Custom animations, hover effects, and responsive navigation.
- **Comprehensive E-commerce Flow**:
  - **Homepage**: Hero slider, featured collections, and creator spotlight.
  - **Product Listing**: Advanced filtering (by Chain) and sorting.
  - **Product Details**: Multi-image gallery, size selector, and tabbed info.
  - **Cart**: Real-time updates, quantity management, and subtotal calculation.
  - **Checkout**: Multi-step simulation (Shipping > Payment > Review).
  - **Creator Profiles**: Detailed creator bios, stats, and dedicated collections.

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) (with TypeScript)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **Routing**: [React Router DOM](https://reactrouter.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository or extract the files.
2. Navigate to the project directory:
   ```bash
   cd "Otaku Mech"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```bash
src/
├── components/
│   ├── layout/    # Navbar, Footer, Layout
│   ├── product/   # ProductCard
│   └── ui/        # Reusable UI components
├── pages/         # Home, Products, Detail, Cart, etc.
├── store/         # Zustand cart store
├── data/          # Mock data and constants
├── types/         # TypeScript interfaces
└── App.tsx        # Routing and main entry
```

## 📝 Note

This project uses mock data provided in `src/data/mockData.ts`. The checkout process is a UI simulation and does not process actual payments.

---
Designed with ❤️ for the Otaku and Web3 communities.
