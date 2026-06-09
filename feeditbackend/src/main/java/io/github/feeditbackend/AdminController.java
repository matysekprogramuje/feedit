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
        double avg = FeeditbackendApplication.feedbacks.stream()
            .mapToDouble(f -> f.rating)
            .sum()
            /(double)FeeditbackendApplication.feedbacks.size();
        avg = Math.round(avg * 100) / 100.0;

        return String.valueOf(avg);
    }
    
    
    
}
