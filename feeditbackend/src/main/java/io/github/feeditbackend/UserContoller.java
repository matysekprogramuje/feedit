package io.github.feeditbackend;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.github.feeditbackend.data.Data;
import io.github.feeditbackend.objects.Feedback;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("api/user")
public class UserContoller {

    @PostMapping("/sendFeedback")
    public ResponseEntity<Feedback> sendFeedback(@RequestBody Feedback entity) {
        Data.addFeedback(entity);

        return ResponseEntity.ok(entity);
    }
    
    
}
