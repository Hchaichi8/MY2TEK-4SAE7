package org.example.ms_commandes.Feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.Map;


@FeignClient(name = "USERMICROSERVICE", fallback = UserClientFallback.class)
public interface UserClient {

    @GetMapping("/users/all")
    List<Map<String, Object>> getAllUsers();
}
