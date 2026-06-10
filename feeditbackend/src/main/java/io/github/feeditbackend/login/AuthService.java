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

            fw.write(username + "," + email + "," + password + "\n");
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

            for (String[] u : users) {

                if (u[0].equals(username)) {

                    if (u[2].equals(password)) {
                        return "LOGIN OK";
                    } else {
                        return "WRONG PASSWORD";
                    }
                }
            }

            return "USER NOT FOUND";

        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    // READ CSV
    private List<String[]> readCSV() throws IOException {

        File file = new File(FILE);

        if (!file.exists()) file.createNewFile();

        BufferedReader br = new BufferedReader(new FileReader(file));

        List<String[]> data = new ArrayList<String[]>();
        String line;

        boolean first = true;

        while ((line = br.readLine()) != null) {

            if (first && line.startsWith("username")) {
                first = false;
                continue;
            }

            first = false;

            data.add(line.split(","));
        }

        br.close();
        return data;
    }
}