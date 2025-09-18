package com.assignment.ijse.back_end.util;

import com.assignment.ijse.back_end.service.FoundItemService;
import com.assignment.ijse.back_end.service.LostItemService;
import com.assignment.ijse.back_end.service.impl.LostItemServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TimeScheduler {
    private final LostItemService lostItemService;
    private final FoundItemService foundItemService;

    // Runs every day at midnight
    @Scheduled(cron = "0 0 0 1 * ?")
    public void cleanupExpiredItems() {
        System.out.println("Scheduled task running: Cleaning up expired items...");
        lostItemService.deleteExpiredItems();
        foundItemService.deleteExpiredItems();
    }

//    @Scheduled(cron = "0 * * * * ?") // Minute by minute
//    public void cleanupExpiredItems() {
//        System.out.println("Scheduled task running: Cleaning up expired items...");
//    }


}
