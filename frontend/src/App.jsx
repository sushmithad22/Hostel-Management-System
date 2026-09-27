import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [rooms, setRooms] = useState([]);
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [hostelId] = useState("1");
  const [hostelName, setHostelName] = useState("");
const [hostelType, setHostelType] = useState("");
const [totalRooms, setTotalRooms] = useState("");

  const [editRoom, setEditRoom] = useState(null);
  const [editCapacity, setEditCapacity] = useState("");
  const [studentId, setStudentId] = useState("");
const [allocationRoomId, setAllocationRoomId] = useState("");
const [allocationId, setAllocationId] = useState("");

  // Start Edit
  const startEdit = (room) => {
    setEditRoom(room);
    setEditCapacity(room.capacity);
  };

  // Update Room
  const updateRoom = () => {
    fetch(`http://localhost:5000/rooms/${editRoom.room_id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        room_number: editRoom.room_number,
        capacity: Number(editCapacity),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms(
          rooms.map((room) =>
            room.room_id === data.room_id
              ? {
                  ...data,
                  status:
                    data.occupied_count < data.capacity
                      ? "Available"
                      : "Occupied",
                }
              : room
          )
        );

        setEditRoom(null);
        setEditCapacity("");
      })
      .catch((error) => console.log(error));
  };
  const allocateRoom = () => {
  fetch("http://localhost:5000/allocations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_id: Number(allocationRoomId),
      student_id: Number(studentId),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Room allocated:", data);
      setRooms(
  rooms.map((room) =>
    room.room_id === Number(allocationRoomId)
      ? {
          ...room,
          occupied_count: room.occupied_count + 1,
          status:
            room.occupied_count + 1 < room.capacity
              ? "Available"
              : "Occupied",
        }
      : room
  )
);
      setStudentId("");
      setAllocationRoomId("");
    })
    .catch((error) => console.log(error));
};
const changeAllocation = () => {
  fetch(`http://localhost:5000/allocations/${allocationId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      room_id: Number(allocationRoomId),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Allocation changed:", data);
      setAllocationId("");
      setAllocationRoomId("");
    })
    .catch((error) => console.log(error));
};
// Vacate Room
const vacateRoom = () => {
  fetch(`http://localhost:5000/allocations/${allocationId}/vacate`, {
    method: "PUT",
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Room vacated:", data);
      setAllocationId("");
    })
    .catch((error) => console.log(error));
};
const addHostel = () => {
  fetch("http://localhost:5000/hostels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      hostel_name: hostelName,
      hostel_type: hostelType,
      total_rooms: Number(totalRooms),
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Hostel added:", data);

      setHostelName("");
      setHostelType("");
      setTotalRooms("");
    })
    .catch((error) => console.log(error));
};

  // Add Room
  const addRoom = () => {
    fetch("http://localhost:5000/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        hostel_id: hostelId,
        room_number: roomNumber,
        capacity: Number(capacity),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRooms([...rooms, { ...data, status: "Available" }]);
        setRoomNumber("");
        setCapacity("");
      })
      .catch((error) => console.log(error));
  };

  // Delete Room
  const deleteRoom = (id) => {
    fetch(`http://localhost:5000/rooms/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        setRooms(rooms.filter((room) => room.room_id !== id));
      })
      .catch((error) => console.log(error));
  };

  // Get Rooms
  useEffect(() => {
    fetch("http://localhost:5000/rooms/status")
      .then((res) => res.json())
      .then((data) => setRooms(data))
      .catch((error) => console.log(error));
  }, []);

  return (
    <div>
      <h1>Hostel Management System</h1>
      <h2>Room Management</h2>

      <div>
        <div>
  <h3>Hostel Details</h3>

  <input
  type="text"
  placeholder="Hostel Name"
  value={hostelName}
  onChange={(e) => setHostelName(e.target.value)}
/>

  <input
  type="text"
  placeholder="Hostel Type"
  value={hostelType}
  onChange={(e) => setHostelType(e.target.value)}
/>

  <input
  type="number"
  placeholder="Total Rooms"
  value={totalRooms}
  onChange={(e) => setTotalRooms(e.target.value)}
/>

  <button onClick={addHostel}>Add Hostel</button>
</div>
        <h3>Add Room</h3>

        <input
          type="text"
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
        />

        <input
          type="number"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button onClick={addRoom}>Add Room</button>
      </div>
      <div>
  <h3>Allocate Room</h3>

  <input
    type="number"
    placeholder="Student ID"
    value={studentId}
    onChange={(e) => setStudentId(e.target.value)}
  />

  <input
    type="number"
    placeholder="Room ID"
    value={allocationRoomId}
    onChange={(e) => setAllocationRoomId(e.target.value)}
  />

  <button onClick={allocateRoom}>Allocate Room</button>
</div>
<div>
  <h3>Change Room Allocation</h3>

  <input
    type="number"
    placeholder="Allocation ID"
    value={allocationId}
    onChange={(e) => setAllocationId(e.target.value)}
  />

  <input
    type="number"
    placeholder="New Room ID"
    value={allocationRoomId}
    onChange={(e) => setAllocationRoomId(e.target.value)}
  />

  <button onClick={changeAllocation}>Change Room</button>
</div>
<div>
  <h3>Vacate Room</h3>

  <input
    type="number"
    placeholder="Allocation ID"
    value={allocationId}
    onChange={(e) => setAllocationId(e.target.value)}
  />

  <button onClick={vacateRoom}>Vacate Room</button>
</div>
      {editRoom && (
        <div>
          <h3>Edit Room</h3>

          <input
            type="number"
            value={editCapacity}
            onChange={(e) => setEditCapacity(e.target.value)}
          />

          <button onClick={updateRoom}>Save Update</button>
        </div>
      )}

      <h3>Rooms</h3>

      {rooms.map((room) => (
        <div key={room.room_id}>
          <p>
            ID: {room.room_id} |Room: {room.room_number} | Capacity: {room.capacity} | Occupied:{" "}
            {room.occupied_count} | Status: {room.status}
          </p>

          <button onClick={() => deleteRoom(room.room_id)}>
            Delete
          </button>

          <button onClick={() => startEdit(room)}>
            Edit
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;