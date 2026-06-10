package io.github.feeditbackend.objects;

import java.util.Date;

public class Feedback {

    public String name, email, number, comment;
    public int rating, category;
    public Date date;
    public boolean wantsContact, resolved;

    public Feedback() {
        //empty
    }

    public Feedback(String name, String email, String number, String comment, int rating, int category, Date date, boolean wantsContact, boolean resolved) {
        this.name = name;
        this.email = email;
        this.number = number;
        this.comment = comment;
        this.rating = rating;
        this.category = category;
        this.date = date;
        this.wantsContact = wantsContact;
        this.resolved = resolved;
    }
    
}
