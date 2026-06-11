package io.github.feeditbackend.login;




import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
public class AuthController {

    private final AuthService service = new AuthService();

    @PostMapping("/auth/login")
    public String login(@RequestBody AuthRequest req) {
        return service.login(req.username, req.password);
    }

    @PostMapping("/auth/register")
    public String register(@RequestBody AuthRequest req) {
        return service.register(req.username, req.email, req.password);
    }
}