/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        // 主品牌色：墨绿（自然旅居）
        forest: {
          50: "#F2F7F4",
          100: "#DDE9E1",
          200: "#B6CFBE",
          300: "#7FAA8C",
          400: "#4D8064",
          500: "#1F4D3F",
          600: "#193E33",
          700: "#132F27",
          800: "#0E211B",
          900: "#08130F",
        },
        // 辅色：橘色（温暖灯光）
        amber2: {
          50: "#FDF5EC",
          100: "#FBE8D2",
          200: "#F7CFA6",
          300: "#F2A65A",
          400: "#E8893A",
          500: "#CF6E22",
        },
        // 背景：米白
        cream: "#F5F1E8",
      },
      fontFamily: {
        // 衬线标题字体
        display: ["Fraunces", "Georgia", "serif"],
        // 无衬线正文字体
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -8px rgba(31, 77, 63, 0.18)",
        card: "0 2px 12px -4px rgba(31, 77, 63, 0.12)",
      },
      keyframes: {
        // 选中床位的脉冲动画
        pulseRing: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(242, 166, 90, 0.6)" },
          "50%": { boxShadow: "0 0 0 8px rgba(242, 166, 90, 0)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.6s ease-out infinite",
      },
    },
  },
  plugins: [],
};
