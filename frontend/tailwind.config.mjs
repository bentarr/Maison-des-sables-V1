/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// La nouvelle palette stricte
				'sable': '#F7F4EB',   // Fond principal (Sable Doux)
				'charbon': '#1C1C1C', // Texte & Sombre (Charbon Profond)
				'or': '#A89060',      // Accent & Boutons (Or Brossé)
				'bleu': '#52748C',    // Liens & Info (Bleu Bassin)
				'blanc': '#FFFFFF',   // Pour les cartes sur fond sable
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],           // Lisibilité UX 2025
				serif: ['Playfair Display', 'serif'],    // Élégance Luxe
			},
			borderRadius: {
				'std': '6px', // Arrondi standard charte (4px-8px)
			}
		},
	},
	plugins: [],
}