package io.github.feeditbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.feeditbackend.data.Data;

@SpringBootApplication
public class FeeditbackendApplication {

	public static void main(String[] args) {
		Data.loadFeedback();

		SpringApplication.run(FeeditbackendApplication.class, args);
	}
}
