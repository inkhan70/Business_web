
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FavoriteBusiness {
    id: string;
    name: string;
    address: string;
    image?: string;
    dataAiHint?: string;
}

interface FavoritesContextType {
    favorites: FavoriteBusiness[];
    addFavorite: (business: FavoriteBusiness) => void;
    removeFavorite: (businessId: string) => void;
    isFavorite: (businessId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
    const [favorites, setFavorites] = useState<FavoriteBusiness[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem('guestFavorites');
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error("Failed to load favorites from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('guestFavorites', JSON.stringify(favorites));
        } catch (error) {
            console.error("Failed to save favorites to localStorage", error);
        }
    }, [favorites]);

    const addFavorite = (business: FavoriteBusiness) => {
        setFavorites(prev => [...prev, business]);
    };

    const removeFavorite = (businessId: string) => {
        setFavorites(prev => prev.filter(b => b.id !== businessId));
    };

    const isFavorite = (businessId: string) => {
        return favorites.some(b => b.id === businessId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};
