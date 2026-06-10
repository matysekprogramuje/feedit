package io.github.feeditbackend;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import io.github.feeditbackend.data.Data;
import io.github.feeditbackend.objects.Feedback;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/admin")
public class AdminController {

    @GetMapping("/getFeedback")
    public List<Feedback> getFeedback(@RequestParam(name="resolved", defaultValue="false") boolean resolved, @RequestParam(name="rating", defaultValue="0") int rating, @RequestParam(name="category", defaultValue="0") int category) {
        List<Feedback> list = Data.feedbacks.stream()
        .filter(f -> resolved || f.resolved == resolved)
        .filter(f -> rating == 0 || f.rating == rating)
        .filter(f -> category == 0 || f.category == category)
        .toList();
        
        return list;
    }

    @GetMapping("/getAmount")
    public String getAmount() {
        return String.valueOf(Data.feedbacks.size());
    }

    @GetMapping("/getTotalRating")
    public String getTotalRating() {
        double avg = Data.feedbacks.stream()
            .mapToDouble(f -> f.rating)
            .sum()
            /(double)Data.feedbacks.size();
        avg = Math.round(avg * 100) / 100.0;

        return String.valueOf(avg);
    }
    
    
    
}
