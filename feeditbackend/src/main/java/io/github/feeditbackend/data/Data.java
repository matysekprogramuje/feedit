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

    public static final String FEEDBACK_DATABASE = resolveDbPath();
    public static List<Feedback> feedbacks = new ArrayList<>();

    private static String resolveDbPath() {
        // Zkusí nejdřív relativní cestu od working directory
        String[] candidates = {
                "feeditbackend/src/main/java/io/github/feeditbackend/data/feedback.csv",
                "src/main/java/io/github/feeditbackend/data/feedback.csv",
                "feedback.csv"
        };

        for (String path : candidates) {
            File f = new File(path);
            if (f.exists()) {
                System.out.println("[Data] Nalezena databáze: " + f.getAbsolutePath());
                return path;
            }
        }

        File newDB = new File("feeditbackend/src/main/java/io/github/feeditbackend/data/feedback.csv");
        try {
            newDB.createNewFile();

            try (FileWriter fw = new FileWriter(new File(newDB.getAbsolutePath()), true)) {
                fw.write("name|email|number|comment|rating|category|date|wantsContact|resolved");
            }
        } 
        catch (IOException e) {
            System.out.println("ERROR: Writing to the new feedback databse failed");
        }
        return "feeditbackend/src/main/java/io/github/feeditbackend/data/feedback.csv";
    }

    public static void loadFeedback() {
        File file = new File(FEEDBACK_DATABASE);
        System.out.println("[Data] Načítám z: " + file.getAbsolutePath());
        System.out.println("[Data] Soubor existuje: " + file.exists());

        try (Scanner scanner = new Scanner(file)) {
            ArrayList<String> read = new ArrayList<>();
            while (scanner.hasNextLine())
                read.add(scanner.nextLine());

            System.out.println("[Data] Přečteno řádků: " + read.size());

            feedbacks = new ArrayList<>(read.stream()
                    .skip(1)
                    .filter(line -> !line.isBlank())
                    .map(f -> f.split("\\|"))
                    .filter(f -> f.length >= 9)
                    .map(f -> new Feedback(
                            f[0], f[1], f[2], f[3],
                            Integer.parseInt(f[4].trim()),
                            Integer.parseInt(f[5].trim()),
                            LocalDate.parse(f[6].trim()),
                            Boolean.parseBoolean(f[7].trim()),
                            Boolean.parseBoolean(f[8].trim())
                    ))
                    .toList()
            );

            System.out.println("[Data] Načteno feedbacků: " + feedbacks.size());

        } catch (Exception e) {
            System.out.println("[Data] CHYBA: " + e.getMessage());
        }
    }

    public static boolean addFeedback(Feedback f) {
        f.name    = f.name.replace("|", "/");
        f.email   = f.email != null ? f.email.replace("|", "/") : "";
        f.number  = f.number != null ? f.number : "";
        f.comment = f.comment != null
                ? f.comment.replace("|", "/").replaceAll("\\r\\n|\\r|\\n", " ")
                : "";

        feedbacks.add(f);

        try (FileWriter writer = new FileWriter(FEEDBACK_DATABASE, true)) {
            writer.write(System.lineSeparator());
            writer.write(
                    f.name       + "|" +
                            f.email      + "|" +
                            f.number     + "|" +
                            f.comment    + "|" +
                            f.rating     + "|" +
                            f.category   + "|" +
                            f.date       + "|" +
                            f.wantsContact + "|" +
                            f.resolved
            );
            System.out.println("[Data] Uložen feedback od: " + f.name);
        } catch (IOException e) {
            System.out.println("[Data] CHYBA při zápisu: " + e.getMessage());
            return false;
        }
        return true;
    }
}