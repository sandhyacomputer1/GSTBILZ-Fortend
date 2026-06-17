import React, { createContext, useEffect, useState, useCallback } from 'react';
import { fetchCategories } from '../Service/CategoryService';
import { fetchItems } from '../Service/ItemService';
import { fetchUserProfile } from '../Service/UserService';
import { getMySubscriptionStatus, getUnreadCount } from '../Service/NotificationService';

/**
 * React Context used across components to share categories, items, cart state, and authentication.
 */
export const AppContext = createContext(null);

export const AppContextProvider = (props) => {

    // Store for categories and inventory items
    const [categories, setCategories] = useState([]);
    const [itemData, setItemData] = useState([]);
    const [shopProfile, setShopProfile] = useState(null);

    // Theme Management
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("theme") || "dark";
    });

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            localStorage.setItem("theme", next);
            return next;
        });
    };

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const [headerName, setHeaderName] = useState(() => {
        return localStorage.getItem("headerName") || "GSTBLIZ";
    });

    const [favicon, setFavicon] = useState(() => {
        return localStorage.getItem("favicon") || null;
    });

    const updateBranding = (name, fav) => {
        if (name !== undefined && name !== null) {
            localStorage.setItem("headerName", name);
            setHeaderName(name);
        }
        if (fav !== undefined) {
            if (fav) {
                localStorage.setItem("favicon", fav);
                setFavicon(fav);
            } else {
                localStorage.removeItem("favicon");
                setFavicon(null);
            }
        }
    };

    const [settings, setSettings] = useState(() => {
        return {
            enableGst: localStorage.getItem("enableGst") !== "false",
            enableDiscount: localStorage.getItem("enableDiscount") !== "false",
            defaultGst: parseFloat(localStorage.getItem("defaultGst") || "18")
        };
    });

    const updateSettings = (newSettings) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            if (updated.enableGst !== undefined) localStorage.setItem("enableGst", String(updated.enableGst));
            if (updated.enableDiscount !== undefined) localStorage.setItem("enableDiscount", String(updated.enableDiscount));
            if (updated.defaultGst !== undefined) localStorage.setItem("defaultGst", String(updated.defaultGst));
            return updated;
        });
    };


    const [auth, setAuth] = useState(() => {
        return {
            token: localStorage.getItem("token"),
            role: localStorage.getItem("role")
        };
    });

    // Subscription status (for ShopOwner/Employee restriction)
    const [subscriptionInfo, setSubscriptionInfo] = useState(null);

    // Unread notification count (for bell badge)
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    const refreshSubscriptionStatus = useCallback(async () => {
        const role = localStorage.getItem("role");
        if (!localStorage.getItem("token") || role === "ROLE_SUPERADMIN") return;
        try {
            const res = await getMySubscriptionStatus();
            setSubscriptionInfo(res.data);
        } catch {
            // non-critical
        }
    }, []);

    const refreshUnreadCount = useCallback(async () => {
        if (!localStorage.getItem("token")) return;
        try {
            const res = await getUnreadCount();
            setUnreadNotifCount(res.data.count || 0);
        } catch {
            // non-critical
        }
    }, []);

    // State to hold items in the shopping cart
    const [cartItem, setCartItem] = useState([]);

    // States to manage the receipt overlay globally
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    /**
     * Add a product to the cart. Increments quantity if already exists.
     */
    const addToCart = (item) => {
        const existingItem = cartItem.find(ci => ci.itemId === item.itemId);
        if (existingItem) {
            setCartItem(
                cartItem.map(ci =>
                    ci.itemId === item.itemId
                        ? { ...ci, quantity: ci.quantity + 1 }
                        : ci
                )
            );
        } else {
            setCartItem([...cartItem, { ...item, quantity: 1 }]);
        }
    };

    /**
     * Remove an item entirely from the cart.
     */
    const removeFormCart = (itemId) => {
        setCartItem(cartItem.filter(item => item.itemId !== itemId));
    }

    /**
     * Update quantity of a specific item in the cart.
     */
    const updateQuantity = (itemId, newQuantity) => {
        setCartItem(cartItem.map(item => item.itemId === itemId ? {...item, quantity: newQuantity}: item));
    }

    /**
     * Update discount of a specific item in the cart.
     */
    const updateItemDiscount = (itemId, discount) => {
        setCartItem(cartItem.map(item => item.itemId === itemId ? {...item, discount: parseFloat(discount || 0)}: item));
    }

    /**
     * Helper to set JWT token and role in localStorage and context state.
     */
    const setAuthData = (token, role) => {
        if (!token) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            setAuth({ token: null, role: null });
        } else {
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);
            setAuth({ token, role });
        }
    };

    useEffect(() => {

        async function LoadData() {
            try {

                // FIXED: correct localStorage usage + typo fixed
                if (
                    localStorage.getItem("token") &&
                    localStorage.getItem("role")
                ) {
                    setAuthData(
                        localStorage.getItem("token"),
                        localStorage.getItem("role")
                    );
                }

                const response = await fetchCategories(auth.token);
                const itemResponse = await fetchItems(auth.token);
                
                try {
                    const profileResponse = await fetchUserProfile();
                    setShopProfile(profileResponse.data);
                } catch (profileErr) {
                    console.log("Could not load user profile:", profileErr);
                }

                setCategories(response.data);
                setItemData(itemResponse.data);

            } catch (err) {
                console.log(err);
            }
        }

        if (auth.token) {
            LoadData();
            refreshSubscriptionStatus();
            refreshUnreadCount();
        }

    }, [auth.token]);

    const clearCart = () =>{
        setCartItem([]);
    }

    const [editingCategory, setEditingCategory] = useState(null);
    const [editingItem, setEditingItem] = useState(null);

    const contextValue = {
        categories,
        setCategories,
        auth,
        setAuthData,
        itemData,
        setItemData,
        addToCart,
        cartItem,
        removeFormCart,
        updateQuantity,
        updateItemDiscount,
        clearCart,
        headerName,
        favicon,
        updateBranding,
        orderDetails,
        setOrderDetails,
        showPopup,
        setShowPopup,
        editingCategory,
        setEditingCategory,
        editingItem,
        setEditingItem,
        shopProfile,
        setShopProfile,
        settings,
        updateSettings,
        theme,
        toggleTheme,
        subscriptionInfo,
        refreshSubscriptionStatus,
        unreadNotifCount,
        setUnreadNotifCount,
        refreshUnreadCount,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {props.children}
        </AppContext.Provider>
    );
};