package com.app.server.services;

import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

@Service
public class EmailService {

    @Value("${mailgun.api.key}")
    private String apiKey;

    @Value("${mailgun.domain}")
    private String domain;

    private String subjectNewsletter = "The travel companion newsletter";
    private String textNewsletter = "Hello, welcome to your newsletter confirmation";

    private String subjectInvite = "Invitation to your travel companion";
    private String textInvite = "Click the link to join your travel companion on trip: ";

    public String sendNewsletterMessage(String to) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost post = new HttpPost("https://api.mailgun.net/v3/" + domain + "/messages");
        post.setHeader("Authorization",
                "Basic " + java.util.Base64.getEncoder().encodeToString(("api:" + apiKey).getBytes()));
        post.setHeader("Content-Type", "application/x-www-form-urlencoded");
        StringEntity params = new StringEntity(
                "from=" + "Excited User <mailgun@" + domain + ">" +
                        "&to=" + to +
                        "&subject=" + this.subjectNewsletter +
                        "&text=" + this.textNewsletter);
        post.setEntity(params);
        org.apache.http.HttpResponse response = httpClient.execute(post);
        return EntityUtils.toString(response.getEntity());
    }

    public String sendInviteMessage(String to, String url) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost post = new HttpPost("https://api.mailgun.net/v3/" + domain + "/messages");
        post.setHeader("Authorization",
                "Basic " + java.util.Base64.getEncoder().encodeToString(("api:" + apiKey).getBytes()));
        post.setHeader("Content-Type", "application/x-www-form-urlencoded");
        StringEntity params = new StringEntity(
                "from=" + "Excited User <mailgun@" + domain + ">" +
                        "&to=" + to +
                        "&subject=" + this.subjectInvite +
                        "&text=" + this.textInvite + url);
        post.setEntity(params);
        org.apache.http.HttpResponse response = httpClient.execute(post);
        return EntityUtils.toString(response.getEntity());
    }

    // 	public static JsonNode sendSimpleMessage() throws UnirestException {
	// 	HttpResponse<JsonNode> request = Unirest.post("https://api.mailgun.net/v3/" + YOUR_DOMAIN_NAME + "/messages"),
	// 		.basicAuth("api", API_KEY)
	// 		.queryString("from", "Excited User <USER@YOURDOMAIN.COM>")
	// 		.queryString("to", "artemis@example.com")
	// 		.queryString("subject", "hello")
	// 		.queryString("text", "testing")
	// 		.asJson();
	// 	return request.getBody();
	// }
}
