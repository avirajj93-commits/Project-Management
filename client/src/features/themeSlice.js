import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: "light",
};

const applyThemeClass = (theme) => {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            const theme = state.theme === "light" ? "dark" : "light";
            localStorage.setItem("theme", theme);
            applyThemeClass(theme);
            state.theme = theme;
        },
        setTheme: (state, action) => {
            const theme = action.payload;
            localStorage.setItem("theme", theme);
            applyThemeClass(theme);
            state.theme = theme;
        },
        loadTheme: (state) => {
            const storedTheme = localStorage.getItem("theme");
            const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            const theme = storedTheme || preferredTheme;
            state.theme = theme;
            applyThemeClass(theme);
        },
    },
});

export const { toggleTheme, setTheme, loadTheme } = themeSlice.actions;
export default themeSlice.reducer;