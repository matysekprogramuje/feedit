package io.github.feeditbackend;

import java.util.ArrayList;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.feeditbackend.objects.Feedback;


@RestController
@RequestMapping("api/admin")
public class AdminController {

    @GetMapping("/get")
    public ArrayList<Feedback> get() {
        return FeeditbackendApplication.feedbacks;
    }
    
    
}
