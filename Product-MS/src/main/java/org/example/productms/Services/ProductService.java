package org.example.productms.Services;

import org.example.productms.Entities.Product;
import org.example.productms.Repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        existing.setName(productDetails.getName());
        existing.setDescription(productDetails.getDescription());
        existing.setPrice(productDetails.getPrice());
        existing.setStockQuantity(productDetails.getStockQuantity());
        existing.setImageUrl(productDetails.getImageUrl());
        existing.setCategory(productDetails.getCategory());
        existing.setBrand(productDetails.getBrand());
        return productRepository.save(existing);
    }

    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    public Page<Product> searchProducts(String name, String category, String brand,
                                        Double minPrice, Double maxPrice,
                                        Boolean inStock, Pageable pageable) {
        return productRepository.searchProducts(name, category, brand, minPrice, maxPrice, inStock, pageable);
    }

    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
                .map(Product::getCategory)
                .distinct()
                .filter(c -> c != null && !c.isBlank())
                .toList();
    }

    public List<String> getAllBrands() {
        return productRepository.findAll().stream()
                .map(Product::getBrand)
                .distinct()
                .filter(b -> b != null && !b.isBlank())
                .toList();
    }
    public void decreaseStock(Long productId, int quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Stock insuffisant pour: " + product.getName());
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
        System.out.println("✅ Stock updated: " + product.getName()
                + " → " + product.getStockQuantity() + " remaining");
    }
}
