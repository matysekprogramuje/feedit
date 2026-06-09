package io.github.feeditbackend.objects;

public class Feedback {

    public String name, email, number, comment;
    public int category;
    public boolean wantsContact;

    public Feedback(String name, String email, String number, String comment, int category, boolean wantsContact) {
        this.name = name;
        this.email = email;
        this.number = number;
        this.comment = comment;
        this.category = category;
        this.wantsContact = wantsContact;
    }
    
}
