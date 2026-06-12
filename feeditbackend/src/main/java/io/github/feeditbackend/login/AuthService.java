package io.github.feeditbackend.login;


import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

import org.mindrot.jbcrypt.BCrypt;

public class AuthService {

    private final String FILE = "feeditbackend/src/main/java/io/github/feeditbackend/login/loginData.csv";

    // REGISTER
    public String register(String username, String email, String number, String password) {

        try {
            List<String[]> users = readCSV();

            for (String[] u : users) {
                if (u[0].equals(username)) {
                    return "USER EXISTS";
                }
            }
    
            try (FileWriter fw = new FileWriter(FILE, true)) {
                String hash = BCrypt.hashpw(password, BCrypt.gensalt());
                fw.write(username + "," + email + "," + number + "," + hash + "," +  "false" + "\n");
            }

            return "REGISTER OK";

        } catch (IOException e) {
            return "ERROR: " + e.getMessage();
        }
    }

    // LOGIN
    public String login(String username, String password) {

        try {
            List<String[]> users = readCSV();

            for (String[] user : users) {

                String storedUsername = user[0];
                String storedPassword = user[3];
                boolean admin = Boolean.parseBoolean(user[4]);

                if (storedUsername.equalsIgnoreCase(username)) {

                    if (BCrypt.checkpw(password, storedPassword)) {
                        if (admin) {
                            return "LOGIN OK ADMIN";
                        } else {
                            return "LOGIN OK USER";
                        }
                    }
                }
            }

            return "USER NOT FOUND";

        } catch (IOException e) {
            return "ERROR";
        }
    }

    // READ CSV
    private List<String[]> readCSV() throws FileNotFoundException {

        File file = new File(FILE);
        if(!file.exists()) {
            try {
                file.createNewFile();
            } 
            catch (IOException e) {}
        }

        try(FileWriter fw = new FileWriter(FILE, true)) {
            if(file.length() == 0) {
                fw.write("username,email,number,password,isAdmin\n");
                fw.write("admin,admin@email.com,N/A,$2a$10$NSwPCXsL8iNYpFd.8Ju.h.RPnRC.MEVddVdAdIklcWTNXFWk2Ho6G,false\n");
                fw.write("customer,customer@email.com,N/A,$2a$10$AZt.FJVhfgSRzrikU7GxSOpPQst6s/DH7WF63i1F73afSR1YzwlfO,false\n");
            }
        } 
        catch (IOException e) {}

        List<String[]> data;
        try (Scanner sc = new Scanner(file)) {
            data = new ArrayList<>();
            String line;
            while (sc.hasNextLine()) {
                line = sc.nextLine();
                data.add(line.split(","));
            }
        }
        return data;
    }
}