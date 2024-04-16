package com.app.server.repositories;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import com.app.server.models.TripHeader;

@Repository
public class TripHeaderRepo {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static final String SQL_FIND_BY_USER_ID = """
            SELECT * FROM trip_headers
            WHERE user_id = ?
            """;
    public static final String SQL_FIND_BY_TRIP_ID = """
            SELECT * FROM trip_headers
            WHERE trip_id = ?
            """;
    public static final String SQL_INSERT_INTO_TRIP_HEADERS = """
            INSERT INTO trip_headers (trip_id, user_id, destination_country, latitude, longitude, trip_cover_photo, trip_name, start_date, end_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

    public static final String SQL_UPDATE_TRIP_HEADERS = """
            UPDATE trip_headers
            SET destination_country = ?, latitude = ?, longitude = ?, trip_cover_photo = ?, trip_name = ?, start_date = ?, end_date = ?
            WHERE trip_id = ?
                """;

    public static final String SQL_DELETE_FROM_TRIP_HEADERS = """
            DELETE FROM trip_headers
            WHERE trip_id = ?
            """;

    private RowMapper<TripHeader> rowMapper = (rs, rowNum) -> {
        TripHeader tripHeader = new TripHeader();
        tripHeader.setTripId(rs.getString("trip_id"));
        tripHeader.setUserId(rs.getString("user_id"));
        tripHeader.setDestinationCountry(rs.getString("destination_country"));
        tripHeader.setLatitude(rs.getDouble("latitude"));
        tripHeader.setLongitude(rs.getDouble("longitude"));
        tripHeader.setTripCoverPhoto(rs.getString("trip_cover_photo"));
        tripHeader.setTripName(rs.getString("trip_name"));
        tripHeader.setStartDate(rs.getDate("start_date"));
        tripHeader.setEndDate(rs.getDate("end_date"));
        return tripHeader;
    };

    public List<TripHeader> findAllByUserId(String userId) {
        return jdbcTemplate.query(
                SQL_FIND_BY_USER_ID,
                rowMapper,
                userId);
    }

    public TripHeader findTripHeaderByTripId(String tripId) {
        return jdbcTemplate.queryForObject(
                SQL_FIND_BY_TRIP_ID,
                rowMapper,
                tripId);
    }

    public int insert(TripHeader tripHeader) {
        return jdbcTemplate.update(
                SQL_INSERT_INTO_TRIP_HEADERS,
                tripHeader.getTripId(), tripHeader.getUserId(), tripHeader.getDestinationCountry(),
                tripHeader.getLatitude(), tripHeader.getLongitude(), tripHeader.getTripCoverPhoto(),
                tripHeader.getTripName(), tripHeader.getStartDate(), tripHeader.getEndDate());
    }

    public int update(TripHeader tripHeader) {
        return jdbcTemplate.update(
                SQL_UPDATE_TRIP_HEADERS,
                tripHeader.getDestinationCountry(), tripHeader.getLatitude(), tripHeader.getLongitude(),
                tripHeader.getTripCoverPhoto(), tripHeader.getTripName(), tripHeader.getStartDate(),
                tripHeader.getEndDate(), tripHeader.getTripId());
    }

    public int delete(String tripId) {
        return jdbcTemplate.update(
                SQL_DELETE_FROM_TRIP_HEADERS,
                tripId);
    }
}
