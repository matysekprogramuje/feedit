package io.github.feeditbackend.login;

import org.springframework.web.bind.annotation.*;

@CrossOrigin
@RestController
public class AuthController {

    AuthService service = new AuthService();

    @GetMapping("/")
    public String home() {
        return "Backend bezi";
    }

    @PostMapping("/auth")
    public String auth(@RequestBody AuthRequest req) {

        if (req.type.equals("register")) {
            return service.register(req.username, req.email, req.password);
        }

        if (req.type.equals("login")) {
            return service.login(req.username, req.password);
        }

        return "INVALID";
    }
}