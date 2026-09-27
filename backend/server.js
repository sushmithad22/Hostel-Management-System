const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hostel Management System Backend Running");
});

// Add Hostel
app.post("/hostels", async (req, res) => {
    try {
        const { hostel_name, hostel_type, total_rooms } = req.body;

        const result = await db.query(
            "INSERT INTO hostels (hostel_name, hostel_type, total_rooms) VALUES ($1, $2, $3) RETURNING *",
            [hostel_name, hostel_type, total_rooms]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Add Room
app.post("/rooms", async (req, res) => {
    try {
        const { hostel_id, room_number, capacity } = req.body;

        const result = await db.query(
            "INSERT INTO rooms (hostel_id, room_number, capacity) VALUES ($1, $2, $3) RETURNING *",
            [hostel_id, room_number, capacity]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Get Rooms
app.get("/rooms", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM rooms ORDER BY room_id");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Room
app.put("/rooms/:id", async (req, res) => {
    try {
        const { room_number, capacity } = req.body;

        const result = await db.query(
            "UPDATE rooms SET room_number = $1, capacity = $2 WHERE room_id = $3 RETURNING *",
            [room_number, capacity, req.params.id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Delete Room
app.delete("/rooms/:id", async (req, res) => {
    try {
        await db.query(
            "DELETE FROM rooms WHERE room_id = $1",
            [req.params.id]
        );

        res.json({ message: "Room deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Allocate Room
app.post("/allocations", async (req, res) => {
    try {
        const { room_id, student_id } = req.body;

        const result = await db.query(
            "INSERT INTO room_allocations (room_id, student_id) VALUES ($1, $2) RETURNING *",
            [room_id, student_id]
        );

        await db.query(
            "UPDATE rooms SET occupied_count = occupied_count + 1 WHERE room_id = $1",
            [room_id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Change Room Allocation
app.put("/allocations/:id", async (req, res) => {
    try {
        const { room_id } = req.body;

        const oldAllocation = await db.query(
            "SELECT room_id FROM room_allocations WHERE allocation_id = $1",
            [req.params.id]
        );

        const oldRoomId = oldAllocation.rows[0].room_id;

        await db.query(
            "UPDATE room_allocations SET room_id = $1 WHERE allocation_id = $2",
            [room_id, req.params.id]
        );

        await db.query(
            "UPDATE rooms SET occupied_count = occupied_count - 1 WHERE room_id = $1",
            [oldRoomId]
        );

        await db.query(
            "UPDATE rooms SET occupied_count = occupied_count + 1 WHERE room_id = $1",
            [room_id]
        );

        res.json({ message: "Room allocation changed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Vacate Room
app.put("/allocations/:id/vacate", async (req, res) => {
    try {
        const result = await db.query(
            "UPDATE room_allocations SET vacate_date = CURRENT_DATE WHERE allocation_id = $1 RETURNING *",
            [req.params.id]
        );

        await db.query(
            "UPDATE rooms SET occupied_count = occupied_count - 1 WHERE room_id = $1",
            [result.rows[0].room_id]
        );

        res.json({
            message: "Room vacated successfully",
            allocation: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// View Available and Occupied Rooms
app.get("/rooms/status", async (req, res) => {
    try {
        const result = await db.query(`
            SELECT *,
            CASE
                WHEN occupied_count < capacity THEN 'Available'
                ELSE 'Occupied'
            END AS status
            FROM rooms
            ORDER BY room_id
        `);

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// View Hostels
app.get("/hostels", async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM hostels ORDER BY hostel_id"
        );

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});