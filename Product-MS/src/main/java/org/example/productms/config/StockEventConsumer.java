package org.example.productms.config;


import org.example.productms.config.RabbitMQConfig;
import org.example.productms.Services.ProductService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class StockEventConsumer {

    @Autowired
    private ProductService productService;

    @RabbitListener(queues = RabbitMQConfig.STOCK_QUEUE)
    public void handleStockDecrease(StockEvent event) {
        try {
            Long productId = Long.parseLong(event.getProduitId());
            productService.decreaseStock(productId, event.getQuantite());
            System.out.println("✅ [RabbitMQ] Stock decreased for product "
                    + event.getProduitId() + " by " + event.getQuantite());
        } catch (Exception e) {
            System.err.println("❌ [RabbitMQ] Stock decrease failed: " + e.getMessage());
        }
    }
}
