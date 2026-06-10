package io.github.feeditbackend.data;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import io.github.feeditbackend.objects.Feedback;

public class Data {

    public static final String FEEDBACK_DATABASE = "feeditbackend/src/main/java/io/github/feeditbackend/data/feedback.csv";
    public static List<Feedback> feedbacks = new ArrayList<>();

    public static void loadFeedback() {
        	try(Scanner scanner = new Scanner(new File(FEEDBACK_DATABASE));) {
			ArrayList<String> read = new ArrayList<>();
			while(scanner.hasNextLine()) 
				read.add(scanner.nextLine());
			
			feedbacks = new ArrayList<>(read.stream()
                .skip(1)
                .map(f -> f.split("\\|"))
                .map(f -> new Feedback(f[0], f[1], f[2], f[3], Integer.parseInt(f[4]), Integer.parseInt(f[5]), LocalDate.parse(f[6]), Boolean.parseBoolean(f[7]), Boolean.parseBoolean(f[8])))
                .toList()
            );
		} catch (Exception e) {}
    }

    public static boolean addFeedback(Feedback f) {
        f.name = f.name.replace("|", "/");
        f.email = f.email.replace("|", "/");
        f.comment = f.comment.replace("|", "/").replaceAll("\\r\\n|\\r|\\n", " ");
        feedbacks.add(f);

        try (FileWriter writer = new FileWriter(FEEDBACK_DATABASE, true)) {
            writer.write(System.lineSeparator());
            writer.write(
                new StringBuilder()
                .append(f.name)
                .append('|')
                .append(f.email)
                .append('|')
                .append(f.number)
                .append('|')
                .append(f.comment)
                .append('|')
                .append(f.rating)
                .append('|')
                .append(f.category)
                .append('|')
                .append(f.date)
                .append('|')
                .append(f.wantsContact)
                .append('|')
                .append(f.resolved)
                .toString()
            );
        } catch (IOException e) {
            return false;
        }
        return true;
    }

    
}
