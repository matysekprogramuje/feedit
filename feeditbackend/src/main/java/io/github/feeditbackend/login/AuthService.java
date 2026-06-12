package io.github.feeditbackend.login;

import java.io.*;
import java.util.*;

public class AuthService {

    private final String FILE = "loginData.csv";

    // REGISTER
    public String register(String username, String email, String password) {

        try {
            List<String[]> users = readCSV();

            for (String[] u : users) {
                if (u[0].equals(username)) {
                    return "USER EXISTS";
                }
            }

            FileWriter fw = new FileWriter(FILE, true);

            if (new File(FILE).length() == 0) {
                fw.write("username,email,password\n");
            }

            fw.write(username + "," + email + "," + password + "," +  "false" + "\n");
            fw.close();

            return "REGISTER OK";

        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    // LOGIN
    public String login(String username, String password) {

        try {
            List<String[]> users = readCSV();
            System.out.println(users.size());


            for (String[] user : users) {

                String storedUsername = user[0];
                String storedPassword = user[2];

                if (storedUsername.equalsIgnoreCase(username)) {

                    if (storedPassword.equals(password)) {
                        return "LOGIN OK";
                    } else {
                        return "WRONG PASSWORD";
                    }
                }
            }

            return "USER NOT FOUND";

        } catch (Exception e) {
            return "ERROR";
        }
    }

    // READ CSV
    private List<String[]> readCSV() throws FileNotFoundException {

        File file = new File(FILE);

        Scanner sc = new Scanner(file);

        List<String[]> data = new ArrayList<String[]>();
        String line = "";

        while (sc.hasNextLine()) {
            line = sc.nextLine();
            data.add(line.split(","));
            System.out.println(line);
        }

        sc.close();
        return data;
    }
}