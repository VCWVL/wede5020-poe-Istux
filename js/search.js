// Product Search and Filter functionality
class ProductSearch {
    constructor() {
        this.searchInput = document.getElementById('productSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.clearButton = document.getElementById('clearSearch');
        this.searchResults = document.getElementById('searchResults');
        this.allProducts = this.getAllProducts();
        
        this.init();
    }
    
    init() {
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.categoryFilter.addEventListener('change', this.handleSearch.bind(this));
        this.clearButton.addEventListener('click', this.clearSearch.bind(this));
    }
    
    getAllProducts() {
        const products = [];
        const productRows = document.querySelectorAll('tr[data-name]');
        
        productRows.forEach(row => {
            products.push({
                element: row,
                name: row.dataset.name.toLowerCase(),
                category: row.dataset.category,
                text: row.textContent.toLowerCase()
            });
        });
        
        return products;
    }
    
    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase().trim();
        const selectedCategory = this.categoryFilter.value;
        
        let results = this.allProducts;
        
        // Filter by search term
        if (searchTerm) {
            results = results.filter(product => 
                product.name.includes(searchTerm) || 
                product.text.includes(searchTerm)
            );
        }
        
        // Filter by category
        if (selectedCategory !== 'all') {
            results = results.filter(product => product.category === selectedCategory);
        }
        
        this.displayResults(results, searchTerm, selectedCategory);
    }
    
    displayResults(results, searchTerm, selectedCategory) {
        // Hide all products first
        this.allProducts.forEach(product => {
            product.element.style.display = 'none';
        });
        
        // Show matching results
        results.forEach(product => {
            product.element.style.display = '';
        });
        
        // Update results counter
        this.updateResultsCounter(results.length, searchTerm, selectedCategory);
    }
    
    updateResultsCounter(count, searchTerm, selectedCategory) {
        let message = '';
        
        if (searchTerm && selectedCategory !== 'all') {
            message = `Found ${count} products in "${selectedCategory}" matching "${searchTerm}"`;
        } else if (searchTerm) {
            message = `Found ${count} products matching "${searchTerm}"`;
        } else if (selectedCategory !== 'all') {
            message = `Showing ${count} products in "${selectedCategory}"`;
        } else {
            message = `Showing all ${count} products`;
        }
        
        this.searchResults.textContent = message;
        this.searchResults.style.padding = '10px';
        this.searchResults.style.background = 'rgba(46, 139, 87, 0.2)';
        this.searchResults.style.borderRadius = '4px';
        this.searchResults.style.margin = '10px 0';
    }
    
    clearSearch() {
        this.searchInput.value = '';
        this.categoryFilter.value = 'all';
        this.handleSearch();
        this.searchInput.focus();
    }
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('productSearch')) {
        new ProductSearch();
    }
});