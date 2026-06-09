package io.github.feeditbackend;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.feeditbackend.objects.Feedback;



@RestController
@RequestMapping("api/admin")
public class AdminController {

    @GetMapping("/getFeedback")
    public ArrayList<Feedback> getFeedback() {
        return FeeditbackendApplication.feedbacks;
    }

    @GetMapping("/getAmount")
    public String getAmount() {
        return String.valueOf(FeeditbackendApplication.feedbacks.size());
    }

    @GetMapping("/getTotalRating")
    public String getTotalRating() {
        return String.valueOf(FeeditbackendApplication.feedbacks.stream()
            .mapToInt(f -> f.rating)
            .sum()
            /FeeditbackendApplication.feedbacks.size()
        );
    }
    
    
    
}
