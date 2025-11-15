import {
	createContext,
	useContext,
	useState,
	useEffect,
	type ReactNode,
} from 'react';

interface ThemeContextType {
	isDark: boolean;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [isDark, setIsDark] = useState(
		window.matchMedia('(prefers-color-scheme: dark)').matches
	);

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const updateTheme = (matches: boolean) => {
			if (matches) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
			setIsDark(matches);
		};

		updateTheme(mediaQuery.matches);

		const listener = (e: MediaQueryListEvent) => updateTheme(e.matches);
		mediaQuery.addEventListener('change', listener);

		return () => mediaQuery.removeEventListener('change', listener);
	}, []);

	const toggleTheme = () => {
		// No-op: theme is controlled by browser preference
	};

	return (
		<ThemeContext.Provider value={{ isDark, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}
	return context;
};
