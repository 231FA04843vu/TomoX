import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  build: {
    // Enable minification with terser
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      }
    },
    // Optimize chunk size with manual chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separate socket.io for real-time features
          'socket': ['socket.io-client'],
          // UI libraries
          'swiper-ui': ['swiper'],
        },
        // Optimize chunk filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      }
    },
    // Disable source maps in production for smaller bundle
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: 'lightningcss',
    // Target modern browsers for better performance
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 800,
    // Disable brotli/gzip size reporting for faster builds
    reportCompressedSize: false,
    // Enable module preloading
    modulePreload: {
      polyfill: true
    }
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'socket.io-client'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  // Server optimizations
  server: {
    // Enable HTTP/2
    https: false,
    // Faster HMR
    hmr: {
      overlay: true
    },
    // Watch options for better performance
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**']
    }
  },
  // Preview server optimizations
  preview: {
    port: 4173,
    strictPort: true,
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    }
  }
})
