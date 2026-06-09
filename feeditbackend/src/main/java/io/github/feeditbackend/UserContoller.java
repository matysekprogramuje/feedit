package io.github.feeditbackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.feeditbackend.objects.Feedback;


@RestController
@RequestMapping("api/user")
public class UserContoller {

    @PostMapping("/sendFeedback")
    public ResponseEntity<Feedback> sendFeedback(@RequestBody Feedback entity) {
        FeeditbackendApplication.feedbacks.add(entity);

        return ResponseEntity.ok(entity);
    }
    
    
}
