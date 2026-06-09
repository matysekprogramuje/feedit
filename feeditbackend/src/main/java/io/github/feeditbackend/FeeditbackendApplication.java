package io.github.feeditbackend;

import java.util.ArrayList;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.feeditbackend.objects.Feedback;

@SpringBootApplication
public class FeeditbackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(FeeditbackendApplication.class, args);
	}


	//temp
	public static final ArrayList<Feedback> feedbacks = new ArrayList<>();
}
