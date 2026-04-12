package org.example.ms_commandes.Feign;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@FeignClient(name = "ProductMicroService", fallback = ProductClientFallback.class)
public interface ProductClient {

    @GetMapping("/products/feign/{id}")
    Map<String, Object> getProduct(@PathVariable("id") Long id);
}
