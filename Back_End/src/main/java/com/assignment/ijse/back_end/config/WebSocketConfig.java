package com.assignment.ijse.back_end.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");           // STOMP broker prefix
        config.setApplicationDestinationPrefixes("/app"); // messages sent by clients
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Change endpoint path
        registry.addEndpoint("/claimright-web-socket/ws-chat")
                .setAllowedOriginPatterns("*") // allow any origin for dev
                .withSockJS();                 // SockJS fallback
    }


}

